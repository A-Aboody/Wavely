import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  Image,
  VStack,
  HStack,
  Badge,
  Icon,
  useColorMode,
  Progress,
  Divider,
  Button,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  InputGroup,
  InputRightElement,
  Input,
  IconButton,
  Spinner,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { 
  FiImage, 
  FiVideo, 
  FiMusic, 
  FiStar, 
  FiHeart, 
  FiMessageCircle, 
  FiEye,
  FiSend
} from 'react-icons/fi';
import { useNavbar } from "../../context/NavbarContext";
import { useWaves } from '../../context/WaveContext';
import { useUser } from '../../context/UserContext';

const UploadsPage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { isNavbarOpen } = useNavbar();
  const { colorMode } = useColorMode();
  const { waves, likeWave, addComment, deleteWave } = useWaves();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  
  // Wave modal state and handlers
  const [selectedWave, setSelectedWave] = useState(null);
  const [newComment, setNewComment] = useState('');
  const { isOpen: isWaveModalOpen, onOpen: onWaveModalOpen, onClose: onWaveModalClose } = useDisclosure();

  const handleUploadClick = () => {
    navigate('/create');
  };

  // Listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data
  useEffect(() => {
    // Check if current user is available
    if (currentUser) {
      setLoading(false);
    } else {
      // If no current user, redirect to auth
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  // Get user's uploads from waves
  const userUploads = waves.filter(wave => wave.userId === (currentUser?.uid || ''));
  
  // Get user's rated waves (with ratings)
  const ratedWaves = userUploads.filter(wave => wave.rating !== null);

  // Calculate ratings data
  const ratingsData = [
    { stars: 5, count: ratedWaves.filter(wave => Math.round(wave.rating) === 5).length },
    { stars: 4, count: ratedWaves.filter(wave => Math.round(wave.rating) === 4).length },
    { stars: 3, count: ratedWaves.filter(wave => Math.round(wave.rating) === 3).length },
    { stars: 2, count: ratedWaves.filter(wave => Math.round(wave.rating) === 2).length },
    { stars: 1, count: ratedWaves.filter(wave => Math.round(wave.rating) === 1).length }
  ];

  const getTotalRatings = () => {
    return ratingsData.reduce((total, rating) => total + rating.count, 0);
  };

  const getAverageRating = () => {
    const totalStars = ratedWaves.reduce((total, wave) => total + (wave.rating || 0), 0);
    return ratedWaves.length > 0 ? (totalStars / ratedWaves.length).toFixed(1) : "N/A";
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

  // Wave modal handlers
  const handleWaveClick = (wave) => {
    setSelectedWave(wave);
    onWaveModalOpen();
  };

  const handleLike = (waveId) => {
    likeWave(waveId);
    if (selectedWave && selectedWave.id === waveId) {
      setSelectedWave(waves.find(w => w.id === waveId));
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedWave || !currentUser) return;
    
    const commentData = {
      id: Date.now(),
      userId: currentUser.uid,
      username: currentUser.username,
      displayName: currentUser.displayName,
      profileImage: currentUser.profileImage,
      content: newComment,
      timestamp: new Date().toISOString()
    };
    
    addComment(selectedWave.id, commentData);
    setNewComment('');
    setSelectedWave(waves.find(w => w.id === selectedWave.id));
    
    toast({
      title: "Comment added",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <Box position="relative" height="180px">
          {wave.mediaType === 'image' && (
            <Image 
              src={wave.mediaUrls?.[0] || '/placeholder-image.jpg'}
              alt={wave.title || 'Wave image'}
              width="100%"
              height="100%"
              objectFit="cover"
            />
          )}
          
          {wave.mediaType === 'video' && (
            <>
              <Image 
                src={wave.thumbnailUrl || '/placeholder-video.jpg'}
                alt={wave.title || 'Wave video thumbnail'}
                width="100%"
                height="100%"
                objectFit="cover"
              />
              <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
                <Icon as={FiVideo} color="white" boxSize={6} />
              </Box>
            </>
          )}
          
          {wave.mediaType === 'audio' && (
            <Flex height="100%" align="center" justify="center" bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}>
              <Icon as={FiMusic} boxSize={8} />
            </Flex>
          )}
          
          {wave.rating && (
            <Badge position="absolute" bottom="2" left="2" colorScheme="yellow">
              <HStack spacing={1}>
                <Icon as={FiStar} />
                <Text>{wave.rating.toFixed(1)}</Text>
              </HStack>
            </Badge>
          )}
        </Box>
        
        <Box p={4}>
          <Text fontWeight="bold" noOfLines={1}>{wave.title || 'Untitled Wave'}</Text>
          <HStack mt={2} spacing={4} color="gray.500">
            <HStack spacing={1}>
              <Icon as={FiHeart} />
              <Text fontSize="sm">{wave.likes || 0}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiMessageCircle} />
              <Text fontSize="sm">{wave.comments || 0}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiEye} />
              <Text fontSize="sm">{wave.views || 0}</Text>
            </HStack>
          </HStack>
        </Box>
      </Box>
    );
  };

  const renderRatings = () => {
    const totalRatings = getTotalRatings();
    
    return (
      <Box 
        width="100%"
        maxW="100%"
        bg={colorMode === 'dark' ? '#121212' : 'white'}
        borderRadius="lg"
        boxShadow="md"
        p={6}
      >
        <VStack align="stretch" spacing={5}>
          <Flex justify="space-between" align="center">
            <Heading size="md">Your Ratings</Heading>
            <HStack>
              <Icon as={FiStar} color="yellow.400" />
              <Text fontWeight="bold">{getAverageRating()}</Text>
              <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>({totalRatings} ratings)</Text>
            </HStack>
          </Flex>
          
          <Divider />
          
          <VStack align="stretch" spacing={3}>
            {ratingsData.map((rating, index) => (
              <HStack key={index} spacing={4}>
                <HStack width="80px">
                  <Text fontWeight="medium">{rating.stars}</Text>
                  <Icon as={FiStar} color="yellow.400" />
                </HStack>
                <Progress 
                  value={totalRatings > 0 ? (rating.count / totalRatings) * 100 : 0} 
                  size="sm" 
                  colorScheme="yellow" 
                  borderRadius="full"
                  flex={1}
                />
                <Text width="40px" textAlign="right">{rating.count}</Text>
              </HStack>
            ))}
          </VStack>

          <Divider mt={6} />

          <Heading size="md" mt={6}>Your Rated Content</Heading>
          {ratedWaves.length > 0 ? (
            <Grid 
              templateColumns={{ 
                base: "1fr", 
                sm: "repeat(2, 1fr)", 
                md: "repeat(3, 1fr)", 
                lg: "repeat(4, 1fr)",
                xl: "repeat(5, 1fr)",
                "2xl": "repeat(6, 1fr)"
              }}        
              gap={6}
              width="100%"
              mt={4}
            >
              {ratedWaves.map(wave => renderWaveThumbnail(wave))}
            </Grid>
          ) : (
            <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} mt={4}>
              You haven't received any ratings on your content yet.
            </Text>
          )}
        </VStack>
      </Box>
    );
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box
      width="100vw"
      ml={isMobile ? 0 : isNavbarOpen ? "-240px" : "-90px"}
      pl={isMobile ? 0 : isNavbarOpen ? "240px" : "90px"}
      transition="all 0.2s"
      overflowX="hidden"
    >
      {/* Banner Section */}
      {currentUser?.bannerImage && (
        <Box 
          width="100%"
          height="200px"
          overflow="hidden"
        >
          <Image 
            src={currentUser.bannerImage}
            alt="Profile banner"
            width="100%"
            height="100%"
            objectFit="cover"
          />
        </Box>
      )}

      <Box
        w="100%"
        maxW="100%"
        mx="auto"
        bg={colorMode === 'dark' ? '#121212' : 'gray.50'}
        p={6}
        pb={isMobile ? "80px" : 6} // Add bottom padding on mobile for the navbar
      >
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="lg" color={colorMode === 'light' ? 'gray.800' : 'white'}>
              My Uploads
            </Heading>
            <Button onClick={handleUploadClick} colorScheme="blue">Upload New</Button>
          </Flex>

          <Tabs 
            isFitted 
            variant="enclosed" 
            colorScheme="blue" 
            onChange={(index) => setCurrentTab(index)}
            bg={colorMode === 'dark' ? "gray.800" : 'white'}
            borderRadius="lg"
            boxShadow="sm"
            p={4}
          >
            <TabList mb="1em">
              <Tab _selected={{ color: "white", bg: "blue.500" }}>
                <HStack>
                  <Text>All Uploads</Text>
                  <Badge colorScheme="blue" ml={1}>{userUploads.length}</Badge>
                </HStack>
              </Tab>
              <Tab _selected={{ color: "white", bg: "blue.500" }}>
                <HStack>
                  <Text>Ratings</Text>
                  <Badge colorScheme="yellow" ml={1}>{getTotalRatings()}</Badge>
                </HStack>
              </Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={4}>
                {userUploads.length > 0 ? (
                  <Grid 
                    templateColumns={{ 
                      base: "1fr", 
                      sm: "repeat(2, 1fr)", 
                      md: "repeat(3, 1fr)", 
                      lg: "repeat(4, 1fr)",
                      xl: "repeat(5, 1fr)",
                      "2xl": "repeat(6, 1fr)"
                    }}        
                    gap={6}
                    width="100%"
                  >
                    {userUploads.map(wave => renderWaveThumbnail(wave))}
                  </Grid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
                      You haven't uploaded any content yet.
                    </Text>
                    <Button mt={4} colorScheme="blue" onClick={handleUploadClick}>
                      Create Your First Wave
                    </Button>
                  </Box>
                )}
              </TabPanel>
              
              <TabPanel p={4}>
                {renderRatings()}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>

      {/* Wave Detail Modal */}
      {selectedWave && (
        <Modal isOpen={isWaveModalOpen} onClose={onWaveModalClose} size="6xl">
          <ModalOverlay />
          <ModalContent bg={colorMode === 'dark' ? '#121212' : 'white'}>
            <ModalHeader>
              <HStack>
                <Avatar src={selectedWave.profileImage} name={selectedWave.displayName} size="sm" />
                <Box>
                  <Text fontWeight="bold">{selectedWave.displayName}</Text>
                  <Text fontSize="sm" color="gray.500">
                    @{selectedWave.username} • {formatTimestamp(selectedWave.timestamp)}
                  </Text>
                </Box>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
                <Box flex={1}>
                  {selectedWave.mediaType === 'image' && (
                    <Image
                      src={selectedWave.mediaUrls?.[0]}
                      alt={selectedWave.title}
                      width="100%"
                      maxHeight="60vh"
                      objectFit="contain"
                    />
                  )}
                  {selectedWave.mediaType === 'video' && (
                    <Box as="video" src={selectedWave.mediaUrls?.[0]} controls width="100%" />
                  )}
                  {selectedWave.mediaType === 'audio' && (
                    <Box as="audio" src={selectedWave.mediaUrls?.[0]} controls width="100%" />
                  )}
                  <Box mt={4}>
                    <Flex justify="space-between" align="center">
                      <Heading size="md">{selectedWave.title}</Heading>
                      <HStack spacing={4}>
                        <Button
                          size="sm"
                          leftIcon={<FiHeart />}
                          colorScheme={selectedWave.likedBy?.includes(currentUser?.uid) ? "red" : "gray"}
                          onClick={() => handleLike(selectedWave.id)}
                        >
                          {selectedWave.likes || 0}
                        </Button>
                        
                        {selectedWave.userId === currentUser?.uid && (
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => {
                              deleteWave(selectedWave.id);
                              onWaveModalClose();
                              toast({
                                title: "Wave deleted",
                                status: "success",
                                duration: 3000,
                                isClosable: true,
                              });
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </HStack>
                    </Flex>
                    <Text mt={2}>{selectedWave.content}</Text>
                  </Box>
                </Box>
                <Box width={{ base: '100%', md: '350px' }}>
                  <Heading size="md" mb={4}>Comments ({selectedWave.comments || 0})</Heading>
                  <InputGroup mb={4}>
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <InputRightElement>
                      <IconButton
                        icon={<FiSend />}
                        aria-label="Send comment"
                        onClick={handleAddComment}
                        isDisabled={!newComment.trim()}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <VStack align="stretch" spacing={4} maxHeight="400px" overflowY="auto">
                    {selectedWave.commentsList?.length > 0 ? (
                      selectedWave.commentsList.map(comment => (
                        <Box key={comment.id} p={3} bg={colorMode === 'dark' ? 'gray.800' : 'gray.100'} borderRadius="md">
                          <Flex justify="space-between" mb={2}>
                            <HStack>
                              <Avatar src={comment.profileImage} name={comment.displayName} size="sm" />
                              <Text fontWeight="bold">{comment.displayName}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.500">
                              {formatTimestamp(comment.timestamp)}
                            </Text>
                          </Flex>
                          <Text>{comment.content}</Text>
                        </Box>
                      ))
                    ) : (
                      <Text color="gray.500" textAlign="center">No comments yet. Be the first to comment!</Text>
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

export default UploadsPage;