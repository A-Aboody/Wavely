import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import WaveCard from '../../custom_components/WaveCard/WaveCard';
import { useWaves } from '../../context/WaveContext';

const HomePage = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const { isNavbarOpen } = useNavbar();
  const navigate = useNavigate();
  const { waves, deleteWave } = useWaves();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Sample user data
  const [userData] = useState(() => {
    const savedData = localStorage.getItem('profileData');
    return savedData ? JSON.parse(savedData) : {
      username: 'DefaultUser',
      displayName: 'Default',
      profileImage: '/api/placeholder/200/200'
    };
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleDeleteWave = (id) => {
    deleteWave(id); // This will trigger a context update
  };

  const handleHomeClick = () => {
    navigate('/');
  }

  const handleCreateClick = () => {
    navigate('/create');
  }

  const handleProfileClick = () => {
    navigate('/profile');
  };
  
  // Function to handle liking a wave
  const handleLike = (id) => {
    setWaves(waves.map(wave => 
      wave.id === id ? {...wave, likes: wave.likes + 1} : wave
    ));
  };
  
  return (
    <Box
      width="100vw"
      ml={isMobile ? 0 : isNavbarOpen ? "-240px" : "-90px"}
      pl={isMobile ? 0 : isNavbarOpen ? "240px" : "90px"}
      transition="all 0.2s"
      overflowX="hidden"
    >
      <Flex 
        direction="column" 
        w="100%"
        bg={isDark ? '#121212' : 'white'}
        minH="100vh"
        pb={isMobile ? "80px" : 0} // Add bottom padding on mobile for navbar
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
        <HStack spacing={2}>
          <Image
            src="/Wavely-Logo.png"
            alt="Wavely Logo"
            height="30px"
            width="auto"
          />
          <Heading as="h1" size="lg" letterSpacing="tight" fontWeight="bold">
            Wavely
          </Heading>
        </HStack>
        
        <Input
          placeholder="Search..."
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
            onClick={handleHomeClick}
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
            onClick={handleCreateClick}
          />
          <Avatar 
            size="sm" 
            src={userData.profileImage}
            name={userData.displayName}
            cursor="pointer"
            onClick={handleProfileClick}
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
        bg={isDark ? "#121212" : "white"}
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
                
                <Button colorScheme="blue" size="sm" width="full" onClick={handleProfileClick}>
                  View Profile
                </Button>
              </VStack>
            </Box>
            
            {/* Center Feed - Friend Waves */}
            <VStack spacing={6} align="stretch">
              {waves.map((wave) => (
                <WaveCard 
                  key={wave.id}
                  wave={wave}
                  currentUser={userData}
                  onLike={() => likeWave(wave.id)}
                  onDelete={() => deleteWave(wave.id)}
                />
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
                
                <Heading size="md" mt={2}>Friends</Heading>
                
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
    </Box>
  );
};

export default HomePage;