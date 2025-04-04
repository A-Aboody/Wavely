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
  useToast
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
  FiStar
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { useNavbar } from "../../context/NavbarContext";
import { useWaves } from '../../context/WaveContext';
import { useUser } from '../../context/UserContext';
import { useRef, useEffect, useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../Firebase/firebase';

const ProfilePage = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isNavbarOpen } = useNavbar();
  const { waves, deleteWave, likeWave, addComment, updateUserDataOnWaves } = useWaves();
  const { currentUser, getUserById, updateProfile, loading: userLoading } = useUser();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedWave, setSelectedWave] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [profileUser, setProfileUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isWaveModalOpen, onOpen: onWaveModalOpen, onClose: onWaveModalClose } = useDisclosure();
  const initialFocusRef = useRef();
  const profileImageRef = useRef();
  const bannerImageRef = useRef();

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
        if (uid) {
          user = await getUserById(uid);
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
        } else if (currentUser) {
          user = currentUser;
        } else {
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
  }, [uid, currentUser, getUserById, navigate, toast, userLoading]);

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

  // Responsive design handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter waves based on the profileUser being viewed
  const userWaves = waves.filter(wave => wave.userId === (profileUser?.uid || ''));
  const likedWaves = waves.filter(wave => wave.likedBy?.includes(profileUser?.uid || ''));

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

  const handleLike = (waveId) => {
    if (!currentUser) {
      toast({ title: "Login required to like waves", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    likeWave(waveId);
    if (selectedWave && selectedWave.id === waveId) {
        const currentUid = currentUser.uid;
        setSelectedWave(prev => {
            const alreadyLiked = prev.likedBy?.includes(currentUid);
            const newLikedBy = alreadyLiked
                ? prev.likedBy.filter(id => id !== currentUid)
                : [...(prev.likedBy || []), currentUid];
            const newLikes = newLikedBy.length;

            return {
                ...prev,
                likes: newLikes,
                likedBy: newLikedBy
            };
        });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file, type) => {
    if (!file || !currentUser || !isCurrentUserProfile) return;
    
    // Validate file type and size
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
    
    // Limit file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
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
      
      // Check if the updateUserDataOnWaves function exists before proceeding
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
      
      // Generate a unique filename to avoid storage conflicts
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      // Upload the file to storage
      const storageRef = ref(storage, `users/${currentUser.uid}/${type}/${fileName}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Prepare data for profile update
      const updateData = { [`${type}Image`]: downloadURL };
      
      // Update user profile in the database
      const success = await updateProfile(updateData);
      
      if (success) {
        // Update local state
        const updatedUser = {
          ...profileUser,
          ...updateData
        };
        setProfileUser(updatedUser);
        
        // If this is a profile image update, propagate it to all waves
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !isCurrentUserProfile) return;
    
    try {
      // Validate form data before submission
      if (!formData.username.trim() || !formData.displayName.trim()) {
        toast({
          title: "Missing required fields",
          description: "Username and display name are required",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // First update the profile in the database
      const success = await updateProfile(formData);
      
      if (success) {
        // Update local state with new information - ensure we're not losing any existing data
        const updatedUser = {
          ...profileUser,
          ...formData
        };
        setProfileUser(updatedUser);
        
        // Create the data object to propagate to waves
        const dataToPropagate = {
          displayName: formData.displayName,
          username: formData.username,
          profileImage: profileUser.profileImage  // Keep existing profile image
        };
        
        // Update all waves by this user with the new profile data
        if (typeof updateUserDataOnWaves === 'function') {
          await updateUserDataOnWaves(currentUser.uid, dataToPropagate);
          
          toast({
            title: "Profile updated!",
            description: "Your profile has been updated across all content.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          
          onEditModalClose();
        } else {
          console.error("WaveContext does not provide updateUserDataOnWaves function.");
          throw new Error("Cannot update wave data. Function missing.");
        }
      } else {
        throw new Error("Failed to update profile information in the database.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message || "Failed to save profile changes to database",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleWaveClick = (wave) => {
    const freshWaveData = waves.find(w => w.id === wave.id);
    setSelectedWave(freshWaveData || wave);
    onWaveModalOpen();
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedWave || !currentUser) {
      if (!currentUser) toast({ title: "Login required to comment", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const commentData = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      userId: currentUser.uid,
      username: currentUser.username,
      displayName: currentUser.displayName,
      profileImage: currentUser.profileImage,
      content: newComment,
      timestamp: new Date().toISOString()
    };
    try {
        await addComment(selectedWave.id, commentData);
        setSelectedWave(prev => ({
          ...prev,
          commentsList: [...(prev.commentsList || []), commentData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
          comments: (prev.comments || 0) + 1,
        }));
        setNewComment('');

      } catch (error) {
        console.error("Error adding comment:", error);
        toast({ title: "Error adding comment", description: error.message, status: "error", duration: 3000, isClosable: true });
      }
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
            <Flex
              height="100%" align="center" justify="center" >
              <Icon as={FiMusic} boxSize={10} color={colorMode === 'dark' ?
                'gray.300' : 'gray.600'} />
            </Flex>
          )}

         {(!wave.mediaType || !['image', 'video', 'audio'].includes(wave.mediaType)) && !wave.mediaUrls?.[0]
          && (
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
          <Text fontWeight="bold" noOfLines={1} title={wave.title ||
            'Untitled Wave'}>{wave.title || 'Untitled Wave'}</Text>
          <HStack mt={2} spacing={3} color={colorMode === 'dark' ?
            "gray.400" : "gray.600"}>
            <HStack spacing={1}>
              <Icon as={FiHeart} boxSize={4} />
              <Text fontSize="sm">{wave.likes ||
                0}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiMessageCircle} boxSize={4} />
              <Text fontSize="sm">{wave.comments ||
                0}</Text>
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
        {isCurrentUserProfile && (
          <Button
            position="absolute"
            bottom="4"
            right="4"
            leftIcon={<FiEdit />}
            onClick={onEditModalOpen}
            colorScheme="blue"
            size="sm"
            aria-label="Edit Profile"
          >
            Edit Profile
          </Button>
        )}
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
          bg={colorMode === 'dark' ?
            'gray.800' : 'white'}
          p={{ base: 4, md: 6 }}
          borderRadius="lg"
          boxShadow="md"
        >
          <Avatar
            src={profileUser.profileImage}
            name={profileUser.displayName}
            size={{ base: "xl", md: "2xl" }}
            borderWidth="4px"
            borderColor={colorMode === 'dark' ?
              'gray.800' : 'white'}
            mt={isCurrentUserProfile ?
              { base: "-40px", md: "-60px" } : "-30px"}
            ml={{ base: 0, md: 0 }}
            showBorder
          />

          <VStack align={{ base: 'center', md: 'flex-start' }} spacing={1} flex="1" pt={{ base: 4, md: 0 }}>
            <Heading size={{ base: "lg", md: "xl" }}>{profileUser.displayName ||
              'User Name'}</Heading>
            <Text color="gray.500">@{profileUser.username ||
              'username'}</Text>
            <Text maxWidth="600px" textAlign={{ base: 'center', md: 'left' }} pt={2} pb={2}>
              {profileUser.bio ||
                'No bio yet.'}
            </Text>

            <HStack spacing={{ base: 4, md: 6 }} mt={3} justify={{ base: "center", md: "flex-start" }} width="100%">
              <VStack spacing={0}>
                <Text fontWeight="bold">{userWaves.length}</Text>
                <Text fontSize="sm" color="gray.500">Waves</Text>
              </VStack>
              <VStack spacing={0}>
                <Text fontWeight="bold">{profileUser.followers?.length ||
                  0}</Text>
                <Text fontSize="sm" color="gray.500">Followers</Text>
              </VStack>
              <VStack spacing={0}>
                <Text fontWeight="bold">{profileUser.following?.length ||
                  0}</Text>
                <Text fontSize="sm" color="gray.500">Following</Text>
              </VStack>
            </HStack>
          </VStack>
        </Flex>

        {/* Content Tabs */}
        <Box width="100%" mt={8}>
          <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
            <TabList mb={4}>
              <Tab><HStack><Icon as={FiUser} mr={2} /><Text>Waves</Text></HStack></Tab>
              <Tab><HStack><Icon as={FiHeart} mr={2} /><Text>Liked</Text></HStack></Tab>
            </TabList>

            <TabPanels>
              {/* User's Waves Tab */}
              <TabPanel
                p={0}>
                {userWaves.length > 0 ?
                  (
                  <Grid
                    templateColumns={{
                      base: 'repeat(auto-fill, minmax(200px, 1fr))',
                      md: 'repeat(auto-fill, minmax(240px, 1fr))',
                    }}
                    gap={4}
                  >
                    {userWaves
                       .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp ||
                         0))
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
                {likedWaves.length > 0 ?
                  (
                  <Grid
                     templateColumns={{
                       base: 'repeat(auto-fill, minmax(200px, 1fr))',
                       md: 'repeat(auto-fill, minmax(240px, 1fr))',
                     }}
                     gap={4}
                  >
                     {likedWaves
                       .sort((a, b) => new Date(b.timestamp
                         || 0) - new Date(a.timestamp || 0))
                       .map(wave => renderWaveThumbnail(wave))}
                  </Grid>
                ) : (
                  <Box textAlign="center" py={10} px={6} borderWidth="1px" borderRadius="lg" bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
                    <Icon as={FiHeart} boxSize={'50px'} color={'pink.300'} />
                    <Heading as="h2" size="xl" mt={6} mb={2}>
                      No Liked Waves
                    </Heading>
                    <Text fontSize="lg" color="gray.500">
                      {isCurrentUserProfile ? "Waves you like will appear here." : "This user hasn't liked any waves yet."}
                    </Text>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>

      {/* Edit Profile Modal */}
      {isCurrentUserProfile && (
        <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="xl" initialFocusRef={initialFocusRef}>
          <ModalOverlay />
          <ModalContent bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
            <ModalHeader borderBottomWidth="1px">Edit Profile</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleSubmit}>
              <ModalBody>
                <VStack spacing={6} py={4}>
                  {/* Profile Picture Upload */}
                  <FormControl>
                    <FormLabel>Profile Picture</FormLabel>
                     <input
                       type="file"
                       accept="image/*"
                       ref={profileImageRef}
                       onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'profile')}
                       style={{ display: 'none' }}
                       id="profile-upload"
                     />
                     <Flex align="center" gap={4}>
                       <Avatar
                         size="xl"
                         src={profileUser.profileImage}
                         name={profileUser.displayName}
                       />
                       <Button
                         onClick={() => profileImageRef.current?.click()}
                         isLoading={imageUploading}
                         loadingText="Uploading..."
                         variant="outline"
                         leftIcon={<FiImage />}
                       >
                         Change Photo
                       </Button>
                     </Flex>
                  </FormControl>

                  {/* Banner Image Upload */}
                  <FormControl>
                    <FormLabel>Banner Image</FormLabel>
                    <input
                       type="file"
                       accept="image/*"
                       ref={bannerImageRef}
                       onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'banner')}
                       style={{ display: 'none' }}
                       id="banner-upload"
                      />
                    <Box position="relative" height="150px" borderRadius="md" overflow="hidden" borderWidth="1px" bg={colorMode === 'dark' ?
                      'gray.700' : 'gray.200'}>
                        <Image
                          src={profileUser.bannerImage ||
                            '/default-banner.jpg'}
                          alt="Banner preview"
                          width="100%"
                          height="100%"
                          objectFit="cover"
                          fallbackSrc='/default-banner.jpg'
                        />
                        <Button
                          position="absolute"
                          bottom="4"
                          right="4"
                          size="sm"
                          onClick={() => bannerImageRef.current?.click()}
                          isLoading={imageUploading}
                          loadingText="Uploading..."
                          variant="solid"
                          colorScheme='blackAlpha'
                          leftIcon={<FiImage />}
                         >
                          Change Banner
                        </Button>
                      </Box>
                  </FormControl>

                  {/* Text Inputs */}
                  <FormControl isRequired>
                    <FormLabel>Display Name</FormLabel>
                     <Input
                       ref={initialFocusRef}
                       name="displayName"
                       value={formData.displayName}
                       onChange={handleInputChange}
                       placeholder="Your display name"
                      />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                     <Input
                       name="username"
                       value={formData.username}
                       onChange={handleInputChange}
                       placeholder="Your unique username"
                      />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Bio</FormLabel>
                     <Textarea
                       name="bio"
                       value={formData.bio}
                       onChange={handleInputChange}
                       placeholder="Tell us about yourself"
                       rows={4}
                      />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter borderTopWidth="1px">
                <Button variant="ghost" mr={3} onClick={onEditModalClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" type="submit" isLoading={imageUploading}>
                  Save Changes
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Wave Detail Modal */}
      {selectedWave && (
        <Modal isOpen={isWaveModalOpen} onClose={onWaveModalClose} size={{ base: "full", md: "4xl", lg: "6xl" }} scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent bg={colorMode === 'dark' ?
            'gray.800' : 'white'} maxH={{ base: "100vh", md: "90vh" }}>
            <ModalHeader borderBottomWidth="1px">
              <Flex justify="space-between" align="center">
                <HStack>
                  <Avatar src={selectedWave.profileImage} name={selectedWave.displayName} size="md" mr={2} />
                  <Box>
                    <Text fontWeight="bold">{selectedWave.displayName}</Text>
                    <Text fontSize="sm" color="gray.500">
                      @{selectedWave.username} • {formatTimestamp(selectedWave.timestamp)}
                    </Text>
                  </Box>
                </HStack>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={0}>
                <Flex direction={{ base: 'column', lg: 'row' }} maxH={{ base: "calc(100vh - 60px)", md: "calc(90vh - 60px)" }}>
                  {/* Media Column */}
                  <Flex
                     flex={{ base: "none", lg: 2 }}
                     justify="center"
                     align="center"
                     p={{ base: 2, md: 4 }}
                     bg={colorMode === 'dark' ?
                        'black' : 'gray.50'}
                     maxHeight={{ base: "50vh", lg: "100%" }}
                     overflow="hidden"
                     position="relative"
                  >
                    {selectedWave.mediaType === 'image' && selectedWave.mediaUrls?.[0]
                      && (
                      <Image
                        src={selectedWave.mediaUrls[0]}
                        alt={selectedWave.title || 'Wave Image'}
                        maxW="100%"
                        maxH="100%"
                        objectFit="contain"
                        fallbackSrc='/placeholder-image.jpg'
                      />
                    )}
                    {selectedWave.mediaType === 'video' && selectedWave.mediaUrls?.[0]
                      && (
                      <Box as="video" src={selectedWave.mediaUrls[0]} controls width="100%" maxH="100%" objectFit="contain" poster={selectedWave.thumbnailUrl} />
                    )}
                    {selectedWave.mediaType === 'audio' && selectedWave.mediaUrls?.[0]
                      && (
                      <VStack spacing={4} p={{ base: 4, md: 6 }} width="100%" justify="center">
                         <Icon as={FiMusic} boxSize={16} color={colorMode === 'dark' ? 'blue.300' : 'blue.500'} />
                         <Text fontWeight="bold" textAlign="center">{selectedWave.title}</Text>
                        <Box as="audio" src={selectedWave.mediaUrls[0]} controls width="100%" />
                      </VStack>
                    )}
                     {(!selectedWave.mediaUrls || selectedWave.mediaUrls.length === 0) && !['image', 'video', 'audio'].includes(selectedWave.mediaType) && (
                      <Box p={{ base: 4, md: 10 }} overflowY="auto" maxH="100%">
                            <Heading size="lg" mb={3}>{selectedWave.title || "Untitled Wave"}</Heading>
                            <Text whiteSpace="pre-wrap" fontSize="md">{selectedWave.content || "No description."}</Text>
                      </Box>
                     )}
                  </Flex>

                  {/* Details & Comments Column */}
                  <Box
                    flex={{ base: "none", lg: 1 }}
                     p={{ base: 4, md: 6 }}
                     maxHeight={{ base: "50vh", lg: "100%" }}
                     overflowY="auto"
                     borderLeftWidth={{ base: 0, lg: "1px" }}
                     borderColor={colorMode === 'dark' ?
                        'gray.700' : 'gray.200'}
                  >
                     {(selectedWave.mediaUrls && selectedWave.mediaUrls.length > 0) && (
                       <Box mb={4}>
                          <Heading size="lg" mb={3}>{selectedWave.title
                            || "Untitled Wave"}</Heading>
                          <Text whiteSpace="pre-wrap">{selectedWave.content || "No description."}</Text>
                       </Box>
                      )}

                    <HStack mt={(selectedWave.mediaUrls &&
                      selectedWave.mediaUrls.length > 0) ? 4 : 0} mb={4} spacing={4} color={colorMode === 'dark' ?
                      "gray.400" : "gray.600"} align="center">
                      <Button
                        leftIcon={<FiHeart fill={selectedWave.likedBy?.includes(currentUser?.uid) ?
                          'currentColor' : 'none'} />}
                        onClick={() => handleLike(selectedWave.id)}
                        variant="ghost"
                        size="sm"
                        colorScheme={selectedWave.likedBy?.includes(currentUser?.uid) ? 'red' : 'gray'}
                      >
                        {selectedWave.likes ||
                          0} {selectedWave.likes === 1 ? 'Like' : 'Likes'}
                      </Button>
                      <HStack spacing={1}>
                        <Icon as={FiMessageCircle} />
                        <Text fontSize="sm">{selectedWave.comments || 0} {selectedWave.comments === 1 ?
                          'Comment' : 'Comments'}</Text>
                      </HStack>
                    </HStack>

                    {isCurrentUserProfile && selectedWave.userId === currentUser?.uid && (
                      <Button
                        leftIcon={<FiTrash2 />}
                        colorScheme='red'
                        variant='outline'
                        size='sm'
                        mt={2}
                        mb={4}
                        onClick={async () => {
                          try {
                            await deleteWave(selectedWave.id);
                              onWaveModalClose();
                              toast({ title: "Wave deleted", status: "info", duration: 2000 });
                          } catch (error) {
                              toast({ title: "Error deleting wave", status: "error", duration: 3000 });
                          }
                        }}
                      >
                        Delete Wave
                      </Button>
                    )}

                    <Divider my={4}/>

                    <Heading size="md" mb={4}>Comments ({selectedWave.commentsList?.length ||
                      0})</Heading>

                     {currentUser && (
                      <InputGroup mb={4}>
                        <Input
                          placeholder="Add a public comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                          pr="4.5rem"
                        />
                        <InputRightElement width="4.5rem">
                          <IconButton
                            h="1.75rem"
                            size="sm"
                            icon={<FiSend />}
                            aria-label="Send comment"
                            onClick={handleAddComment}
                            isDisabled={!newComment.trim()}
                            colorScheme='blue'
                          />
                        </InputRightElement>
                      </InputGroup>
                    )}
                    {!currentUser &&
                      <Text fontSize="sm" color="gray.500" mb={4}>Log in to add a comment.</Text>}

                    {/* Comments List */}
                    <VStack align="stretch" spacing={4}>
                      {(selectedWave.commentsList && selectedWave.commentsList.length > 0) ?
                        (
                         selectedWave.commentsList
                           .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                           .map(comment => (
                          <Box key={comment.id} p={3} bg={colorMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'gray.50'} borderRadius="md">
                               <Flex justify="space-between" align="center" mb={1}>
                                 <HStack>
                                    <Avatar src={comment.profileImage} name={comment.displayName} size="sm" />
                                    <Text fontWeight="bold" fontSize="sm">{comment.displayName}</Text>
                                    <Text fontSize="xs" color="gray.500">• @{comment.username}</Text>
                                 </HStack>
                                 <Text fontSize="xs" color="gray.500" whiteSpace="nowrap" ml={2}>
                                    {formatTimestamp(comment.timestamp)}
                                 </Text>
                               </Flex>
                               <Text fontSize="sm" pl={10}>{comment.content}</Text>
                             </Box>
                         ))
                       ) : (
                        <Text color="gray.500" textAlign="center" pt={4}>No comments yet.</Text>
                       )}
                    </VStack>
                  </Box>
                </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default ProfilePage;