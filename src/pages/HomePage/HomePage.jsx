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
  Input,
  useColorMode,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { 
  FiHeart, 
  FiMessageCircle, 
  FiEye,
  FiSave,
  FiMoreHorizontal,
  FiUser,
  FiUsers,
  FiHome,
  FiCompass,
  FiPlusSquare,
  FiStar
} from 'react-icons/fi';
import { useNavbar } from "../../context/NavbarContext";

const HomePage = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const { isNavbarOpen } = useNavbar();
  
  // Sample user data
  const [userData] = useState(() => {
    const savedData = localStorage.getItem('profileData');
    return savedData ? JSON.parse(savedData) : {
      username: 'DefaultUser',
      displayName: 'Default',
      profileImage: '/api/placeholder/200/200'
    };
  });
  
  // Sample waves data (posts from friends)
  const [waves, setWaves] = useState([
    {
      id: 1,
      username: 'wave_rider',
      displayName: 'Kelly Slater',
      profileImage: '/api/placeholder/100/100',
      content: 'Just caught the most amazing wave at Pipeline today! The conditions were perfect.',
      image: '/api/placeholder/600/400',
      timestamp: '2h ago',
      likes: 243,
      comments: 42,
      views: 1283,
      rating: 4.8,
    },
    {
      id: 2,
      username: 'beach_lover',
      displayName: 'Malia Jones',
      profileImage: '/api/placeholder/100/100',
      content: 'Sunset session at Waikiki was magical. Small waves but perfect for longboarding.',
      image: '/api/placeholder/600/400',
      timestamp: '5h ago',
      likes: 187,
      comments: 23,
      views: 891,
      rating: 4.2,
    },
    {
      id: 3,
      username: 'surf_pro',
      displayName: 'John Florence',
      profileImage: '/api/placeholder/100/100',
      content: 'Testing my new board at Sunset Beach. These glassy conditions are rare!',
      image: '/api/placeholder/600/400',
      timestamp: '1d ago',
      likes: 427,
      comments: 56,
      views: 2104,
      rating: 4.9,
    },
    {
      id: 4,
      username: 'ocean_girl',
      displayName: 'Carissa Moore',
      profileImage: '/api/placeholder/100/100',
      content: 'Morning surf check. Looks like today will be pumping at Off the Wall.',
      image: '/api/placeholder/600/400',
      timestamp: '1d ago',
      likes: 312,
      comments: 38,
      views: 1572,
      rating: 4.5,
    }
  ]);
  
  // Function to handle liking a wave
  const handleLike = (id) => {
    setWaves(waves.map(wave => 
      wave.id === id ? {...wave, likes: wave.likes + 1} : wave
    ));
  };
  
  return (
    <Flex 
      direction="column" 
      w={{ base: "100%", md: isNavbarOpen ? "calc(100vw - 240px)" : "calc(100vw - 90px)" }}
      transition="width 0.2s"
      bg={isDark ? '#121212' : 'white'}
      overflow="hidden"
      position="relative"
      h="100vh"
    >
      {/* Top Navigation */}
      <Flex 
        as="nav" 
        align="center" 
        justify="space-between" 
        wrap="wrap" 
        padding="1rem"
        bg={isDark ? "#121212" : "white"}
        color={isDark ? "white" : "black"}
        borderBottom="1px solid"
        borderColor={isDark ? "gray.700" : "gray.200"}
        position="sticky"
        top="0"
        zIndex="10"
      >
        <Heading as="h1" size="lg" letterSpacing="tight" fontWeight="bold">
          Wavely
        </Heading>
        
        <Input
          placeholder="Search waves, riders, beaches..."
          width={{ base: "100%", md: "300px" }}
          mx={{ base: 0, md: 4 }}
          my={{ base: 2, md: 0 }}
          display={{ base: "none", md: "block" }}
          bg={isDark ? "gray.800" : "gray.100"}
          border="none"
          borderRadius="full"
        />
        
        <HStack spacing={4}>
          <IconButton
            aria-label="Home"
            icon={<FiHome />}
            variant="ghost"
          />
          <IconButton
            aria-label="Explore"
            icon={<FiCompass />}
            variant="ghost"
          />
          <IconButton
            aria-label="New Post"
            icon={<FiPlusSquare />}
            variant="ghost"
          />
          <Avatar 
            size="sm" 
            src={userData.profileImage}
            name={userData.displayName}
            cursor="pointer"
          />
        </HStack>
      </Flex>
      
      {/* Main Content Area with Scrollable Container */}
      <Box 
        flex="1"
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': { display: 'none' },
          'scrollbarWidth': 'none',
          '-ms-overflow-style': 'none',
        }}
        bg={isDark ? "#121212" : "gray.100"}
        p={4}
      >
        {/* Main Content */}
        <Flex justify="center">
          <Grid
            templateColumns={{ base: "1fr", lg: "250px 1fr 250px" }}
            gap={6}
            width="100%"
            maxW="1200px"
            py={2}
          >
            {/* Left Sidebar - User Profile Summary */}
            <Box
              display={{ base: "none", lg: "block" }}
              bg={isDark ? "#1A1A1A" : "white"}
              p={4}
              borderRadius="lg"
              boxShadow="md"
              position="sticky"
              top="20px"
              height="fit-content"
            >
              <VStack align="center" spacing={4}>
                <Avatar 
                  size="xl" 
                  src={userData.profileImage} 
                  name={userData.displayName}
                />
                <Heading size="md">{userData.displayName}</Heading>
                <Text color="gray.500">@{userData.username}</Text>
                
                <Divider />
                
                <HStack width="100%" justify="space-between">
                  <VStack>
                    <Text fontWeight="bold">152</Text>
                    <Text fontSize="sm" color="gray.500">Waves</Text>
                  </VStack>
                  <VStack>
                    <Text fontWeight="bold">1.2K</Text>
                    <Text fontSize="sm" color="gray.500">Followers</Text>
                  </VStack>
                  <VStack>
                    <Text fontWeight="bold">720</Text>
                    <Text fontSize="sm" color="gray.500">Following</Text>
                  </VStack>
                </HStack>
                
                <Button colorScheme="blue" size="sm" width="full">
                  View Profile
                </Button>
              </VStack>
            </Box>
            
            {/* Center Feed - Friend Waves */}
            <VStack spacing={6} align="stretch">
              {waves.map((wave) => (
                <Box 
                  key={wave.id}
                  bg={isDark ? "#1A1A1A" : "white"}
                  borderRadius="lg"
                  boxShadow="md"
                  overflow="hidden"
                >
                  {/* Wave Header */}
                  <Flex p={4} align="center" justify="space-between">
                    <HStack>
                      <Avatar 
                        size="md" 
                        src={wave.profileImage} 
                        name={wave.displayName}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">{wave.displayName}</Text>
                        <Text fontSize="sm" color="gray.500">@{wave.username}</Text>
                      </VStack>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" color="gray.500">{wave.timestamp}</Text>
                      <IconButton
                        aria-label="More options"
                        icon={<FiMoreHorizontal />}
                        variant="ghost"
                        size="sm"
                      />
                    </HStack>
                  </Flex>
                  
                  {/* Wave Content */}
                  <Box px={4} pb={3}>
                    <Text>{wave.content}</Text>
                  </Box>
                  
                  {/* Wave Image */}
                  <Image 
                    src={wave.image} 
                    alt="Wave content"
                    width="100%"
                    objectFit="cover"
                  />
                  
                  {/* Wave Rating */}
                  <Flex 
                    bg={isDark ? "blue.900" : "blue.50"} 
                    p={2} 
                    align="center" 
                    justify="center"
                    borderBottom="1px solid"
                    borderColor={isDark ? "blue.800" : "blue.100"}
                  >
                    <HStack>
                      <Icon as={FiStar} color="yellow.400" />
                      <Text fontWeight="bold">Wave Rating: {wave.rating}/5.0</Text>
                    </HStack>
                  </Flex>
                  
                  {/* Wave Stats */}
                  <Flex p={4} justify="space-between" align="center">
                    <HStack spacing={6}>
                      <HStack spacing={1} cursor="pointer" onClick={() => handleLike(wave.id)}>
                        <Icon as={FiHeart} color={isDark ? "pink.200" : "pink.500"} />
                        <Text>{wave.likes}</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Icon as={FiMessageCircle} color={isDark ? "blue.200" : "blue.500"} />
                        <Text>{wave.comments}</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Icon as={FiEye} color="gray.500" />
                        <Text>{wave.views}</Text>
                      </HStack>
                    </HStack>
                    <IconButton
                      aria-label="Save post"
                      icon={<FiSave />}
                      variant="ghost"
                      size="sm"
                    />
                  </Flex>
                  
                  {/* Comment Input */}
                  <Flex px={4} pb={4} align="center">
                    <Avatar 
                      size="sm" 
                      mr={2}
                      src={userData.profileImage} 
                      name={userData.displayName}
                    />
                    <Input 
                      placeholder="Add a comment..." 
                      size="sm"
                      bg={isDark ? "gray.800" : "gray.100"}
                      border="none"
                      borderRadius="full"
                    />
                    <Button 
                      ml={2}
                      size="sm"
                      colorScheme="blue"
                      borderRadius="full"
                    >
                      Post
                    </Button>
                  </Flex>
                </Box>
              ))}
            </VStack>
            
            {/* Right Sidebar - Top Rated Waves */}
            <Box
              display={{ base: "none", lg: "block" }}
              bg={isDark ? "#1A1A1A" : "white"}
              p={4}
              borderRadius="lg"
              boxShadow="md"
              position="sticky"
              top="20px"
              height="fit-content"
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Top Rated Waves</Heading>
                
                {waves
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 3)
                  .map((wave) => (
                    <Flex key={wave.id} align="center" gap={3}>
                      <Image 
                        src={wave.image}
                        alt={`${wave.username}'s wave`}
                        boxSize="60px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                          {wave.displayName}
                        </Text>
                        <HStack>
                          <Icon as={FiStar} color="yellow.400" size="xs" />
                          <Text fontSize="sm">{wave.rating}</Text>
                        </HStack>
                      </VStack>
                    </Flex>
                  ))}
                
                <Divider />
                
                <Heading size="md" mt={2}>Friends Online</Heading>
                
                <HStack>
                  <Avatar size="sm" src="/api/placeholder/50/50" name="Friend 1" />
                  <Avatar size="sm" src="/api/placeholder/50/50" name="Friend 2" />
                  <Avatar size="sm" src="/api/placeholder/50/50" name="Friend 3" />
                  <Avatar size="sm" src="/api/placeholder/50/50" name="Friend 4" />
                  <Box 
                    borderRadius="full" 
                    bg={isDark ? "gray.700" : "gray.200"} 
                    px={2} 
                    fontSize="xs"
                  >
                    +12
                  </Box>
                </HStack>
                
                <Button variant="outline" width="full" leftIcon={<FiUsers />}>
                  See All Friends
                </Button>
              </VStack>
            </Box>
          </Grid>
        </Flex>
      </Box>
    </Flex>
  );
};

export default HomePage;