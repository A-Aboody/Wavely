import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../Firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data from Firestore when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfileData({
              uid: user.uid,
              email: user.email,
              username: userData.username,
              displayName: userData.displayName,
              profileImage: userData.profileImage,
              bannerImage: userData.bannerImage,
              bio: userData.bio || '',
              following: userData.following || 0,
              followers: userData.followers || 0,
              likes: userData.likes || 0,
              createdAt: userData.createdAt?.toDate() || new Date()
            });
          } else {
            // Create default profile if user doc doesn't exist
            setProfileData({
              uid: user.uid,
              email: user.email,
              username: user.email.split('@')[0],
              displayName: user.email.split('@')[0],
              profileImage: '',
              bannerImage: '',
              bio: '',
              following: 0,
              followers: 0,
              likes: 0,
              createdAt: new Date()
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          setProfileData(null);
        }
      } else {
        setProfileData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update profile in Firestore and local state
  const updateProfile = useCallback(async (updates) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), updates);

      // Update local state
      setProfileData(prev => ({
        ...prev,
        ...updates
      }));

      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  }, []);

  // Function to update profile image
  const updateProfileImage = useCallback(async (imageUrl) => {
    return updateProfile({ profileImage: imageUrl });
  }, [updateProfile]);

  // Function to update banner image
  const updateBannerImage = useCallback(async (imageUrl) => {
    return updateProfile({ bannerImage: imageUrl });
  }, [updateProfile]);

  return (
    <ProfileContext.Provider value={{ 
      profileData, 
      loading, 
      updateProfile,
      updateProfileImage,
      updateBannerImage
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};