import React, { useState, useEffect } from 'react';
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
  Button
} from '@chakra-ui/react';
import { FiImage, FiVideo, FiMusic, FiStar, FiHeart, FiMessageCircle, FiEye } from 'react-icons/fi';
import { useNavbar } from "../../context/NavbarContext";
import { useWaves } from '../../context/WaveContext';

const UploadsPage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { isNavbarOpen } = useNavbar();
  const { colorMode } = useColorMode();
  const { waves } = useWaves();
  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleUploadClick = () => {
    navigate('/create');
  }

  // Listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load profile data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('profileData');
    if (savedData) {
      setProfileData(JSON.parse(savedData));
    }
  }, []);

  // Get user's uploads from waves
  const userUploads = waves.filter(wave => wave.username === (profileData?.username || ''));
  
  // Get user's rated waves (with ratings)
  const ratedWaves = waves.filter(wave => wave.rating !== null && wave.username === (profileData?.username || ''));

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
    const totalStars = ratedWaves.reduce((total, wave) => total + wave.rating, 0);
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

  const renderMediaGrid = (mediaItems) => {
    return (
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
        {mediaItems.map((item) => (
          <Box 
            key={item.id}
            borderRadius="lg" 
            overflow="hidden"
            bg={colorMode === 'dark' ? '#121212' : 'white'}
            boxShadow="md"
            transition="transform 0.3s"
            _hover={{ transform: 'translateY(-5px)' }}
          >
            <Box position="relative">
              <Image 
                src={item.image || item.thumbnail} 
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
                <Icon as={getTypeIcon(item.mediaType || item.type)} />
              </Box>
              {item.rating && (
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
                    <Text fontSize="sm">{item.rating.toFixed(1)}</Text>
                  </HStack>
                </Box>
              )}
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
            renderMediaGrid(ratedWaves)
          ) : (
            <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} mt={4}>
              You haven't rated any content yet.
            </Text>
          )}
        </VStack>
      </Box>
    );
  };

  return (
    <Box
      width="100vw"
      ml={isMobile ? 0 : isNavbarOpen ? "-240px" : "-90px"}
      pl={isMobile ? 0 : isNavbarOpen ? "240px" : "90px"}
      transition="all 0.2s"
      overflowX="hidden"
    >
      {/* Banner Section */}
      {profileData?.bannerImage && (
        <Box 
          width="100%"
          height="200px"
          overflow="hidden"
        >
          <Image 
            src={profileData.bannerImage}
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
            bg={colorMode === 'dark' ? "#333e4b" : 'white'}
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
                  renderMediaGrid(userUploads)
                ) : (
                  <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} textAlign="center" py={10}>
                    You haven't uploaded any content yet.
                  </Text>
                )}
              </TabPanel>
              
              <TabPanel p={4}>
                {renderRatings()}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
    </Box>
  );
};

export default UploadsPage;