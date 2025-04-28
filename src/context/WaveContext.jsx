import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../Firebase/firebase';

const WaveContext = createContext();

const formatTimestamp = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Just now';
  }
  const now = new Date();
  if (isNaN(now.getTime())) {
    return 'Calculating...';
  }
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 0) return `Just now`;
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const WaveProvider = ({ children }) => {
  const [waves, setWaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfileCache, setUserProfileCache] = useState({});

  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId || userProfileCache[userId]) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserProfileCache(prev => ({
          ...prev,
          [userId]: {
            displayName: userData.displayName,
            username: userData.username,
            profileImage: userData.profileImage
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, [userProfileCache]);

  const processWavesData = useCallback((rawWaves) => {
    return rawWaves.map(wave => {
      const userProfile = userProfileCache[wave.userId] || {};
      return {
        ...wave,
        displayName: userProfile.displayName || wave.displayName || 'User',
        username: userProfile.username || wave.username || 'user',
        profileImage: userProfile.profileImage || wave.profileImage || '/default-avatar.png',
        likedBy: Array.isArray(wave.likedBy) ? wave.likedBy : [],
        commentsList: Array.isArray(wave.commentsList) ? wave.commentsList : [],
        communityRatings: Array.isArray(wave.communityRatings) ? wave.communityRatings : []
      };
    });
  }, [userProfileCache]);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'waves'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const wavesData = [];
      const userIds = new Set();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId) {
          userIds.add(data.userId);
        }
        const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : null;
        wavesData.push({
          id: doc.id,
          ...data,
          createdAt: createdAtDate,
        });
      });

      await Promise.all(Array.from(userIds).map(userId => fetchUserProfile(userId)));
      
      setWaves(processWavesData(wavesData));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching waves:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile, processWavesData]);

  const addWave = async (waveData) => {
    try {
      const docRef = await addDoc(collection(db, 'waves'), {
        ...waveData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: waveData.likes ?? 0,
        comments: waveData.comments ?? 0,
        views: waveData.views ?? 0,
        likedBy: waveData.likedBy ?? [],
        commentsList: waveData.commentsList ?? [],
        communityRatings: waveData.communityRatings ?? [],
        waveType: waveData.waveType || 'personal',
        rating: waveData.rating || null,
        ratingScale: waveData.ratingScale || null,
        averageRating: waveData.averageRating || null
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding wave:", error);
      throw error;
    }
  };

  const deleteWave = async (id) => {
    try {
      await deleteDoc(doc(db, 'waves', id));
    } catch (error) {
      console.error("Error deleting wave:", error);
      throw error;
    }
  };

  const likeWave = async (id, userId) => {
    if (!userId) {
      console.warn("likeWave called without userId");
      return;
    }
    try {
      const waveRef = doc(db, 'waves', id);
      const wave = waves.find(w => w.id === id);
      const isLiked = wave && Array.isArray(wave.likedBy) && wave.likedBy.includes(userId);
      await updateDoc(waveRef, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId)
      });
    } catch (error) {
      console.error("Error liking wave:", error);
      throw error;
    }
  };

  const addComment = async (waveId, commentData) => {
    if (!commentData || !commentData.userId || !commentData.content) {
      console.error("Attempted to add invalid comment data:", commentData);
      throw new Error("Invalid comment data provided.");
    }
    try {
      const waveRef = doc(db, 'waves', waveId);
      const comment = {
        ...commentData,
        id: commentData.id || Date.now().toString(),
        timestamp: commentData.timestamp || new Date().toISOString()
      };
      await updateDoc(waveRef, {
        comments: increment(1),
        commentsList: arrayUnion(comment)
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  const addRating = async (waveId, userId, rating) => {
    try {
      const waveRef = doc(db, 'waves', waveId);
      const waveSnap = await getDoc(waveRef);
      
      if (!waveSnap.exists()) {
        throw new Error("Wave not found");
      }

      const waveData = waveSnap.data();
      
      // Check if this is a community wave
      if (waveData.waveType !== 'community') {
        throw new Error("Only community waves can be rated by users");
      }

      // Check if user already rated this wave
      const existingRatingIndex = waveData.communityRatings?.findIndex(r => r.userId === userId) ?? -1;
      
      let updatedRatings = Array.isArray(waveData.communityRatings) 
        ? [...waveData.communityRatings] 
        : [];

      if (existingRatingIndex >= 0) {
        updatedRatings[existingRatingIndex] = { userId, rating };
      } else {
        updatedRatings.push({ userId, rating });
      }

      // Calculate new average rating
      const averageRating = updatedRatings.reduce((sum, r) => sum + r.rating, 0) / updatedRatings.length;

      await updateDoc(waveRef, {
        communityRatings: updatedRatings,
        averageRating: parseFloat(averageRating.toFixed(1))
      });

      return averageRating;
    } catch (error) {
      console.error("Error adding rating:", error);
      throw error;
    }
  };

  const updateUserDataOnWaves = useCallback((userId, updatedData) => {
    if (!userId) return;

    setUserProfileCache(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        ...updatedData
      }
    }));

    setWaves(prevWaves => {
      return prevWaves.map(wave => {
        if (wave.userId === userId) {
          return {
            ...wave,
            ...(updatedData.displayName !== undefined && { displayName: updatedData.displayName }),
            ...(updatedData.username !== undefined && { username: updatedData.username }),
            ...(updatedData.profileImage !== undefined && { profileImage: updatedData.profileImage }),
          };
        }
        return wave;
      });
    });
  }, []);

  const contextValue = {
    waves,
    loading,
    addWave,
    deleteWave,
    likeWave,
    addComment,
    addRating,
    updateUserDataOnWaves,
    fetchUserProfile
  };

  return (
    <WaveContext.Provider value={contextValue}>
      {children}
    </WaveContext.Provider>
  );
};

export const useWaves = () => {
  const context = useContext(WaveContext);
  if (!context) {
    throw new Error('useWaves must be used within a WaveProvider');
  }
  return context;
};