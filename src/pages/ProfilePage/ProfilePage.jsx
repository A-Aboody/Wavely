import React, { useState } from 'react';
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
  ModalBody,
  ModalCloseButton,
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
  FiUser
} from 'react-icons/fi';
import { useNavbar } from "../../context/NavbarContext";
import { useRef, useEffect } from 'react';


const ProfilePage = () => {
  const { isNavbarOpen } = useNavbar();
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState(0);
  const profileImageRef = useRef(null);
  const bannerImageRef = useRef(null);
  const initialFocusRef = useRef(null);
  
  // Modal disclosure completely isolated
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Load profile data from localStorage or use defaults
  const [profileData, setProfileData] = useState(() => {
    const savedData = localStorage.getItem('profileData');
    return savedData ? JSON.parse(savedData) : {
      username: 'aa.a021',
      displayName: 'adubla',
      bio: 'No bio yet.',
      profileImage: '/api/placeholder/200/200',
      bannerImage: '/api/placeholder/1200/300',
      following: 15,
      followers: 15,
      likes: 10
    };
  });

  // Form state kept completely separate from profileData
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    profileImage: '',
    bannerImage: ''
  });
  
  // Initialize form data ONLY when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        profileImage: profileData.profileImage,
        bannerImage: profileData.bannerImage
      });
    }
  }, [isOpen, profileData]);
  
  // Sample data for user uploads
  const uploads = [
    { id: 1, type: 'video', thumbnail: '/api/placeholder/300/200', title: 'Mountain Village', views: 171, likes: 24, comments: 5 },
    { id: 2, type: 'video', thumbnail: '/api/placeholder/300/200', title: 'Summer Beach', views: 253, likes: 42, comments: 12 },
    { id: 3, type: 'image', thumbnail: '/api/placeholder/300/200', title: 'City Sunset', views: 198, likes: 30, comments: 8 },
    { id: 4, type: 'audio', thumbnail: '/api/placeholder/300/200', title: 'Morning Melody', views: 105, likes: 18, comments: 3 },
    { id: 5, type: 'video', thumbnail: '/api/placeholder/300/200', title: 'Forest Walk', views: 312, likes: 56, comments: 14 },
    { id: 6, type: 'image', thumbnail: '/api/placeholder/300/200', title: 'Night Sky', views: 287, likes: 45, comments: 10 }
  ];
  
  // Handle input changes in the edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle file upload
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prevData => ({
          ...prevData,
          [type]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission - only updates profileData on explicit submit
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    const updatedProfileData = {
      ...profileData,
      ...formData
    };
    
    setProfileData(updatedProfileData);
    localStorage.setItem('profileData', JSON.stringify(updatedProfileData));
    
    onClose();
  };
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'image':
        return FiImage;
      case 'video':
        return FiVideo;
      case 'audio':
        return FiMusic;
      default:
        return FiImage;
    }
  };
  
  const renderUserUploads = (mediaItems) => {
    return (
      <Grid 
        templateColumns={{ 
          base: "1fr", 
          sm: "repeat(2, 1fr)", 
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)", 
          xl: "repeat(5, 1fr)"  
        }}  
        gap={6}
        width="100%"
        mt={6}
      >
        {mediaItems.map((item) => (
          <Box 
            key={item.id}
            borderRadius="lg" 
            overflow="hidden"
            bg={colorMode === 'dark' ? "#121212" : 'white'}
            boxShadow="md"
            transition="transform 0.3s"
            _hover={{ transform: 'translateY(-5px)' }}
          >
            <Box position="relative">
              <Image 
                src={item.thumbnail} 
                alt={item.title}
                width="100%"
                height="180px"
                objectFit="cover"
              />
              <Box 
                position="absolute" 
                top="10px" 
                right="10px"
                bg="rgba(0,0,0,0.6)"
                color="white"
                borderRadius="md"
                p={1}
              >
                <Icon as={getTypeIcon(item.type)} />
              </Box>
            </Box>
            <Box p={4}>
              <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                {item.title}
              </Text>
              <HStack mt={2} spacing={4} color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                <HStack spacing={1}>
                  <Icon as={FiEye} />
                  <Text fontSize="sm">{item.views}</Text>
                </HStack>
                <HStack spacing={1}>
                  <Icon as={FiHeart} />
                  <Text fontSize="sm">{item.likes}</Text>
                </HStack>
                <HStack spacing={1}>
                  <Icon as={FiMessageCircle} />
                  <Text fontSize="sm">{item.comments}</Text>
                </HStack>
              </HStack>
            </Box>
          </Box>
        ))}
      </Grid>
    );
  };
  
  return (
    <Box 
      w="100%"
      minW={{ base: "100%", md: isNavbarOpen ? "calc(100vw - 240px)" : "calc(100vw - 90px)" }}
      overflowX="hidden"
    >
      {/* Banner Image */}
      <Box 
        position="relative" 
        width="100%" 
        height="250px"
        overflow="hidden"
      >
        <Image 
          src={profileData.bannerImage} 
          alt="Profile Banner"
          width="100%"
          height="100%"
          objectFit="cover"
        />
      </Box>
      
      {/* Profile Section */}
      <Flex 
        direction="column" 
        maxW="100%"
        w="100%"
        mx="auto" 
        px={{ base: 4, md: 8 }}
        transform="translateY(-60px)"
      >
        <Flex 
          direction={{ base: "column", md: "row" }} 
          alignItems={{ base: "center", md: "flex-end" }}
          justifyContent="space-between"
          bg={colorMode === 'dark' ? "#333e4b" : 'white'}
          borderRadius="lg"
          boxShadow="lg"
          p={6}
          pb={8}
          position="relative"
        >
          {/* Profile Picture */}
          <Flex direction="column" alignItems={{ base: "center", md: "flex-start" }} mb={{ base: 6, md: 0 }}>
            <Avatar 
              src={profileData.profileImage} 
              name={profileData.displayName}
              size="2xl"
              border="4px solid"
              borderColor={colorMode === 'dark' ? 'gray.800' : 'white'}
              mb={4}
              transform="translateY(-40px)"
            />
            
            <VStack spacing={1} align={{ base: "center", md: "flex-start" }} mt={{ base: -6, md: -10 }}>
              <Heading size="lg">{profileData.username}</Heading>
              <Text color="gray.500">@{profileData.displayName}</Text>
            </VStack>
            
            <Text mt={4} maxW="400px">
              {profileData.bio}
            </Text>
            
            <HStack mt={6} spacing={6}>
              <VStack spacing={0} align="center">
                <HStack>
                  <Icon as={FiUser} color="gray.500" />
                  <Text fontWeight="bold">{profileData.following}</Text>
                </HStack>
                <Text fontSize="sm" color="gray.500">Following</Text>
              </VStack>
              
              <VStack spacing={0} align="center">
                <HStack>
                  <Icon as={FiUsers} color="gray.500" />
                  <Text fontWeight="bold">{profileData.followers}</Text>
                </HStack>
                <Text fontSize="sm" color="gray.500">Followers</Text>
              </VStack>
              
              <VStack spacing={0} align="center">
                <HStack>
                  <Icon as={FiHeart} color="gray.500" />
                  <Text fontWeight="bold">{profileData.likes}</Text>
                </HStack>
                <Text fontSize="sm" color="gray.500">Likes</Text>
              </VStack>
            </HStack>
          </Flex>
          
          {/* Edit Profile Button */}
          <Button 
            leftIcon={<FiEdit />} 
            colorScheme="pink" 
            onClick={onOpen}
            size="md"
            position={{ base: "relative", md: "absolute" }}
            top={{ md: "20px" }}
            right={{ md: "20px" }}
          >
            Edit profile
          </Button>
        </Flex>
        
        {/* Content Tabs */}
        <Box 
          mt={8}
          w="100%" 
          bg={colorMode === 'dark' ? "#333e4b" : 'white'} 
          borderRadius="lg"
          boxShadow="md"
          p={4}
        >
          <Tabs isFitted colorScheme="blue" onChange={(index) => setActiveTab(index)}>
            <TabList>
              <Tab><HStack><Icon as={FiVideo} /><Text>Videos</Text></HStack></Tab>
              <Tab><HStack><Icon as={FiImage} /><Text>Reposts</Text></HStack></Tab>
              <Tab><HStack><Icon as={FiHeart} /><Text>Favorites</Text></HStack></Tab>
              <Tab><HStack><Icon as={FiHeart} /><Text>Liked</Text></HStack></Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={4}>
                {renderUserUploads(uploads.filter(item => item.type === 'video'))}
              </TabPanel>
              
              <TabPanel p={4}>
                {renderUserUploads(uploads.slice(2, 5))}
              </TabPanel>
              
              <TabPanel p={4}>
                {renderUserUploads(uploads.filter(item => item.likes > 30))}
              </TabPanel>
              
              <TabPanel p={4}>
                {renderUserUploads(uploads.filter(item => item.likes > 20))}
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          {activeTab === 0 && uploads.filter(item => item.type === 'video').length === 0 && (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg" color="gray.500">No videos uploaded yet</Text>
            </Box>
          )}
          
          {activeTab === 1 && uploads.slice(2, 5).length === 0 && (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg" color="gray.500">No reposts yet</Text>
            </Box>
          )}
        </Box>
      </Flex>
      
      {/* Edit Profile Modal - Modified to ensure it doesn't reopen unexpectedly */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="lg"
        initialFocusRef={initialFocusRef}
        closeOnOverlayClick={false}
      >
        <ModalOverlay 
          bg="blackAlpha.700"
          backdropFilter="blur(10px)"
        />
        <ModalContent 
          bg={colorMode === 'dark' ? "#121212" : 'white'}
          borderRadius="xl"
          boxShadow="xl"
          p={2}
        >
          <ModalHeader 
            borderBottomWidth="1px" 
            borderColor={colorMode === 'dark' ? "gray.700" : "gray.200"}
            py={4}
          >
            Edit Profile
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody py={6}>
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel fontWeight="medium">Username</FormLabel>
                  <Input
                    ref={initialFocusRef}
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username..."
                    borderRadius="md"
                    bg={colorMode === 'dark' ? "gray.700" : "gray.50"}
                    autoComplete="off"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">Display Name</FormLabel>
                  <Input
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Enter display name..."
                    borderRadius="md"
                    bg={colorMode === 'dark' ? "gray.700" : "gray.50"}
                    autoComplete="off"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">Bio</FormLabel>
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Write something about yourself..."
                    resize="vertical"
                    borderRadius="md"
                    bg={colorMode === 'dark' ? "gray.700" : "gray.50"}
                    minH="100px"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">Profile Picture</FormLabel>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'profileImage')}
                    ref={profileImageRef}
                    style={{ display: 'none' }}
                  />
                  <Flex align="center" gap={4}>
                    <Avatar
                      size="xl"
                      src={formData.profileImage}
                      name={formData.displayName}
                      border="3px solid"
                      borderColor={colorMode === 'dark' ? "blue.400" : "blue.500"}
                    />
                    <Button
                      type="button"
                      onClick={() => profileImageRef.current?.click()}
                      colorScheme="blue"
                      leftIcon={<FiImage />}
                      size="md"
                      borderRadius="md"
                    >
                      Choose Image
                    </Button>
                  </Flex>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">Banner Image</FormLabel>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'bannerImage')}
                    ref={bannerImageRef}
                    style={{ display: 'none' }}
                  />
                  <Box position="relative" height="120px" mb={3} borderRadius="md" overflow="hidden">
                    <Image
                      src={formData.bannerImage}
                      alt="Banner preview"
                      objectFit="cover"
                      w="100%"
                      h="100%"
                    />
                  </Box>
                  <Button
                    type="button"
                    onClick={() => bannerImageRef.current?.click()}
                    colorScheme="blue"
                    leftIcon={<FiImage />}
                    width="full"
                    borderRadius="md"
                  >
                    Choose Banner Image
                  </Button>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter 
              borderTopWidth="1px" 
              borderColor={colorMode === 'dark' ? "gray.700" : "gray.200"}
              py={4}
            >
              <Button 
                type="button"
                variant="outline" 
                mr={3} 
                onClick={onClose}
                borderRadius="md"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                colorScheme="blue" 
                borderRadius="md"
              >
                Save Changes
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProfilePage;