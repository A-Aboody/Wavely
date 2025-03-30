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
  Badge
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
import { useNavbar } from "../../context/NavbarContext";
import { useWaves } from '../../context/WaveContext';
import { useProfile } from '../../context/ProfileContext';
import { useRef, useEffect, useState } from 'react';

const ProfilePage = () => {
  const initialFocusRef = useRef();
  const profileImageRef = useRef();
  const bannerImageRef = useRef();
  const { isNavbarOpen } = useNavbar();
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedWave, setSelectedWave] = useState(null);
  const [newComment, setNewComment] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isWaveModalOpen, 
    onOpen: onWaveModalOpen, 
    onClose: onWaveModalClose 
  } = useDisclosure();
  const cancelRef = useRef();
  const { waves, deleteWave, likeWave, addComment } = useWaves();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { profileData, updateProfile } = useProfile();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    profileImage: '',
    bannerImage: ''
  });
  
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

  const userWaves = waves.filter(wave => wave.username === profileData.username);

  const handleLike = (waveId) => {
    likeWave(waveId);
    // Update the selected wave to reflect changes
    if (selectedWave && selectedWave.id === waveId) {
      setSelectedWave(waves.find(w => w.id === waveId));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData); // Use the context update function
    onClose();
  };

  const handleWaveClick = (wave) => {
    setSelectedWave(wave);
    onWaveModalOpen();
  };

  const formatTimestamp = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date(date);
    const dayName = days[d.getDay()];
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'p.m.' : 'a.m.';
    const formattedHours = hours % 12 || 12;
    
    return `(${dayName} ${formattedHours}:${minutes} ${period})`;
  };

  useEffect(() => {
    if (selectedWave) {
      const updatedWave = waves.find(w => w.id === selectedWave.id);
      if (updatedWave && JSON.stringify(updatedWave) !== JSON.stringify(selectedWave)) {
        setSelectedWave(updatedWave);
      }
    }
  }, [waves, selectedWave]);

  const handleAddComment = () => {
    if (newComment.trim() && selectedWave) {
      const commentData = {
        id: Date.now(),
        username: profileData.username,
        displayName: profileData.displayName,
        profileImage: profileData.profileImage,
        content: newComment,
        timestamp: formatTimestamp(new Date())
      };
      
      addComment(selectedWave.id, commentData);
      setNewComment('');
      
      // Update the selected wave to reflect new comment
      const updatedWave = waves.find(w => w.id === selectedWave.id);
      if (updatedWave) {
        setSelectedWave(updatedWave);
      }
    }
  };

  const renderWaveThumbnail = (wave) => {
    return (
      <Box 
        key={wave.id}
        borderRadius="lg" 
        overflow="hidden"
        bg={colorMode === 'dark' ? "#1a1a1a" : 'white'}
        boxShadow="md"
        borderWidth="1px"
        borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        cursor="pointer"
        onClick={() => handleWaveClick(wave)}
        transition="all 0.2s"
        _hover={{ transform: 'scale(1.02)' }}
      >
        <Box position="relative">
          {wave.mediaType === 'image' && (
            <Image 
              src={wave.image} 
              alt={wave.title || 'Wave image'}
              width="100%"
              height="180px"
              objectFit="cover"
            />
          )}
          
          {wave.mediaType === 'video' && (
            <Box position="relative" height="180px">
              <Image 
                src={wave.image} 
                alt={wave.title || 'Wave video thumbnail'}
                width="100%"
                height="100%"
                objectFit="cover"
              />
              <Box 
                position="absolute" 
                top="50%" 
                left="50%" 
                transform="translate(-50%, -50%)"
                bg="rgba(0,0,0,0.5)" 
                borderRadius="full"
                p={2}
              >
                <Icon as={FiVideo} color="white" boxSize={6} />
              </Box>
            </Box>
          )}
          
          {wave.mediaType === 'audio' && (
            <Flex 
              height="180px" 
              align="center" 
              justify="center" 
              bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
            >
              <Icon as={FiMusic} boxSize={8} />
            </Flex>
          )}
  
          {/* Type Icon */}
          <Box 
            position="absolute" 
            top="10px" 
            right="10px"
            bg="rgba(0,0,0,0.6)"
            color="white"
            borderRadius="md"
            p={1}
          >
            <Icon as={getTypeIcon(wave.mediaType)} />
          </Box>
          
          {/* Rating Badge */}
          {wave.rating && (
            <Box 
              position="absolute" 
              bottom="10px" 
              left="10px"
              bg="rgba(0,0,0,0.6)"
              color="white"
              borderRadius="md"
              px={2}
              py={1}
            >
              <HStack spacing={1}>
                <Icon as={FiStar} color="yellow.400" />
                <Text fontSize="sm">{typeof wave.rating === 'number' ? wave.rating.toFixed(1) : wave.rating}</Text>
              </HStack>
            </Box>
          )}
        </Box>
        
        <Box p={4}>
          <Text fontWeight="bold" noOfLines={1} mb={1}>
            {wave.title || 'Untitled Wave'}
          </Text>
          <HStack spacing={4} color="gray.500">
            <HStack spacing={1}>
              <Icon as={FiHeart} />
              <Text fontSize="sm">{wave.likes}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiMessageCircle} />
              <Text fontSize="sm">{wave.comments}</Text>
            </HStack>
          </HStack>
        </Box>
      </Box>
    );
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

  return (
    <Box 
      w="100vw"
      ml={isMobile ? 0 : isNavbarOpen ? "-240px" : "-90px"}
      pl={isMobile ? 0 : isNavbarOpen ? "240px" : "90px"}
      transition="all 0.2s"
      overflowX="hidden"
    >
      {/* Banner Image */}
      <Box position="relative" width="100%" height="250px" overflow="hidden">
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
        pb={isMobile ? "80px" : 6}
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
              <Tab><HStack><Icon as={FiVideo} /><Text>Waves</Text></HStack></Tab>
              <Tab><HStack><Icon as={FiHeart} /><Text>Liked</Text></HStack></Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={4}>
                {userWaves.length > 0 ? (
                  <Grid
                    templateColumns={{
                      base: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                      lg: "repeat(4, 1fr)"
                    }}
                    gap={4}
                    width="100%"
                  >
                    {userWaves.map(wave => renderWaveThumbnail(wave))}
                  </Grid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text fontSize="lg" color="gray.500">No waves posted yet</Text>
                  </Box>
                )}
              </TabPanel>
              
              <TabPanel p={4}>
                {waves.filter(wave => wave.likes > 0).length > 0 ? (
                  <Grid
                    templateColumns={{
                      base: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                      lg: "repeat(4, 1fr)"
                    }}
                    gap={4}
                    width="100%"
                  >
                    {waves
                      .filter(wave => wave.likes > 0)
                      .map(wave => renderWaveThumbnail(wave))}
                  </Grid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text fontSize="lg" color="gray.500">No liked waves yet</Text>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
      
      {/* Wave Detail Modal */}
      {selectedWave && (
        <Modal 
          isOpen={isWaveModalOpen} 
          onClose={onWaveModalClose}
          size="6xl"
          scrollBehavior="inside"
        >
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
          <ModalContent 
            bg={colorMode === 'dark' ? "#121212" : 'white'}
            borderRadius="xl"
            maxH="90vh"
          >
          <ModalHeader>
            <Flex justify="space-between" align="center">
              <HStack spacing={4}>
                <Avatar 
                  src={selectedWave.profileImage} 
                  name={selectedWave.displayName}
                  size="sm"
                />
                <Box>
                  <HStack spacing={2} align="center">
                    <Text fontWeight="bold">{selectedWave.displayName}</Text>
                    <Icon 
                      as={getTypeIcon(selectedWave.mediaType)} 
                      color="gray.500"
                      boxSize={4}
                    />
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    @{selectedWave.username} · {selectedWave.timestamp}
                  </Text>
                </Box>
              </HStack>
              <ModalCloseButton size="lg" />
            </Flex>
          </ModalHeader>
            
            <ModalBody>
              <Flex direction={{ base: "column", md: "row" }} gap={6}>
                {/* Media Section */}
                <Box flex={1}>
                  {selectedWave.mediaType === 'image' && (
                    <Image 
                      src={selectedWave.image} 
                      alt={selectedWave.title || 'Wave image'}
                      width="100%"
                      maxH="60vh"
                      objectFit="contain"
                      borderRadius="md"
                    />
                  )}
                  
                  {selectedWave.mediaType === 'video' && (
                    <Box
                      as="video"
                      src={selectedWave.mediaUrl || selectedWave.image}
                      controls
                      width="100%"
                      maxH="60vh"
                      borderRadius="md"
                    />
                  )}
                  
                  {selectedWave.mediaType === 'audio' && (
                    <Flex
                      width="100%"
                      height="200px"
                      align="center"
                      justify="center"
                      bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
                      borderRadius="md"
                    >
                      <Box width="90%">
                        <audio 
                          controls 
                          src={selectedWave.mediaUrl || selectedWave.image} 
                          style={{ width: '100%' }} 
                        />
                      </Box>
                    </Flex>
                  )}
                  
                  <HStack mt={4} spacing={4}>
                    <Button
                      leftIcon={<FiHeart />}
                      variant="ghost"
                      colorScheme={selectedWave.likes > 0 ? "red" : "gray"}
                      onClick={() => handleLike(selectedWave.id)}
                    >
                      {selectedWave.likes} Likes
                    </Button>
                    
                    {/* Rating Display */}
                    {selectedWave.rating && (
                      <Button
                        leftIcon={<FiStar />}
                        variant="ghost"
                        colorScheme="yellow"
                      >
                        {typeof selectedWave.rating === 'number' ? selectedWave.rating.toFixed(1) : selectedWave.rating} Rating
                      </Button>
                    )}
                    
                    {selectedWave.category && (
                      <Tag colorScheme="blue" size="lg">
                        {selectedWave.category}
                      </Tag>
                    )}
                  </HStack>
                  
                  <Box mt={4}>
                    <Heading size="md" mb={2}>{selectedWave.title}</Heading>
                    <Text>{selectedWave.content}</Text>
                  </Box>
                </Box>
                
                {/* Comments Section */}
                <Box 
                  flex={{ base: "1", md: "0 0 350px" }}
                  borderLeft={{ md: "1px solid" }}
                  borderColor={{ md: colorMode === 'dark' ? "gray.700" : "gray.200" }}
                  pl={{ md: 6 }}
                  pt={{ base: 6, md: 0 }}
                >
                  <Heading size="md" mb={4}>Comments ({selectedWave.comments})</Heading>
                  
                  <Box mb={4}>
                    <InputGroup>
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        pr="4.5rem"
                      />
                      <InputRightElement width="4.5rem">
                        <IconButton
                          icon={<FiSend />}
                          h="1.75rem"
                          size="sm"
                          onClick={handleAddComment}
                          isDisabled={!newComment.trim()}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </Box>
                  
                  <VStack 
                    spacing={4} 
                    align="stretch"
                    maxH={{ base: "300px", md: "60vh" }}
                    overflowY="auto"
                    pr={2}
                  >
                    {selectedWave.commentsList?.length > 0 ? (
                      selectedWave.commentsList.map(comment => (
                        <Box 
                          key={comment.id}
                          p={3}
                          bg={colorMode === 'dark' ? "gray.800" : "gray.50"}
                          borderRadius="md"
                        >
                          <Flex justify="space-between" align="center" mb={2}>
                            <HStack>
                              <Avatar 
                                src={comment.profileImage} 
                                name={comment.displayName}
                                size="sm"
                              />
                              <Text fontWeight="bold">{comment.displayName}</Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              {comment.timestamp}
                            </Text>
                          </Flex>
                          <Text>{comment.content}</Text>
                        </Box>
                      ))
                    ) : (
                      <Text color="gray.500" textAlign="center" py={4}>
                        No comments yet
                      </Text>
                    )}
                  </VStack>
                </Box>
              </Flex>
            </ModalBody>
            
            <ModalFooter>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      
      {/* Edit Profile Modal */}
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
                      name={profileData.displayName} // Use profileData instead of formData
                      border="3px solid"
                      borderColor={colorMode === 'dark' ? "gray.700" : "gray.200"}
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