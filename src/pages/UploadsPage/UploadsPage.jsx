import React, { useState } from 'react';
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

const UploadsPage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { isNavbarOpen } = useNavbar();
  const { colorMode } = useColorMode();

  // Sample data for uploads
  const uploads = [
    { id: 1, type: 'image', thumbnail: '/api/placeholder/300/200', title: 'Mountain Scenery', views: 171, likes: 24, comments: 5 },
    { id: 2, type: 'video', thumbnail: '/api/placeholder/300/200', title: 'Summer Beach', views: 253, likes: 42, comments: 12 },
    { id: 3, type: 'image', thumbnail: '/api/placeholder/300/200', title: 'City Sunset', views: 198, likes: 30, comments: 8 },
    { id: 4, type: 'audio', thumbnail: '/api/placeholder/300/200', title: 'Morning Melody', views: 105, likes: 18, comments: 3 },
    { id: 5, type: 'video', thumbnail: '/api/placeholder/300/200', title: 'Forest Walk', views: 312, likes: 56, comments: 14 },
    { id: 6, type: 'image', thumbnail: '/api/placeholder/300/200', title: 'Night Sky', views: 287, likes: 45, comments: 10 }
  ];

  // Sample data for tidal waves (collections)
  const tidalWaves = [
    { id: 1, title: 'Summer Vibes', items: 5, thumbnail: '/api/placeholder/300/200' },
    { id: 2, title: 'Urban Photography', items: 3, thumbnail: '/api/placeholder/300/200' },
    { id: 3, title: 'Nature Sounds', items: 7, thumbnail: '/api/placeholder/300/200' },
    { id: 4, title: 'Travel Memories', items: 4, thumbnail: '/api/placeholder/300/200' }
  ];

  // Sample ratings data
  const ratingsData = [
    { stars: 5, count: 24 },
    { stars: 4, count: 18 },
    { stars: 3, count: 7 },
    { stars: 2, count: 3 },
    { stars: 1, count: 1 }
  ];

  const getTotalRatings = () => {
    return ratingsData.reduce((total, rating) => total + rating.count, 0);
  };

  const getAverageRating = () => {
    const totalStars = ratingsData.reduce((total, rating) => total + (rating.stars * rating.count), 0);
    const totalRatings = getTotalRatings();
    return totalRatings > 0 ? (totalStars / totalRatings).toFixed(1) : "N/A";
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
          xl: "repeat(5, 1fr)", // Add more columns for extra large screens
          "2xl": "repeat(6, 1fr)" // Add even more columns for 2xl screens
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
              {item.views !== undefined && (
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
              )}
              {item.items !== undefined && (
                <HStack mt={2}>
                  <Badge colorScheme="blue">{item.items} items</Badge>
                </HStack>
              )}
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
            <Heading size="md">Ratings Overview</Heading>
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
        </VStack>
      </Box>
    );
  };

  return (
    <Flex
      w={{ base: "100%", md: isNavbarOpen ? "calc(100vw - 240px)" : "calc(100vw - 90px)" }}
      p={8}
      transition="width 0.2s"
      overflowX="hidden"
    >
      <Box
        w="100%"
        maxW="100%"
        mx="auto"
        bg={colorMode === 'dark' ? '#121212' : 'gray.50'}
        borderRadius="lg"
        p={6}
      >
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="lg" color={colorMode === 'light' ? 'gray.800' : 'white'}>
              My Uploads
            </Heading>
            <Button colorScheme="blue">Upload New</Button>
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
                </HStack>
              </Tab>
              <Tab _selected={{ color: "white", bg: "blue.500" }}>
                <HStack>
                  <Text>Tidal Waves</Text>
                </HStack>
              </Tab>
              <Tab _selected={{ color: "white", bg: "blue.500" }}>
                <HStack>
                  <Text>Ratings</Text>
                </HStack>
              </Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={4}>
                {renderMediaGrid(uploads)}
              </TabPanel>
              
              <TabPanel p={4}>
                {renderMediaGrid(tidalWaves)}
              </TabPanel>
              
              <TabPanel p={4}>
                {renderRatings()}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
    </Flex>
  );
};

export default UploadsPage;