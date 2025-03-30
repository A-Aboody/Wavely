import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const WaveContext = createContext();

// Create a provider component
export const WaveProvider = ({ children }) => {
  // Initialize waves from localStorage or use default data
  const [waves, setWaves] = useState(() => {
    const savedWaves = localStorage.getItem('waves');
    if (savedWaves) {
      const parsedWaves = JSON.parse(savedWaves);
      // Ensure media URLs are properly restored
      return parsedWaves.map(wave => ({
        ...wave,
        image: wave.mediaUrl || wave.image,
        mediaUrl: wave.mediaUrl || wave.image
      }));
    }
    
    // Default waves if none in storage
    return [
      {
        id: 1,
        username: 'Abdula',
        displayName: 'Abdula Ameen',
        profileImage: '/api/placeholder/100/100',
        content: 'This is a test',
        image: "/Wavely-Logo.png",
        mediaUrl: "/Wavely-Logo.png",
        timestamp: '2h ago',
        likes: 243,
        comments: 42,
        views: 1283,
        rating: 4.8,
        mediaType: 'image',
        commentsList: []
      },
    ];
  });

  // Update localStorage whenever waves change
  useEffect(() => {
    localStorage.setItem('waves', JSON.stringify(waves));
  }, [waves]);

  // Function to add a new wave with persistent file handling
  const addWave = (waveData) => {
    if (waveData.file && waveData.file instanceof File) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          const newWave = createWave({
            ...waveData,
            mediaUrl: dataUrl,
            image: dataUrl // Store in both fields for consistency
          });
          
          setWaves(prevWaves => [newWave, ...prevWaves]);
          resolve(newWave.id);
        };
        reader.readAsDataURL(waveData.file);
      });
    } else {
      const mediaUrl = waveData.mediaUrl || waveData.image || "/Wavely-Logo.png";
      const newWave = createWave({
        ...waveData,
        mediaUrl,
        image: mediaUrl // Store in both fields for consistency
      });
      
      setWaves(prevWaves => [newWave, ...prevWaves]);
      return Promise.resolve(newWave.id);
    }
  };
  
  // Helper function to create a new wave object
  const createWave = (waveData) => ({
    id: waveData.id || Date.now(),
    username: waveData.username,
    displayName: waveData.displayName,
    profileImage: waveData.profileImage,
    content: waveData.content,
    image: waveData.mediaUrl || waveData.image,
    mediaUrl: waveData.mediaUrl || waveData.image,
    mediaType: waveData.mediaType || 'image',
    title: waveData.title || '',
    category: waveData.category || '',
    timestamp: waveData.timestamp,
    likes: waveData.likes || 0,
    comments: waveData.comments || 0,
    commentsList: waveData.commentsList || [],
    views: waveData.views || Math.floor(Math.random() * 100),
    rating: waveData.rating || null,
    ratingScale: waveData.ratingScale || 5
  });

  // Function to delete a wave
  const deleteWave = (id) => {
    setWaves(prevWaves => prevWaves.filter(wave => wave.id !== id));
  };

  // Function to handle wave likes
  const likeWave = (id) => {
    setWaves(prevWaves => 
      prevWaves.map(wave => 
        wave.id === id 
          ? {...wave, likes: wave.likes + 1}
          : wave
      )
    );
  };

  // Function to update a wave
  const updateWave = (id, updates) => {
    setWaves(prevWaves =>
      prevWaves.map(wave =>
        wave.id === id
          ? { ...wave, ...updates }
          : wave
      )
    );
  };

  // Function to add a comment to a wave
  const addComment = (waveId, comment) => {
    setWaves(prevWaves =>
      prevWaves.map(wave =>
        wave.id === waveId
          ? {
              ...wave,
              comments: wave.comments + 1,
              commentsList: [...(wave.commentsList || []), comment]
            }
          : wave
      )
    );
  };

  // The context value that will be supplied to any descendants
  const contextValue = {
    waves,
    addWave,
    deleteWave,
    likeWave,
    updateWave,
    addComment
  };

  return (
    <WaveContext.Provider value={contextValue}>
      {children}
    </WaveContext.Provider>
  );
};

// Custom hook for using the wave context
export const useWaves = () => {
  const context = useContext(WaveContext);
  if (!context) {
    throw new Error('useWaves must be used within a WaveProvider');
  }
  return context;
};