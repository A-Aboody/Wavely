import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '../Firebase/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  setDoc,
  writeBatch,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const UserContext = createContext();

const processUserData = (userData, userId) => {
  return {
    uid: userId,
    email: userData.email,
    username: userData.username || `user_${userId.substring(0, 5)}`,
    displayName: userData.displayName || 'User',
    profileImage: userData.profileImage || '',
    bannerImage: userData.bannerImage || '',
    bio: userData.bio || '',
    followers: userData.followers || [],
    following: userData.following || [],
    waves: userData.waves || [],
    likes: userData.likes || [],
    bookmarks: userData.bookmarks || [],
    ratingsGiven: userData.ratingsGiven || [], 
    averageRatingReceived: userData.averageRatingReceived || 0, 
    createdAt: userData.createdAt?.toDate?.() || new Date(),
    updatedAt: userData.updatedAt?.toDate?.() || null,
    lastLogin: userData.lastLogin?.toDate?.() || null
  };
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            // Load user profile and their content
            const [wavesSnap, likesSnap, bookmarksSnap, ratingsSnap] = await Promise.all([
              getDocs(query(collection(db, 'waves'), where('userId', '==', user.uid), limit(100))),
              getDocs(query(collection(db, 'likes'), where('userId', '==', user.uid))),
              getDocs(query(collection(db, 'bookmarks'), where('userId', '==', user.uid))),
              getDocs(query(collection(db, 'ratings'), where('userId', '==', user.uid)))
            ]);

            // Calculate average rating received from community waves
            const userWaves = wavesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const communityWaves = userWaves.filter(wave => wave.waveType === 'community');
            const totalRatings = communityWaves.reduce((sum, wave) => sum + (wave.averageRating || 0), 0);
            const avgRating = communityWaves.length > 0 ? totalRatings / communityWaves.length : 0;

            const userData = {
              ...userDocSnap.data(),
              waves: userWaves,
              likes: likesSnap.docs.map(doc => doc.data().waveId),
              bookmarks: bookmarksSnap.docs.map(doc => doc.data().waveId),
              ratingsGiven: ratingsSnap.docs.map(doc => ({
                waveId: doc.data().waveId,
                rating: doc.data().rating,
                timestamp: doc.data().timestamp?.toDate?.() || null
              })),
              averageRatingReceived: parseFloat(avgRating.toFixed(1))
            };

            // Update last login
            await updateDoc(userDocRef, {
              lastLogin: serverTimestamp(),
              lastLoginDevice: navigator.userAgent
            });

            const processedData = processUserData(userData, user.uid);
            setCurrentUser(processedData);
            
            // Cache essential data
            localStorage.setItem('profileData', JSON.stringify({
              username: processedData.username,
              displayName: processedData.displayName,
              profileImage: processedData.profileImage,
              uid: user.uid,
              averageRatingReceived: processedData.averageRatingReceived
            }));
          } else {
            // Create new user profile
            const defaultUserData = {
              uid: user.uid,
              email: user.email,
              username: user.email?.split('@')[0] || `user_${user.uid.substring(0, 5)}`,
              displayName: user.displayName || user.email?.split('@')[0] || 'New User',
              profileImage: user.photoURL || '',
              bannerImage: '',
              bio: '',
              followers: [],
              following: [],
              waves: [],
              likes: [],
              bookmarks: [],
              ratingsGiven: [],
              averageRatingReceived: 0,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              lastLoginDevice: navigator.userAgent
            };
            
            await setDoc(userDocRef, defaultUserData);
            const processedData = processUserData(defaultUserData, user.uid);
            setCurrentUser(processedData);
            
            localStorage.setItem('profileData', JSON.stringify({
              username: processedData.username,
              displayName: processedData.displayName,
              profileImage: processedData.profileImage,
              uid: user.uid,
              averageRatingReceived: 0
            }));
          }
        } else {
          setCurrentUser(null);
          localStorage.removeItem('profileData');
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setCurrentUser(null);
        localStorage.removeItem('profileData');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!auth.currentUser) {
      console.error("Update Profile Error: Not authenticated");
      return false;
    }

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userDocRef, updateData);

      setCurrentUser(prev => {
        if (!prev) return null;
        const updatedUser = { ...prev, ...updates };
        localStorage.setItem('profileData', JSON.stringify({
          username: updatedUser.username,
          displayName: updatedUser.displayName,
          profileImage: updatedUser.profileImage,
          uid: updatedUser.uid,
          averageRatingReceived: updatedUser.averageRatingReceived
        }));
        return updatedUser;
      });

      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  }, []);

  const followUser = useCallback(async (targetUserId) => {
    if (!currentUser?.uid || currentUser.uid === targetUserId) return false;
    
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', currentUser.uid);
      const targetUserRef = doc(db, 'users', targetUserId);
      
      batch.update(userRef, {
        following: arrayUnion(targetUserId)
      });
      batch.update(targetUserRef, {
        followers: arrayUnion(currentUser.uid)
      });
      
      await batch.commit();
      
      setCurrentUser(prev => ({
        ...prev,
        following: [...(prev.following || []), targetUserId]
      }));
      
      return true;
    } catch (error) {
      console.error("Error following user:", error);
      return false;
    }
  }, [currentUser]);

  const unfollowUser = useCallback(async (targetUserId) => {
    if (!currentUser?.uid || currentUser.uid === targetUserId) return false;
    
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', currentUser.uid);
      const targetUserRef = doc(db, 'users', targetUserId);
      
      batch.update(userRef, {
        following: arrayRemove(targetUserId)
      });
      batch.update(targetUserRef, {
        followers: arrayRemove(currentUser.uid)
      });
      
      await batch.commit();
      
      setCurrentUser(prev => ({
        ...prev,
        following: prev.following?.filter(id => id !== targetUserId) || []
      }));
      
      return true;
    } catch (error) {
      console.error("Error unfollowing user:", error);
      return false;
    }
  }, [currentUser]);

  const getUserById = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // Get user's community waves to calculate average rating
        const wavesSnap = await getDocs(
          query(
            collection(db, 'waves'), 
            where('userId', '==', userId),
            where('waveType', '==', 'community')
          )
        );
        
        const communityWaves = wavesSnap.docs.map(doc => doc.data());
        const totalRatings = communityWaves.reduce((sum, wave) => sum + (wave.averageRating || 0), 0);
        const avgRating = communityWaves.length > 0 ? totalRatings / communityWaves.length : 0;

        return {
          ...processUserData(userDocSnap.data(), userId),
          averageRatingReceived: parseFloat(avgRating.toFixed(1))
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  }, []);

  const getUserByUsername = useCallback(async (username) => {
    try {
      const q = query(
        collection(db, "users"), 
        where("username", "==", username)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
  
      const userDoc = querySnapshot.docs[0];
      
      // Get user's community waves to calculate average rating
      const wavesSnap = await getDocs(
        query(
          collection(db, 'waves'), 
          where('userId', '==', userDoc.id),
          where('waveType', '==', 'community')
        )
      );
      
      const communityWaves = wavesSnap.docs.map(doc => doc.data());
      const totalRatings = communityWaves.reduce((sum, wave) => sum + (wave.averageRating || 0), 0);
      const avgRating = communityWaves.length > 0 ? totalRatings / communityWaves.length : 0;

      return {
        ...processUserData(userDoc.data(), userDoc.id),
        averageRatingReceived: parseFloat(avgRating.toFixed(1))
      };
    } catch (error) {
      console.error("Error getting user by username:", error);
      return null;
    }
  }, []);

  const submitRating = useCallback(async (waveId, rating) => {
    if (!currentUser?.uid) {
      console.error("Submit Rating Error: Not authenticated");
      return false;
    }

    try {
      const batch = writeBatch(db);
      const waveRef = doc(db, 'waves', waveId);
      const ratingRef = doc(collection(db, 'ratings'), `${currentUser.uid}_${waveId}`);
      
      // Get the wave to verify it's a community wave
      const waveSnap = await getDoc(waveRef);
      if (!waveSnap.exists() || waveSnap.data().waveType !== 'community') {
        throw new Error("Can only rate community waves");
      }

      // Remove existing rating if it exists
      const existingRating = currentUser.ratingsGiven?.find(r => r.waveId === waveId);
      const waveData = waveSnap.data();
      let updatedRatings = [...(waveData.communityRatings || [])];
      
      if (existingRating) {
        updatedRatings = updatedRatings.filter(r => r.userId !== currentUser.uid);
      }
      
      // Add new rating
      updatedRatings.push({
        userId: currentUser.uid,
        rating: rating,
        timestamp: serverTimestamp()
      });
      
      // Calculate new average
      const averageRating = updatedRatings.reduce((sum, r) => sum + r.rating, 0) / updatedRatings.length;
      
      // Update wave with new rating
      batch.update(waveRef, {
        communityRatings: updatedRatings,
        averageRating: parseFloat(averageRating.toFixed(1))
      });
      
      // Record the rating in the ratings collection
      batch.set(ratingRef, {
        userId: currentUser.uid,
        waveId: waveId,
        rating: rating,
        timestamp: serverTimestamp()
      });
      
      await batch.commit();
      
      // Update local user state
      setCurrentUser(prev => {
        if (!prev) return null;
        
        const updatedRatingsGiven = [...(prev.ratingsGiven || [])];
        const existingRatingIndex = updatedRatingsGiven.findIndex(r => r.waveId === waveId);
        
        if (existingRatingIndex >= 0) {
          updatedRatingsGiven[existingRatingIndex] = {
            waveId,
            rating,
            timestamp: new Date()
          };
        } else {
          updatedRatingsGiven.push({
            waveId,
            rating,
            timestamp: new Date()
          });
        }
        
        return {
          ...prev,
          ratingsGiven: updatedRatingsGiven
        };
      });
      
      return true;
    } catch (error) {
      console.error("Error submitting rating:", error);
      return false;
    }
  }, [currentUser]);

  const getUserRatingForWave = useCallback((waveId) => {
    if (!currentUser?.ratingsGiven || !waveId) return null;
    const rating = currentUser.ratingsGiven.find(r => r.waveId === waveId);
    return rating ? rating.rating : null;
  }, [currentUser]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('profileData');
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    if (!auth.currentUser) return false;
    
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const [wavesSnap, likesSnap, bookmarksSnap, ratingsSnap] = await Promise.all([
          getDocs(query(collection(db, 'waves'), where('userId', '==', auth.currentUser.uid), limit(100))),
          getDocs(query(collection(db, 'likes'), where('userId', '==', auth.currentUser.uid))),
          getDocs(query(collection(db, 'bookmarks'), where('userId', '==', auth.currentUser.uid))),
          getDocs(query(collection(db, 'ratings'), where('userId', '==', auth.currentUser.uid)))
        ]);

        // Calculate average rating received from community waves
        const userWaves = wavesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const communityWaves = userWaves.filter(wave => wave.waveType === 'community');
        const totalRatings = communityWaves.reduce((sum, wave) => sum + (wave.averageRating || 0), 0);
        const avgRating = communityWaves.length > 0 ? totalRatings / communityWaves.length : 0;

        const userData = {
          ...userDocSnap.data(),
          waves: userWaves,
          likes: likesSnap.docs.map(doc => doc.data().waveId),
          bookmarks: bookmarksSnap.docs.map(doc => doc.data().waveId),
          ratingsGiven: ratingsSnap.docs.map(doc => ({
            waveId: doc.data().waveId,
            rating: doc.data().rating,
            timestamp: doc.data().timestamp?.toDate?.() || null
          })),
          averageRatingReceived: parseFloat(avgRating.toFixed(1))
        };

        const processedData = processUserData(userData, auth.currentUser.uid);
        setCurrentUser(processedData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return false;
    }
  }, []);

  const value = {
    currentUser,
    loading,
    updateProfile,
    getUserById,
    followUser,
    unfollowUser,
    getUserByUsername,
    setCurrentUser,
    logout,
    refreshUserData,
    submitRating,
    getUserRatingForWave
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;