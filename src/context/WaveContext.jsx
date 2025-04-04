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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../Firebase/firebase';

const WaveContext = createContext();

// Helper to format timestamp (can be kept or moved)
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

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'waves'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const wavesData = [];
      querySnapshot.forEach((doc) => {
         const data = doc.data();
         const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : null;
        wavesData.push({
          id: doc.id,
          ...data,
          createdAt: createdAtDate, // Store as Date object
        });
      });
      setWaves(wavesData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching waves:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
        commentsList: waveData.commentsList ?? []
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
        id: commentData.id ||
          Date.now().toString(),
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

  // Function to update USER data ON WAVES (Client-Side State Only)
  const updateUserDataOnWaves = useCallback((userId, updatedData) => {
    // console.log(`WaveContext: Updating waves for userId: ${userId} with data:`, updatedData);
    setWaves(currentWaves => {
      let changed = false;
      const newWaves = currentWaves.map(wave => {
        if (wave.userId === userId) {
          const needsUpdate = (
            (updatedData.displayName !== undefined && wave.displayName !==
             updatedData.displayName) ||
            (updatedData.username !== undefined && wave.username !== updatedData.username) ||
            (updatedData.profileImage !== undefined && wave.profileImage !== updatedData.profileImage)
          );
          if (needsUpdate) {
             changed = true;
             return {
               ...wave,
                ...(updatedData.displayName !== undefined && { displayName: updatedData.displayName }),
                ...(updatedData.username !== undefined && { username: updatedData.username }),
                ...(updatedData.profileImage !== undefined && { profileImage: updatedData.profileImage }),
             };
          }
        }
        return wave;
      });
      // Only update state if something actually changed
      // if (changed) console.log("WaveContext: Wave data updated in state.");
      return changed ? newWaves : currentWaves;
    });
  }, []);

  // Provide all functions including the new one
  const contextValue = {
    waves,
    loading,
    addWave,
    deleteWave,
    likeWave,
    addComment,
    updateUserDataOnWaves // <-- Included
  };

  return (
    <WaveContext.Provider value={contextValue}>
      {children}
    </WaveContext.Provider>
  );
};

// Custom hook
export const useWaves = () => {
  const context = useContext(WaveContext);
  if (!context) {
    throw new Error('useWaves must be used within a WaveProvider');
  }
  return context;
};