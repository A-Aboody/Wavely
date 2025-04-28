import {
  Box,
  Flex,
  Heading,
  Text,
  Avatar,
  Button,
  HStack,
  VStack,
  Grid,
  Image,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useColorMode,
  useDisclosure,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tag,
  Divider,
  IconButton,
  InputGroup,
  InputRightElement,
  Badge,
  Spinner,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip
} from '@chakra-ui/react';
import {
  FiEdit,
  FiImage,
  FiVideo,
  FiMusic,
  FiHeart,
  FiMessageCircle,
  FiEye,
  FiUsers,
  FiUser,
  FiSend,
  FiX,
  FiMoreHorizontal,
  FiTrash2,
  FiStar,
  FiUserPlus,
  FiUserX,
  FiShare2
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { useNavbar } from "../../context/NavbarContext";
import { useWaves } from '../../context/WaveContext';
import { useUser } from '../../context/UserContext';
import { useRef, useEffect, useState, useCallback } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../Firebase/firebase';
import WaveModal from '../../custom_components/WaveModal/WaveModal';
import FollowersModal from '../../custom_components/FollowersModal/FollowersModal';
import FollowingModal from '../../custom_components/FollowingModal/FollowingModal';
import EditProfileModal from '../../custom_components/EditProfileModal/EditProfileModal';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isNavbarOpen } = useNavbar();
  const { waves, deleteWave, likeWave, addComment, updateUserDataOnWaves } = useWaves();
  const { 
    currentUser, 
    getUserById, 
    getUserByUsername,
    updateProfile,
    followUser,
    unfollowUser, 
    loading: userLoading 
  } = useUser();  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedWave, setSelectedWave] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const { isOpen: isWaveModalOpen, onOpen: onWaveModalOpen, onClose: onWaveModalClose } = useDisclosure();
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const initialFocusRef = useRef();
  const profileImageRef = useRef();
  const bannerImageRef = useRef();

  const isFollowing = useCallback(() => {
    return currentUser?.following?.includes(profileUser?.uid) || false;
  }, [currentUser, profileUser]);

  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
  });

  // Fetch profile data
  useEffect(() => {
    if (userLoading) return;
  
    setLoadingProfile(true);
  
    const fetchProfile = async () => {
      try {
        let user = null;
        
        if (username) {
          if (currentUser && username === currentUser.username) {
            user = currentUser;
          } else {
            user = await getUserByUsername(username);
            if (!user) {
              toast({
                title: "Profile not found",
                description: "This user profile does not exist.",
                status: "error",
                duration: 5000,
                isClosable: true,
              });
              navigate('/');
              return;
            }
          }
        }
        else if (currentUser) {
          user = currentUser;
          navigate(`/profile/${currentUser.username}`, { replace: true });
        }
        else {
          toast({
            title: "Not logged in",
            description: "Please log in to view your profile.",
            status: "info",
            duration: 5000,
            isClosable: true,
          });
          navigate('/auth');
          return;
        }
  
        setProfileUser(user);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error loading profile",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        navigate('/');
      } finally {
        setLoadingProfile(false);
      }
    };
  
    fetchProfile();
  }, [username, currentUser, getUserByUsername, navigate, toast, userLoading]);

  // Set form data when edit modal opens
  useEffect(() => {
    if (isEditModalOpen && profileUser && isCurrentUserProfile) {
      setFormData({
        username: profileUser.username || '',
        displayName: profileUser.displayName || '',
        bio: profileUser.bio || '',
      });
    }
  }, [isEditModalOpen, profileUser]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userWaves = waves.filter(wave => wave.userId === (profileUser?.uid || ''));
  const likedWaves = waves.filter(wave => wave.likedBy?.includes(profileUser?.uid || ''));
  const communityWaves = userWaves.filter(wave => wave.waveType === 'community');

  // Check if the currently viewed profile belongs to the logged-in user
  const isCurrentUserProfile = currentUser?.uid === profileUser?.uid;

  const formatTimestamp = (dateString) => {
    if (!dateString) return 'Just now';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
    } catch (e) {
        console.error("Error formatting timestamp:", e, "Input:", dateString);
        return 'Invalid date';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleWaveClick = (wave) => {
    const freshWaveData = waves.find(w => w.id === wave.id);
    setSelectedWave(freshWaveData || wave);
    onWaveModalOpen();
  };

  const handleImageUpload = async (file, type) => {
    if (!file || !currentUser || !isCurrentUserProfile) return;
    
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setImageUploading(true);
      
      if (typeof updateUserDataOnWaves !== 'function') {
        console.error("WaveContext does not provide updateUserDataOnWaves function.");
        toast({
          title: "Internal Error",
          description: "Cannot update wave data. Function missing.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `users/${currentUser.uid}/${type}/${fileName}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const updateData = { [`${type}Image`]: downloadURL };
      const success = await updateProfile(updateData);
      
      if (success) {
        const updatedUser = {
          ...profileUser,
          ...updateData
        };
        setProfileUser(updatedUser);
        
        if (type === 'profile') {
          const dataToPropagate = {
            profileImage: downloadURL,
            displayName: profileUser.displayName,
            username: profileUser.username
          };
          await updateUserDataOnWaves(currentUser.uid, dataToPropagate);
          
          toast({
            title: `Profile image updated!`,
            description: "Your new profile picture has been saved and applied to all your content.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: `Banner image updated!`,
            description: "Your new banner image has been saved.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        throw new Error(`Failed to update ${type} image in database.`);
      }
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error);
      toast({
        title: `Error uploading ${type} image`,
        description: error.message || "Failed to save image to database",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const success = await updateProfile(data);
      if (success) {
        const updatedUser = await getUserByUsername(username);
        setProfileUser(updatedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  };

  const handleDeleteSuccess = () => {
  };

  const renderWaveThumbnail = (wave) => {
    if (!wave || !wave.id) return null;

    let thumbSrc = '/placeholder-image.jpg';
    if (wave.mediaType === 'image' && wave.mediaUrls?.[0]) {
        thumbSrc = wave.mediaUrls[0];
    } else if (wave.mediaType === 'video') {
        thumbSrc = wave.thumbnailUrl || '/placeholder-video.jpg';
    }

    return (
      <Box
        key={wave.id}
        borderRadius="lg"
        overflow="hidden"
        bg={colorMode === 'dark' ? "gray.750" : 'white'}
        boxShadow="md"
        borderWidth="1px"
        borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        cursor="pointer"
        onClick={() => handleWaveClick(wave)}
        transition="all 0.2s"
        _hover={{ transform: 'scale(1.02)', shadow: 'lg' }}
      >
        <Box position="relative" height="180px" bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}>
          {(wave.mediaType === 'image' || wave.mediaType === 'video') && (
             <Image
                src={thumbSrc}
                alt={wave.title || `Wave ${wave.mediaType}`}
                width="100%"
                height="100%"
                objectFit="cover"
                fallbackSrc={wave.mediaType === 'image' ? '/placeholder-image.jpg' : '/placeholder-video.jpg'}
             />
          )}

          {wave.mediaType === 'video' && (
            <Flex position="absolute" inset="0" align="center" justify="center" bg="blackAlpha.400">
              <Icon as={FiVideo} color="white" boxSize={8} />
            </Flex>
          )}

          {wave.mediaType === 'audio' && (
            <Flex height="100%" align="center" justify="center">
              <Icon as={FiMusic} boxSize={10} color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} />
            </Flex>
          )}

         {(!wave.mediaType || !['image', 'video', 'audio'].includes(wave.mediaType)) && !wave.mediaUrls?.[0] && (
             <Flex height="100%" align="center" justify="center" p={4}>
                 <Text color="gray.500" textAlign="center" noOfLines={3}>
                     {wave.content ? `"${wave.content}"` : "Text Wave"}
                 </Text>
             </Flex>
         )}

          {wave.rating && (
            <Badge position="absolute" bottom="2" left="2" colorScheme="yellow" variant="solid">
              <HStack spacing={1}>
                <Icon as={FiStar} color="white" fill="currentColor" boxSize={3} />
                <Text color="white" fontSize="xs">{wave.rating.toFixed(1)}</Text>
              </HStack>
            </Badge>
          )}
        </Box>

        <Box p={3}>
          <Text fontWeight="bold" noOfLines={1} title={wave.title || 'Untitled Wave'}>{wave.title || 'Untitled Wave'}</Text>
          <HStack mt={2} spacing={3} color={colorMode === 'dark' ? "gray.400" : "gray.600"}>
            <HStack spacing={1}>
              <Icon as={FiHeart} boxSize={4} />
              <Text fontSize="sm">{wave.likes || 0}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiMessageCircle} boxSize={4} />
              <Text fontSize="sm">{wave.comments || 0}</Text>
            </HStack>
          </HStack>
        </Box>
      </Box>
    );
  };

  if (userLoading || loadingProfile) {
    return (
      <Flex justify="center" align="center" height="calc(100vh - 80px)">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!profileUser) {
    return (
      <Flex justify="center" align="center" height="calc(100vh - 80px)">
        <Text color="gray.500">Could not load profile.</Text>
      </Flex>
    )
  }

  const handleFollowAction = async () => {
    if (!currentUser || !profileUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow users",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsFollowLoading(true);
    try {
      const success = isFollowing()
        ? await unfollowUser(profileUser.uid)
        : await followUser(profileUser.uid);

      if (success) {
        setProfileUser(prev => ({
          ...prev,
          followers: isFollowing()
            ? prev.followers.filter(id => id !== currentUser.uid)
            : [...prev.followers, currentUser.uid]
        }));

        toast({
          title: isFollowing() ? "Unfollowed" : "Following",
          description: isFollowing()
            ? `You unfollowed ${profileUser.displayName}`
            : `You are now following ${profileUser.displayName}`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error("Failed to update follow status");
      }
    } catch (error) {
      console.error("Follow action error:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <Box
      width="100vw"
      ml={isMobile ? 0 : isNavbarOpen ? "-240px" : "-90px"}
      pl={isMobile ? 0 : isNavbarOpen ? "240px" : "90px"}
      transition="padding-left 0.2s ease-out, margin-left 0.2s ease-out"
      overflowX="hidden"
      bg={colorMode === 'dark' ? '#121212' : 'gray.50'}
      minHeight="100vh"
      pb={10}
    >
      {/* Banner Image */}
      <Box position="relative" width="100%" height={{ base: "200px", md: "300px" }} bg={colorMode === 'dark' ? 'gray.700' : 'gray.300'}>
        <Image
          src={profileUser.bannerImage || '/default-banner.jpg'}
          alt="Profile banner"
          width="100%"
          height="100%"
          objectFit="cover"
          fallbackSrc='/default-banner.jpg'
        />
        <Box position="absolute" bottom="4" right="4">
          {isCurrentUserProfile ? (
            <Button
              leftIcon={<FiEdit />}
              onClick={onEditModalOpen}
              colorScheme="blue"
              size="sm"
              aria-label="Edit Profile"
            >
              Edit Profile
            </Button>
          ) : (
            <Menu>
              <MenuButton as={Button} size="sm" rightIcon={<FiMoreHorizontal />}>
                Options
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiShare2 />} onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Link copied!",
                    description: "Profile link copied to clipboard",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                  });
                }}>
                  Share Profile
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Box>
      </Box>

      {/* Profile Info Section */}
      <Flex
        direction="column"
        maxWidth="1200px"
        margin="0 auto"
        px={{ base: 4, md: 8 }}
        mt={{ base: "-60px", md: "-80px" }}
        position="relative"
        zIndex="1"
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'center', md: 'flex-end' }}
          gap={6}
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          p={{ base: 4, md: 6 }}
          borderRadius="lg"
          boxShadow="md"
        >
          <Avatar
            src={profileUser.profileImage}
            name={profileUser.displayName}
            size={{ base: "xl", md: "2xl" }}
            borderWidth="4px"
            borderColor={colorMode === 'dark' ? 'gray.800' : 'white'}
            mt={isCurrentUserProfile ? { base: "-40px", md: "-60px" } : "-30px"}
            ml={{ base: 0, md: 0 }}
            showBorder
            cursor="pointer"
            onClick={() => {
              if (!isCurrentUserProfile) {
                window.open(profileUser.profileImage || '/default-profile.jpg', '_blank');
              }
            }}
            _hover={{
              transform: isCurrentUserProfile ? 'none' : 'scale(1.05)',
              transition: 'transform 0.2s'
            }}
          />

          <VStack align={{ base: 'center', md: 'flex-start' }} spacing={1} flex="1" pt={{ base: 4, md: 0 }}>
            <Heading size={{ base: "lg", md: "xl" }}>{profileUser.displayName || 'User Name'}</Heading>
            <Text color="gray.500">@{profileUser.username || 'username'}</Text>
            <Text maxWidth="600px" textAlign={{ base: 'center', md: 'left' }} pt={2} pb={2}>
              {profileUser.bio || 'No bio yet.'}
            </Text>

            <HStack spacing={{ base: 4, md: 6 }} mt={3} justify={{ base: "center", md: "flex-start" }} width="100%">
              <VStack spacing={0}>
                <Text fontWeight="bold">{userWaves.length}</Text>
                <Text fontSize="sm" color="gray.500">Waves</Text>
              </VStack>
              <VStack 
                spacing={0} 
                cursor="pointer" 
                onClick={() => setIsFollowersModalOpen(true)}
                _hover={{ opacity: 0.8 }}
              >
                <Text fontWeight="bold">{profileUser.followers?.length || 0}</Text>
                <Text fontSize="sm" color="gray.500">Followers</Text>
              </VStack>
              <VStack 
                spacing={0} 
                cursor="pointer"
                onClick={() => setIsFollowingModalOpen(true)}
                _hover={{ opacity: 0.8 }}
              >
                <Text fontWeight="bold">{profileUser.following?.length || 0}</Text>
                <Text fontSize="sm" color="gray.500">Following</Text>
              </VStack>
              {communityWaves.length > 0 && (
                <VStack spacing={0}>
                  <Text fontWeight="bold">{communityWaves.length}</Text>
                  <Text fontSize="sm" color="gray.500">Community</Text>
                </VStack>
              )}
            </HStack>

            <FollowersModal
              isOpen={isFollowersModalOpen}
              onClose={() => setIsFollowersModalOpen(false)}
              followers={profileUser.followers || []}
              profileUsername={profileUser.username}
            />
            <FollowingModal
              isOpen={isFollowingModalOpen}
              onClose={() => setIsFollowingModalOpen(false)}
              following={profileUser.following || []}
              profileUsername={profileUser.username}
            />
            
            {!isCurrentUserProfile && currentUser && (
              <Button 
                colorScheme={isFollowing() ? "gray" : "blue"}
                size="sm"
                mt={4}
                onClick={handleFollowAction}
                isLoading={isFollowLoading}
                loadingText={isFollowing() ? "Unfollowing..." : "Following..."}
                leftIcon={isFollowing() ? <Icon as={FiUserX} /> : <Icon as={FiUserPlus} />}
              >
                {isFollowing() ? "Unfollow" : "Follow"}
              </Button>
            )}
          </VStack>
        </Flex>

        {/* Content Tabs */}
        <Box width="100%" mt={8}>
          <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
            <TabList mb={4}>
              <Tab><HStack><Icon as={FiUser} mr={2} /><Text>Waves</Text></HStack></Tab>
              <Tab><HStack><Icon as={FiHeart} mr={2} /><Text>Liked</Text></HStack></Tab>
              <Tab><HStack><Icon as={FiUsers} mr={2} /><Text>Community</Text></HStack></Tab>
            </TabList>

            <TabPanels>
              {/* User's Waves Tab */}
              <TabPanel p={0}>
                {userWaves.length > 0 ? (
                  <Grid
                    templateColumns={{
                      base: 'repeat(auto-fill, minmax(200px, 1fr))',
                      md: 'repeat(auto-fill, minmax(240px, 1fr))',
                    }}
                    gap={4}
                  >
                    {userWaves
                      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
                      .map(wave => renderWaveThumbnail(wave))
                    }
                  </Grid>
                ) : (
                  <Box
                    textAlign="center" py={10} px={6} borderWidth="1px" borderRadius="lg" bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
                    <Icon as={FiX} boxSize={'50px'} color={'orange.300'} />
                    <Heading as="h2" size="xl" mt={6} mb={2}>
                      No Waves Yet
                    </Heading>
                    <Text fontSize="lg" color="gray.500" mb={6}>
                      {isCurrentUserProfile ?
                        "You haven't posted any waves. Let's get started!" : `${profileUser.displayName} hasn't posted any waves yet.`}
                    </Text>
                    {isCurrentUserProfile && (
                      <Button colorScheme="blue" onClick={() => navigate('/create')}>
                        Create Your First Wave
                      </Button>
                    )}
                  </Box>
                )}
              </TabPanel>

              {/* Liked Waves Tab */}
              <TabPanel p={0}>
                {likedWaves.length > 0 ? (
                  <Grid
                    templateColumns={{
                      base: 'repeat(auto-fill, minmax(200px, 1fr))',
                      md: 'repeat(auto-fill, minmax(240px, 1fr))',
                    }}
                    gap={4}
                  >
                    {likedWaves
                      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
                      .map(wave => renderWaveThumbnail(wave))}
                  </Grid>
                ) : (
                  <Box textAlign="center" py={10} px={6} borderWidth="1px" borderRadius="lg" bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
                    <Icon as={FiHeart} boxSize={'50px'} color={'pink.300'} />
                    <Heading as="h2" size="xl" mt={6} mb={2}>
                      No Liked Waves
                    </Heading>
                    <Text fontSize="lg" color="gray.500">
                      {isCurrentUserProfile ? "Waves you like will appear here." : `${profileUser.displayName} hasn't liked any waves yet.`}
                    </Text>
                  </Box>
                )}
              </TabPanel>

              {/* Community Waves Tab */}
              <TabPanel p={0}>
                {communityWaves.length > 0 ? (
                  <Grid
                    templateColumns={{
                      base: 'repeat(auto-fill, minmax(200px, 1fr))',
                      md: 'repeat(auto-fill, minmax(240px, 1fr))',
                    }}
                    gap={4}
                  >
                    {communityWaves
                      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
                      .map(wave => (
                        <Box key={wave.id} position="relative">
                          {renderWaveThumbnail(wave)}
                          <Badge 
                            position="absolute" 
                            top="2" 
                            right="2" 
                            colorScheme="purple" 
                            variant="solid"
                            borderRadius="full"
                            px={2}
                          >
                            <HStack spacing={1}>
                              <Icon as={FiStar} boxSize={3} />
                              <Text fontSize="xs">{wave.averageRating?.toFixed(1) || '0'}/{wave.communityRatingScale}</Text>
                            </HStack>
                          </Badge>
                        </Box>
                      ))
                    }
                  </Grid>
                ) : (
                  <Box 
                    textAlign="center" 
                    py={10} 
                    px={6} 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    bg={colorMode === 'dark' ? 'gray.800' : 'white'}
                  >
                    <Icon as={FiUsers} boxSize={'50px'} color={'purple.300'} />
                    <Heading as="h2" size="xl" mt={6} mb={2}>
                      No Community Waves
                    </Heading>
                    <Text fontSize="lg" color="gray.500" mb={6}>
                      {isCurrentUserProfile ?
                        "You haven't posted any community waves yet. Create one to get community ratings!" : 
                        `${profileUser.displayName} hasn't posted any community waves yet.`}
                    </Text>
                    {isCurrentUserProfile && (
                      <Button 
                        colorScheme="purple" 
                        onClick={() => navigate('/create')}
                        leftIcon={<Icon as={FiUsers} />}
                      >
                        Create Community Wave
                      </Button>
                    )}
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>

      {/* Edit Profile Modal - Only show for current user */}
      {isCurrentUserProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={onEditModalClose}
          profileUser={profileUser}
          onUpdateProfile={handleSubmit}
          onImageUpload={handleImageUpload}
          imageUploading={imageUploading}
        />
      )}

      {/* Wave Detail Modal */}
      {selectedWave && (
        <WaveModal
          wave={selectedWave}
          isOpen={isWaveModalOpen}
          onClose={onWaveModalClose}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </Box>
  );
};

export default ProfilePage;