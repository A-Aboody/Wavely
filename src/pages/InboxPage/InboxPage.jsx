import {
  Box,
  Flex,
  Heading,
  Text,
  Avatar,
  Button,
  HStack,
  VStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  Icon,
  Divider,
  useColorMode,
  Spinner,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  InputGroup,
  Input,
  InputRightElement,
  useDisclosure,
  Image,
} from '@chakra-ui/react';
import {
  FiMail,
  FiUser,
  FiUsers,
  FiUpload,
  FiBell,
  FiMessageSquare,
  FiSearch,
  FiMoreHorizontal,
  FiTrash2,
  FiUserPlus,
  FiVideo,
  FiImage,
  FiMusic,
  FiClock
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useNavbar } from "../../context/NavbarContext";
import { useWaves } from '../../context/WaveContext';
import { useUser } from '../../context/UserContext';
import { useRef, useEffect, useState } from 'react';

const InboxPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isNavbarOpen } = useNavbar();
  const { waves } = useWaves();
  const { currentUser, loading: userLoading } = useUser();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock notification data - this would come from a real notification system in production
  useEffect(() => {
    if (userLoading) return;
    
    // Simulating API call to fetch notifications
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        
        // This is mock data - in a real app, this would be fetched from a database
        const mockNotifications = [
          {
            id: '1',
            type: 'follow',
            read: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
            sender: {
              uid: 'user123',
              username: 'haidarnasser',
              displayName: 'Tropical Nass',
              profileImage: './google.png'
            },
            message: 'started following you'
          },
          {
            id: '2',
            type: 'upload',
            read: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            sender: {
              uid: 'user456',
              username: 'raaedabbas',
              displayName: 'rara',
              profileImage: './google.png'
            },
            waveId: 'wave123',
            waveTitle: 'Day in my life',
            mediaType: 'video',
            message: 'uploaded a new video wave'
          },
          {
            id: '3',
            type: 'upload',
            read: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            sender: {
              uid: 'user789',
              username: 'urielperez',
              displayName: 'uricero',
              profileImage: './google.png'
            },
            waveId: 'wave456',
            waveTitle: 'Sushi',
            mediaType: 'image',
            message: 'uploaded a new image wave'
          },
          {
            id: '4',
            type: 'follow',
            read: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            sender: {
              uid: 'user101',
              username: 'mustafaalhamdani',
              displayName: 'stafa',
              profileImage: './google.png'
            },
            message: 'started following you'
          },
          {
            id: '5',
            type: 'upload',
            read: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            sender: {
              uid: 'user202',
              username: 'mohammadalheraa',
              displayName: 'chewi',
              profileImage: './google.png'
            },
            waveId: 'wave789',
            waveTitle: 'Drawing',
            mediaType: 'image',
            message: 'uploaded a new image wave'
          }
        ];
        
        setNotifications(mockNotifications);
        setFilteredNotifications(mockNotifications);
        
      } catch (error) {
        console.error("Error loading notifications:", error);
        toast({
          title: "Error",
          description: "Failed to load notifications",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser) {
      fetchNotifications();
    } else {
      setIsLoading(false);
    }
  }, [currentUser, userLoading, toast]);

  // Responsive design handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter notifications based on search query and selected filter
  useEffect(() => {
    if (!notifications.length) return;
    
    let filtered = [...notifications];
    
    // Apply type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(notif => notif.type === selectedFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notif => 
        notif.sender.username.toLowerCase().includes(query) ||
        notif.sender.displayName.toLowerCase().includes(query) ||
        (notif.waveTitle && notif.waveTitle.toLowerCase().includes(query))
      );
    }
    
    setFilteredNotifications(filtered);
  }, [searchQuery, notifications, selectedFilter]);

  // Handler for marking notification as read
  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    
    // In a real app, you would call an API to update the read status in the database
  };

  // Handler for deleting notification
  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setFilteredNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    
    toast({
      title: "Notification deleted",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    
    // In a real app, you would call an API to delete the notification from the database
  };

  // Handler for following a user
  const handleFollowUser = (userId) => {
    // In a real app, you would call your followUser function from your context
    toast({
      title: "User followed",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Handler for navigating to user profile
  const navigateToProfile = (username) => {
    navigate(`/profile/${username}`);
  };
  
  // Handler for navigating to wave
  const navigateToWave = (waveId) => {
    // In a real app, you would navigate to the wave detail page
    navigate(`/wave/${waveId}`);
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (e) {
      console.error("Error formatting timestamp:", e, "Input:", dateString);
      return 'Invalid date';
    }
  };

  // Get unread notification count
  const unreadCount = notifications.filter(notif => !notif.read).length;

  // Render media type icon
  const renderMediaTypeIcon = (mediaType) => {
    switch (mediaType) {
      case 'video':
        return <Icon as={FiVideo} boxSize={4} />;
      case 'image':
        return <Icon as={FiImage} boxSize={4} />;
      case 'audio':
        return <Icon as={FiMusic} boxSize={4} />;
      default:
        return null;
    }
  };

  if (userLoading) {
    return (
      <Flex justify="center" align="center" height="calc(100vh - 80px)">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!currentUser) {
    return (
    <Box
      width="100vw"
      ml={isMobile ? 0 : isNavbarOpen ? "-240px" : "-90px"}
      pl={isMobile ? 0 : isNavbarOpen ? "240px" : "90px"}
      transition="padding-left 0.2s ease-out, margin-left 0.2s ease-out"
      overflowX="hidden"
    >
      <Flex
        direction="column"
        justify="center"
        align="center"
        height="calc(100vh - 80px)"
        px={4}
        textAlign="center"
      >
        <Icon as={FiMail} boxSize={12} color="gray.500" mb={4} />
        <Heading size="lg" mb={2}>Sign in to access your inbox</Heading>
        <Text color="gray.500" mb={6}>You need to be logged in to view your notifications and messages</Text>
        <Button colorScheme="blue" onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      </Flex>
    </Box>
    );
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
      {/* Add Banner Section */}
      <Box 
        position="relative" 
        width="100%" 
        height={{ base: "150px", md: "200px" }} 
        bg={colorMode === 'dark' ? 'gray.700' : 'gray.300'}
      >
        <Image
          src={currentUser?.bannerImage || '/default-banner.jpg'}
          alt="Profile banner"
          width="100%"
          height="100%"
          objectFit="cover"
          fallbackSrc='/default-banner.jpg'
        />
      </Box>
      {/* Main Content */}
      <Flex
        direction="column"
        maxWidth="1200px"
        margin="0 auto"
        px={{ base: 4, md: 8 }}
        py={6}
        mt={-10}
        position="relative"
        zIndex={1}
      >
        {/* Header */}
        <Box
        bg={colorMode === 'dark' ? 'gray.800' : 'white'}
        p={6}
        borderRadius="lg"
        boxShadow="md"
        mb={6}
      >
        <Flex 
          justify="space-between"
          align="center"
        >
          <Heading size="xl">Inbox</Heading>
          {unreadCount > 0 && (
            <Badge colorScheme="red" fontSize="md" py={1} px={2} borderRadius="full">
              {unreadCount} new
            </Badge>
          )}
        </Flex>
      </Box>

        {/* Search Box */}
        <Box mb={6}>
          <InputGroup size="md">
            <Input
              placeholder="Search notifications..."
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputRightElement>
              <Icon as={FiSearch} color="gray.500" />
            </InputRightElement>
          </InputGroup>
        </Box>

        {/* Content Tabs */}
        <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
          <TabList mb={4} overflowX="auto" css={{ scrollbarWidth: 'none' }}>
            <Tab onClick={() => setSelectedFilter('all')}>
              <HStack><Icon as={FiBell} mr={2} /><Text>All</Text></HStack>
            </Tab>
            <Tab onClick={() => setSelectedFilter('follow')}>
              <HStack><Icon as={FiUserPlus} mr={2} /><Text>Followers</Text></HStack>
            </Tab>
            <Tab onClick={() => setSelectedFilter('upload')}>
              <HStack><Icon as={FiUpload} mr={2} /><Text>Uploads</Text></HStack>
            </Tab>
            <Tab onClick={() => setSelectedFilter('message')} isDisabled>
              <HStack><Icon as={FiMessageSquare} mr={2} /><Text>Messages</Text></HStack>
              <Badge ml={2} colorScheme="purple">Soon</Badge>
            </Tab>
          </TabList>

          <TabPanels>
            {/* All Notifications Tab */}
            <TabPanel p={0}>
              {renderNotificationsList()}
            </TabPanel>

            {/* Followers Tab */}
            <TabPanel p={0}>
              {renderNotificationsList('follow')}
            </TabPanel>

            {/* Uploads Tab */}
            <TabPanel p={0}>
              {renderNotificationsList('upload')}
            </TabPanel>

            {/* Messages Tab (Coming Soon) */}
            <TabPanel p={0}>
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                py={20} 
                bg={colorMode === 'dark' ? 'gray.800' : 'white'} 
                borderRadius="lg"
                boxShadow="sm"
              >
                <Icon as={FiMessageSquare} boxSize={12} color="purple.400" mb={4} />
                <Heading size="lg" mb={2}>Messaging Coming Soon</Heading>
                <Text color="gray.500" textAlign="center" maxWidth="500px">
                  We're working on bringing you direct messaging capabilities. Stay tuned for updates!
                </Text>
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Box>
  );

  // Helper function to render notification lists
  function renderNotificationsList(type = null) {
    const notificationsToShow = filteredNotifications.filter(n => !type || n.type === type);
    
    if (isLoading) {
      return (
        <Flex justify="center" py={10}>
          <Spinner size="lg" />
        </Flex>
      );
    }
    
    if (notificationsToShow.length === 0) {
      return (
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          py={10} 
          bg={colorMode === 'dark' ? 'gray.800' : 'white'} 
          borderRadius="lg"
          boxShadow="sm"
        >
          <Icon 
            as={type === 'follow' ? FiUsers : type === 'upload' ? FiUpload : FiBell} 
            boxSize={12} 
            color="gray.400" 
            mb={4} 
          />
          <Heading size="md" mb={2}>No notifications yet</Heading>
          <Text color="gray.500">
            {type === 'follow' 
              ? "You'll see when people follow you here." 
              : type === 'upload' 
                ? "When people you follow upload new waves, you'll see them here." 
                : "When you get notifications, they'll appear here."}
          </Text>
        </Flex>
      );
    }
    
    return (
      <VStack spacing={3} align="stretch">
        {notificationsToShow.map((notification) => (
          <Box
            key={notification.id}
            p={4}
            borderRadius="lg"
            bg={notification.read 
              ? (colorMode === 'dark' ? 'gray.800' : 'white') 
              : (colorMode === 'dark' ? 'gray.700' : 'blue.50')}
            borderWidth="1px"
            borderColor={notification.read 
              ? (colorMode === 'dark' ? 'gray.700' : 'gray.200') 
              : 'blue.200'}
            boxShadow="sm"
            position="relative"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md', transition: 'all 0.2s' }}
          >
            {!notification.read && (
              <Badge 
                position="absolute" 
                top="4" 
                right="4" 
                colorScheme="blue" 
                fontSize="xs"
              >
                New
              </Badge>
            )}
            
            <Flex>
              <Avatar 
                src={notification.sender.profileImage}
                name={notification.sender.displayName}
                size="md"
                cursor="pointer"
                onClick={() => navigateToProfile(notification.sender.username)}
              />
              
              <Box ml={4} flex="1">
                <Flex justify="space-between" align="flex-start">
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Text 
                        fontWeight="bold" 
                        cursor="pointer" 
                        _hover={{ textDecoration: 'underline' }}
                        onClick={() => navigateToProfile(notification.sender.username)}
                      >
                        {notification.sender.displayName}
                      </Text>
                      <Text color="gray.500" fontSize="sm">@{notification.sender.username}</Text>
                    </HStack>
                    
                    <Text>
                      {notification.message}
                      {notification.type === 'upload' && (
                        <Text 
                          as="span" 
                          fontWeight="medium" 
                          cursor="pointer"
                          _hover={{ textDecoration: 'underline' }}
                          onClick={() => navigateToWave(notification.waveId)}
                        >
                          {" "}{notification.waveTitle}
                        </Text>
                      )}
                    </Text>
                    
                    {notification.type === 'upload' && notification.mediaType && (
                      <HStack color="gray.500" fontSize="sm">
                        {renderMediaTypeIcon(notification.mediaType)}
                        <Text>{notification.mediaType.charAt(0).toUpperCase() + notification.mediaType.slice(1)}</Text>
                      </HStack>
                    )}
                  </VStack>
                  
                  <HStack>
                    <Icon as={FiClock} color="gray.500" size="sm" />
                    <Text color="gray.500" fontSize="sm">
                      {formatTimestamp(notification.timestamp)}
                    </Text>
                  </HStack>
                </Flex>
                
                <Flex mt={4} justify="space-between">
                  {notification.type === 'follow' && (
                    <Button 
                      size="sm" 
                      colorScheme="blue" 
                      variant="outline"
                      leftIcon={<FiUserPlus />}
                      onClick={() => handleFollowUser(notification.sender.uid)}
                    >
                      Follow Back
                    </Button>
                  )}
                  
                  {notification.type === 'upload' && (
                    <Button 
                      size="sm" 
                      colorScheme="blue" 
                      variant="outline"
                      onClick={() => navigateToWave(notification.waveId)}
                    >
                      View Wave
                    </Button>
                  )}
                  
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      size="sm"
                      aria-label="Options"
                    >
                      <Icon as={FiMoreHorizontal} />
                    </MenuButton>
                    <MenuList>
                      {!notification.read && (
                        <MenuItem 
                          icon={<Icon as={FiBell} />} 
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as read
                        </MenuItem>
                      )}
                      <MenuItem 
                        icon={<Icon as={FiTrash2} />} 
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        Delete notification
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              </Box>
            </Flex>
          </Box>
        ))}
      </VStack>
    );
  }
};

export default InboxPage;