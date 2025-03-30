// context/ProfileContext.js
import { createContext, useContext, useState, useCallback } from 'react';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(() => {
    const savedData = localStorage.getItem('profileData');
    return savedData ? JSON.parse(savedData) : {
      username: 'aa.a021',
      displayName: 'adubla',
      profileImage: '/api/placeholder/200/200',
      bannerImage: '/api/placeholder/1200/300',
      following: 15,
      followers: 15,
      likes: 10,
      bio: 'No bio yet.'
    };
  });

  const updateProfile = useCallback((newData) => {
    setProfileData(prev => {
      const updatedProfile = { ...prev, ...newData };
      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
      return updatedProfile;
    });
  }, []); // Empty dependency array because we don't use external values

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile }}>
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