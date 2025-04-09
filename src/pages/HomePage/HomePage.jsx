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
  InputGroup,
  InputLeftElement,
  useColorMode,
  Divider,
  IconButton,
  Spinner,
  Tag
} from '@chakra-ui/react';
import { 
  FiHome,
  FiCompass,
  FiPlusSquare,
  FiStar,
  FiSearch,
  FiUsers
} from 'react-icons/fi';
import { useNavbar } from "../../context/NavbarContext";
import { useUser } from '../../context/UserContext';
import { useWaves } from '../../context/WaveContext';
import WaveCard from '../../custom_components/WaveCard/WaveCard';

const HomePage = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const { isNavbarOpen } = useNavbar();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { waves, loading: wavesLoading } = useWaves();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleHomeClick = () => navigate('/');
  const handleCreateClick = () => navigate('/create');
  const handleProfileClick = () => navigate(`/profile/${currentUser?.username}`);

  const filteredWaves = waves.filter(wave => 
    wave.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wave.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wave.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userWavesCount = waves.filter(w => w.userId === currentUser?.uid).length;

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
        pb={isMobile ? "80px" : 0}
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
          
          <InputGroup width={{ base: "100%", md: "300px" }} mx={{ base: 0, md: 4 }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Search waves..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg={isDark ? "gray.800" : "gray.100"}
              border="none"
              borderRadius="full"
              pl={10}
            />
          </InputGroup>
          
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
              src={currentUser?.profileImage}
              name={currentUser?.displayName}
              cursor="pointer"
              onClick={handleProfileClick}
            />
          </HStack>
        </Flex>
        
        {/* Main Content Area */}
        <Box 
          flex="1"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
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
                {currentUser ? (
                  <VStack align="center" spacing={4}>
                    <Avatar 
                      size="xl" 
                      src={currentUser.profileImage} 
                      name={currentUser.displayName}
                    />
                    <Heading size="md">{currentUser.displayName}</Heading>
                    <Text color="gray.500">@{currentUser.username}</Text>
                    
                    <Divider />
                    
                    <HStack width="100%" justify="space-between">
                      <VStack>
                        <Text fontWeight="bold">{userWavesCount}</Text>
                        <Text fontSize="sm" color="gray.500">Waves</Text>
                      </VStack>
                      <VStack>
                        <Text fontWeight="bold">{currentUser?.followers?.length || 0}</Text>
                        <Text fontSize="sm" color="gray.500">Followers</Text>
                      </VStack>
                      <VStack>
                        <Text fontWeight="bold">{currentUser?.following?.length || 0}</Text>
                        <Text fontSize="sm" color="gray.500">Following</Text>
                      </VStack>
                    </HStack>
                    
                    <Button 
                      colorScheme="blue" 
                      size="sm" 
                      width="full" 
                      onClick={handleProfileClick}
                    >
                      View Profile
                    </Button>
                  </VStack>
                ) : (
                  <VStack align="center" spacing={4}>
                    <Avatar size="xl" />
                    <Heading size="md">Guest</Heading>
                    <Text color="gray.500">Please sign in</Text>
                  </VStack>
                )}
              </Box>
              
              {/* Center Feed - Waves */}
              <VStack spacing={6} align="stretch">
                {wavesLoading ? (
                  <Flex justify="center" py={10}>
                    <Spinner size="xl" />
                  </Flex>
                ) : filteredWaves.length > 0 ? (
                  filteredWaves.map((wave) => (
                    <WaveCard 
                      key={wave.id}
                      wave={wave}
                      currentUser={currentUser}
                    />
                  ))
                ) : (
                  <Flex 
                    justify="center" 
                    align="center" 
                    height="300px"
                    flexDirection="column"
                  >
                    <Text fontSize="lg" color="gray.500" mb={4}>
                      {searchQuery ? 'No waves match your search' : 'No waves yet'}
                    </Text>
                    {!searchQuery && currentUser && (
                      <Button 
                        colorScheme="blue" 
                        leftIcon={<FiPlusSquare />}
                        onClick={handleCreateClick}
                      >
                        Create Your First Wave
                      </Button>
                    )}
                  </Flex>
                )}
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
                    .filter(wave => wave.rating)
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 3)
                    .map((wave) => (
                      <Flex 
                        key={wave.id} 
                        align="center" 
                        gap={3}
                        cursor="pointer"
                        onClick={() => navigate(`/wave/${wave.id}`)}
                        _hover={{ bg: isDark ? 'gray.700' : 'gray.100' }}
                        p={2}
                        borderRadius="md"
                      >
                        <Image 
                          src={wave.mediaUrls?.[0] || "/Wavely-Logo.png"}
                          alt={`${wave.displayName}'s wave`}
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                            {wave.title || wave.displayName}
                          </Text>
                          <HStack>
                            <Icon as={FiStar} color="yellow.400" size="xs" />
                            <Text fontSize="sm">{wave.rating?.toFixed(1)}</Text>
                          </HStack>
                        </VStack>
                      </Flex>
                    ))}
                  
                  {waves.filter(wave => wave.rating).length === 0 && (
                    <Text color="gray.500" fontSize="sm">
                      No rated waves yet
                    </Text>
                  )}
                  
                  <Divider />
                  
                  <Heading size="md" mt={2}>Trending Categories</Heading>
                  
                  <HStack spacing={2} wrap="wrap">
                    {['Music', 'Art', 'Photography', 'Travel', 'Food']
                      .map(category => (
                        <Button
                          key={category}
                          size="sm"
                          variant="outline"
                          onClick={() => setSearchQuery(category)}
                        >
                          #{category}
                        </Button>
                      ))}
                  </HStack>
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