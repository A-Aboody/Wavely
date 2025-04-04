import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '../Firebase/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
           // Convert Firestore Timestamps to Date objects if they exist
           const createdAtDate = userData.createdAt?.toDate ? userData.createdAt.toDate() : null;
           const updatedAtDate = userData.updatedAt?.toDate ? userData.updatedAt.toDate() : null; // Handle potential updatedAt

          setCurrentUser({
            uid: user.uid,
            email: user.email,
            username: userData.username || user.email?.split('@')[0] || `user_${user.uid.substring(0, 5)}`,
            displayName: userData.displayName || user.displayName || user.email?.split('@')[0] || 'User',
            profileImage: userData.profileImage || '',
            bannerImage: userData.bannerImage ||
              '',
            bio: userData.bio ||
              '',
             // Ensure followers/following are initialized correctly (as arrays or numbers based on your logic)
            followers: userData.followers ??
              0, // Or userData.followers ?? []
            following: userData.following ??
              0, // Or userData.following ?? []
            // likes: userData.likes ||
            // 0, // Likes usually belong to specific items, not the user profile directly
            createdAt: createdAtDate ||
              new Date(), // Use converted date or now
            updatedAt: updatedAtDate, // Store updatedAt if available
            // ... other fields
          });
          // Update localStorage (optional)
          localStorage.setItem('profileData', JSON.stringify({
             username: userData.username,
             displayName: userData.displayName,
             profileImage: userData.profileImage,
             uid: user.uid
           }));
        } else {
          // User authenticated but no Firestore document yet - create one
          console.log(`Creating Firestore document for new user: ${user.uid}`);
          const defaultUsername = user.email?.split('@')[0] || `user_${user.uid.substring(0, 5)}`;
          const defaultDisplayName = user.displayName || user.email?.split('@')[0] || 'New User';
          const newUserProfile = {
            uid: user.uid,
            email: user.email,
            username: defaultUsername,
            displayName: defaultDisplayName,
            profileImage: user.photoURL ||
              '', // Use Firebase Auth photoURL if available
            bannerImage: '',
            bio: '',
            followers: 0, // Or []
            following: 0, // Or []
            createdAt: serverTimestamp()
          };
          try {
            await setDoc(userDocRef, newUserProfile);
            setCurrentUser({
              ...newUserProfile,
              createdAt: new Date() // Use local date for immediate state
            });
            localStorage.setItem('profileData', JSON.stringify({
                username: newUserProfile.username,
                displayName: newUserProfile.displayName,
                profileImage: newUserProfile.profileImage,
                uid: user.uid
              }));
          } catch (error) {
            console.error("Error creating user document:", error);
            setCurrentUser(null); // Handle error state
          }
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        localStorage.removeItem('profileData');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const user = auth.currentUser;
    if (!user) {
        console.error("Update Profile Error: Not authenticated");
        return false; // Indicate failure
      }
  
    try {
      const userDocRef = doc(db, 'users', user.uid);
      // *** This line handles persistence and overwriting in the DB ***
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp() // Track updates
      });
  
      // Update local state immediately
      setCurrentUser(prev => {
        if (!prev) return null;
        const updatedUser = { ...prev, ...updates };
  
         // Update localStorage if relevant fields changed
         localStorage.setItem('profileData', JSON.stringify({
            username: updatedUser.username,
            displayName: updatedUser.displayName,
            profileImage: updatedUser.profileImage,
            uid: updatedUser.uid
          }));
        return updatedUser;
      });
  
      return true; // Indicate success
    } catch (error) {
      console.error("Error updating profile in Firestore:", error);
      return false; // Indicate failure
    }
  }, []);

  // Function to get *any* user's profile data by UID from Firestore
  const getUserById = useCallback(async (userId) => {
     if (!userId) return null;
     try {
       const userDocRef = doc(db, 'users', userId);
       const userDocSnap = await getDoc(userDocRef);

       if (userDocSnap.exists()) {
         const userData = userDocSnap.data();
         const createdAtDate = userData.createdAt?.toDate ? userData.createdAt.toDate() : null;
         const updatedAtDate = userData.updatedAt?.toDate ? userData.updatedAt.toDate() : null;
          return {
            uid: userId,
            email: userData.email,
            username: userData.username || `user_${userId.substring(0,5)}`,
            displayName: userData.displayName || 'User',
            profileImage: userData.profileImage || '',
            bannerImage: userData.bannerImage || '',
            bio: userData.bio || '',
            followers: userData.followers ?? 0, // Or []
            following: userData.following ??
              0, // Or []
            createdAt: createdAtDate,
            updatedAt: updatedAtDate,
            // ... other fields
          };
        } else {
          console.log(`User document not found for UID: ${userId}`);
          return null; // User not found
       }
     } catch (error) {
        console.error("Error fetching user by ID:", error);
        return null; // Return null on error
     }
   }, []);

  return (
    <UserContext.Provider value={{ currentUser, loading, updateProfile, getUserById }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};