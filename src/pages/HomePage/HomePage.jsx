
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Avatar,
  IconButton,
  VStack,
  HStack,
  useColorMode,
  Spinner,
  Button,
  Divider,
  Heading,
  Tag,
  Image,
  Grid,
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Badge,
  List,
  ListItem,
  Collapse
} from '@chakra-ui/react';
import { 
  FiHome,
  FiCompass,
  FiPlusSquare,
  FiStar,
  FiSearch,
  FiSend,
  FiTrash2,
  FiHeart,
  FiMessageSquare,
  FiMessageCircle,
  FiInfo
} from 'react-icons/fi';
import { useNavbar } from "../../context/NavbarContext";
import { useUser } from '../../context/UserContext';
import { useWaves } from '../../context/WaveContext';
import WaveCard from '../../custom_components/WaveCard/WaveCard';
import CommentItem from '../../custom_components/CommentItem/CommentItem';
import { doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../../Firebase/firebase';

const HomePage = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const { isNavbarOpen } = useNavbar();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useUser();
  const { waves, loading: wavesLoading } = useWaves();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const feedContainerRef = useRef(null);
  const [selectedWaveId, setSelectedWaveId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentUserData, setCommentUserData] = useState({});
  const [visibleWaveIndex, setVisibleWaveIndex] = useState(0);
  const waveRefs = useRef({});
  const [isScrolling, setIsScrolling] = useState(false);
  const lastWheelTimestamp = useRef(0);
  const wheelAccumulator = useRef(0);

  const filteredWaves = waves.filter(wave => 
    wave.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wave.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wave.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (filteredWaves.length > 0 && !selectedWaveId) {
      setSelectedWaveId(filteredWaves[0].id);
    }
  }, [filteredWaves, selectedWaveId]);

  useEffect(() => {
    if (!feedContainerRef.current) return;
    
    const feedContainer = feedContainerRef.current;
    
    const handleScroll = () => {
      if (!feedContainer) return;
      
      const containerRect = feedContainer.getBoundingClientRect();
      const containerMiddle = containerRect.top + containerRect.height / 2;
      
      let closestWaveIndex = 0;
      let closestDistance = Infinity;
      
      Object.entries(waveRefs.current).forEach(([id, element]) => {
        if (!element) return;
        
        const waveRect = element.getBoundingClientRect();
        const waveMiddle = waveRect.top + waveRect.height / 2;
        const distance = Math.abs(containerMiddle - waveMiddle);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          const waveId = id;
          const waveIndex = filteredWaves.findIndex(wave => wave.id === waveId);
          if (waveIndex !== -1) {
            closestWaveIndex = waveIndex;
          }
        }
      });
      
      if (visibleWaveIndex !== closestWaveIndex) {
        setVisibleWaveIndex(closestWaveIndex);
        setSelectedWaveId(filteredWaves[closestWaveIndex]?.id);
      }
    };
    
    feedContainer.addEventListener('scroll', handleScroll);
    // Add a resize observer to handle changes to the container size
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(feedContainer);
    
    // Initial check to set the first visible wave
    setTimeout(handleScroll, 100);
    
    return () => {
      feedContainer.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [filteredWaves, visibleWaveIndex]);

  // Add global wheel event handler to scroll the feed regardless of cursor position
  useEffect(() => {
    if (!feedContainerRef.current) return;

    const handleWheel = (event) => {
      // Prevent scrolling if user is interacting with another scrollable element
      if (
        event.target.closest('.scrollable-tab-panel') || 
        (event.target.closest('[data-overflow="auto"]') && 
         event.target.closest('[data-overflow="auto"]') !== feedContainerRef.current)
      ) {
        return;
      }

      // Prevent default to stop the whole page from scrolling
      event.preventDefault();

      const now = Date.now();
      const deltaTime = now - lastWheelTimestamp.current;
      lastWheelTimestamp.current = now;

      // Reset accumulator if it's been a while since the last wheel event
      if (deltaTime > 200) {
        wheelAccumulator.current = 0;
      }

      // Accumulate scroll deltas for smoother scrolling
      wheelAccumulator.current += event.deltaY;

      // Apply scrolling to the feed container
      if (feedContainerRef.current) {
        // Use requestAnimationFrame for smoother scrolling
        if (!isScrolling) {
          setIsScrolling(true);
          requestAnimationFrame(() => {
            feedContainerRef.current.scrollTop += wheelAccumulator.current;
            wheelAccumulator.current = 0;
            setIsScrolling(false);
          });
        }
      }
    };

    // Add passive: false to ensure we can prevent default
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isScrolling]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't intercept if user is typing in an input field
      if (event.target.tagName === 'INPUT' || 
          event.target.tagName === 'TEXTAREA' || 
          event.target.isContentEditable) {
        return;
      }

      const scrollAmount = 100; // Adjust as needed

      if (event.key === 'ArrowDown' || event.key === 'j') {
        if (feedContainerRef.current) {
          feedContainerRef.current.scrollTop += scrollAmount;
          event.preventDefault();
        }
      } else if (event.key === 'ArrowUp' || event.key === 'k') {
        if (feedContainerRef.current) {
          feedContainerRef.current.scrollTop -= scrollAmount;
          event.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const userWavesCount = waves.filter(w => w.userId === currentUser?.uid).length;

  const handleHomeClick = () => navigate('/');
  const handleExploreClick = () => navigate('/explore');
  const handleCreateClick = () => navigate('/create');
  const handleProfileClick = () => navigate(`/profile/${currentUser?.username}`);

  const handleCommentsClick = (waveId) => {
    setActiveTab('comments');
    setSelectedWaveId(waveId);
    
    const waveElement = waveRefs.current[waveId];
    if (waveElement && feedContainerRef.current) {
      const containerRect = feedContainerRef.current.getBoundingClientRect();
      const waveRect = waveElement.getBoundingClientRect();
      
      feedContainerRef.current.scrollTo({
        top: feedContainerRef.current.scrollTop + (waveRect.top - containerRect.top) - 
             (containerRect.height - waveRect.height) / 2,
        behavior: 'smooth'
      });
    }
  };

  const handleComment = async (waveId, replyData) => {
    if (!currentUser || (!newComment.trim() && !replyData)) return;
  
    try {
      const commentId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newCommentObj = replyData || {
        id: commentId,
        userId: currentUser.uid,
        username: currentUser.username || currentUser.email?.split('@')[0],
        displayName: currentUser.displayName || currentUser.email?.split('@')[0],
        profileImage: currentUser.profileImage || '/default-avatar.png',
        content: newComment,
        timestamp: new Date().toISOString(),
        likes: []
      };
  
      const waveRef = doc(db, 'waves', waveId);
      await updateDoc(waveRef, {
        comments: increment(1),
        commentsList: arrayUnion(newCommentObj)
      });
  
      setNewComment('');
      toast({
        title: "Comment added",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Could not add comment",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteComment = async (waveId, commentId) => {
    try {
      const waveRef = doc(db, 'waves', waveId);
      const waveSnap = await getDoc(waveRef);
      
      if (!waveSnap.exists()) return;

      const waveData = waveSnap.data();
      const updatedComments = waveData.commentsList.filter(c => c.id !== commentId);
      
      await updateDoc(waveRef, {
        comments: increment(-1),
        commentsList: updatedComments
      });

      toast({
        title: "Comment deleted",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Could not delete comment",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleLikeComment = async (waveId, commentId) => {
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please log in to like comments",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const waveRef = doc(db, 'waves', waveId);
      const waveSnap = await getDoc(waveRef);
      
      if (!waveSnap.exists()) return;

      const waveData = waveSnap.data();
      const commentIndex = waveData.commentsList.findIndex(c => c.id === commentId);
      if (commentIndex === -1) return;

      const comment = waveData.commentsList[commentIndex];
      const likes = comment.likes || [];
      const isLiked = likes.includes(currentUser.uid);

      const updatedComment = {
        ...comment,
        likes: isLiked
          ? likes.filter(uid => uid !== currentUser.uid)
          : [...likes, currentUser.uid]
      };

      const updatedComments = [...waveData.commentsList];
      updatedComments[commentIndex] = updatedComment;

      await updateDoc(waveRef, {
        commentsList: updatedComments
      });
    } catch (error) {
      console.error('Error updating comment like:', error);
      toast({
        title: "Error",
        description: "Could not update like",
        status: "error",
        duration: 3000,
      });
    }
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const navigateToCommenterProfile = (e, userId) => {
    e.stopPropagation();
    const currentWave = filteredWaves.find(wave => wave.id === selectedWaveId);
    const comment = currentWave?.commentsList?.find(c => c.userId === userId);
    if (comment?.username) {
      navigate(`/profile/${comment.username}`);
    } else {
      toast({
        title: "Error",
        description: "Could not find user profile",
        status: "error",
        duration: 3000,
      });
    }
  };

  if (wavesLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // Find the currently selected wave
  const selectedWave = filteredWaves.find(wave => wave.id === selectedWaveId);

  return (
    <Box
      width="100vw"
      ml={isMobile ? 0 : isNavbarOpen ? "-240px" : "-90px"}
      pl={isMobile ? 0 : isNavbarOpen ? "240px" : "90px"}
      transition="all 0.2s"
      overflowX="hidden"
      bg={isDark ? '#121212' : '#fff'}
    >
      <Flex 
        direction="column" 
        w="100%"
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
          backdropFilter="blur(10px)"
          color={isDark ? "white" : "black"}
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
            <Heading 
              as="h1" 
              size="lg" 
              letterSpacing="tight" 
              fontWeight="bold"
              color={isDark ? "white" : "black"}
            >
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
              color={isDark ? "white" : "black"}
              onClick={handleHomeClick}
            />
            <IconButton
              aria-label="Explore"
              icon={<FiCompass />}
              variant="ghost"
              color={isDark ? "white" : "black"}
              onClick={handleExploreClick}
            />
            <IconButton
              aria-label="New Post"
              icon={<FiPlusSquare />}
              variant="ghost"
              color={isDark ? "white" : "black"}
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
        <Grid
          templateColumns={{ base: "1fr", lg: "250px 1fr 300px" }}
          gap={6}
          width="100%"
          maxW="1200px"
          mx="auto"
          py={2}
          px={4}
        >
          {/* Left Sidebar - User Profile Summary */}
          <Box
            display={{ base: "none", lg: "block" }}
            bg={isDark ? "#1A1A1A" : "white"}
            p={4}
            borderRadius="lg"
            boxShadow="md"
            position="sticky"
            top="80px"
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
          
          {/* Center Feed - Normal Scrolling Feed */}
          <Box
            ref={feedContainerRef}
            height="calc(100vh - 80px)"
            overflowY="auto"
            pb={4}
            position="relative"
            css={{
              '&::-webkit-scrollbar': {
                width: '6px',
                display: 'none'
              },
              '&::-webkit-scrollbar-track': {
                background: isDark ? '#1A1A1A' : '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: isDark ? '#888' : '#ccc',
                borderRadius: '6px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: isDark ? '#555' : '#aaa',
              },
            }}
            data-overflow="auto"
          >
            {filteredWaves.length > 0 ? (
              <VStack spacing={6} align="stretch">
                {filteredWaves.map((wave, index) => (
                  <Box
                    key={wave.id}
                    ref={el => waveRefs.current[wave.id] = el}
                    p={2}
                    borderRadius="lg"
                    boxShadow="md"
                    data-wave-id={wave.id}
                  >
                    <WaveCard 
                      wave={wave} 
                      currentUser={currentUser}
                      compactMode={false}
                      onCommentsClick={handleCommentsClick}
                      autoPlayVideo={true} // Enable video autoplay
                    />
                  </Box>
                ))}
              </VStack>
            ) : (
              <Flex 
                justify="center" 
                align="center" 
                height="100%"
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
          </Box>
          
          {/* Right Sidebar with Tabs */}
          <Box
            display={{ base: "none", lg: "block" }}
            bg={isDark ? "#1A1A1A" : "white"}
            borderRadius="lg"
            boxShadow="md"
            position="sticky"
            top="80px"
            height="calc(100vh - 120px)"
            overflow="hidden"
          >
            <Tabs 
              isFitted 
              variant="enclosed" 
              index={activeTab === 'info' ? 0 : 1} 
              onChange={(index) => setActiveTab(index === 0 ? 'info' : 'comments')}
            >
              <TabList>
                <Tab _selected={{ color: "blue.500", borderBottom: "2px solid" }}>
                  <HStack>
                    <FiInfo />
                    <Text>Community</Text>
                  </HStack>
                </Tab>
                <Tab _selected={{ color: "blue.500", borderBottom: "2px solid" }}>
                  <HStack>
                    <FiMessageCircle />
                    <Text>Comments</Text>
                  </HStack>
                </Tab>
              </TabList>
              
              <TabPanels height="calc(100% - 42px)" overflow="hidden">
                {/* Community Info Tab */}
                <TabPanel 
                  height="100%" 
                  overflowY="auto" 
                  p={4} 
                  className="scrollable-tab-panel"
                  data-overflow="auto"
                >
                  <VStack align="stretch" spacing={4}>
                    <Heading size="md">Top Rated Waves</Heading>
                    
                    {waves
                      .filter(wave => wave.rating)
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 5)
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
                            {wave.category && (
                              <Badge colorScheme="blue" mt={1} fontSize="xs">
                                #{wave.category}
                              </Badge>
                            )}
                          </VStack>
                        </Flex>
                      ))}
                    
                    {waves.filter(wave => wave.rating).length === 0 && (
                      <Text color="gray.500" fontSize="sm">
                        No rated waves yet
                      </Text>
                    )}
                    
                    <Divider />
                    
                    <Heading size="md" mt={2}>Active Users</Heading>
                    
                    <HStack wrap="wrap" spacing={3}>
                      {waves
                        .map(w => ({ 
                          userId: w.userId, 
                          username: w.username, 
                          profileImage: w.profileImage 
                        }))
                        .filter((user, index, self) => 
                          index === self.findIndex(u => u.userId === user.userId)
                        )
                        .slice(0, 6)
                        .map(user => (
                          <Avatar 
                            key={user.userId}
                            size="md"
                            name={user.username}
                            src={user.profileImage}
                            cursor="pointer"
                            onClick={() => navigate(`/profile/${user.username}`)}
                          />
                        ))}
                    </HStack>
                  </VStack>
                </TabPanel>
                
                {/* Comments Tab */}
                <TabPanel 
                  height="100%" 
                  display="flex" 
                  flexDirection="column" 
                  p={0}
                  className="scrollable-tab-panel"
                >
                  <Box flex="1" overflowY="auto" p={4} data-overflow="auto">
                    {selectedWave ? (
                      <VStack spacing={3} align="stretch">
                        {/* Current Wave Title */}
                        <Flex align="center" mb={2}>
                          <Avatar src={selectedWave.profileImage} size="sm" mr={2} />
                          <Box>
                            <Text fontWeight="bold">{selectedWave.displayName}</Text>
                            <Text fontSize="xs" color="gray.500">
                              Comments for: {selectedWave.title || "Untitled Wave"}
                            </Text>
                          </Box>
                        </Flex>

                        {/* Comment Input */}
                        {currentUser ? (
                          <Flex>
                            <Input
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              size="sm"
                              mr={2}
                              bg={isDark ? 'gray.700' : 'white'}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && selectedWave) {
                                  handleComment(selectedWave.id);
                                }
                              }}
                            />
                            <IconButton
                              icon={<FiSend />}
                              aria-label="Send Comment"
                              onClick={() => handleComment(selectedWave.id)}
                              isDisabled={!newComment.trim()}
                              colorScheme="blue"
                              size="sm"
                            />
                          </Flex>
                        ) : (
                          <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>
                            Please sign in to comment
                          </Text>
                        )}

                        {/* Comments List */}
                        {selectedWave?.commentsList?.length > 0 ? (
                          <List spacing={3}>
                            {selectedWave.commentsList
                              .filter(comment => !comment.parentCommentId)
                              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                              .map((comment) => {
                                const replies = selectedWave.commentsList
                                  .filter(c => c.parentCommentId === comment.id);

                                return (
                                  <ListItem key={comment.id}>
                                    <CommentItem
                                      comment={comment}
                                      currentUser={currentUser}
                                      isOwner={currentUser?.uid === selectedWave.userId}
                                      onLike={(commentId) => handleLikeComment(selectedWave.id, commentId)}
                                      onDelete={(commentId) => handleDeleteComment(selectedWave.id, commentId)}
                                      onReply={async (commentId, replyData) => {
                                        const replyId = `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                        const newReply = {
                                          id: replyId,
                                          userId: currentUser.uid,
                                          username: currentUser.username || currentUser.email?.split('@')[0],
                                          displayName: currentUser.displayName || currentUser.email?.split('@')[0],
                                          profileImage: currentUser.profileImage || '/default-avatar.png',
                                          content: replyData.content,
                                          timestamp: new Date().toISOString(),
                                          parentCommentId: commentId,
                                          likes: []
                                        };
                                        await handleComment(selectedWave.id, newReply);
                                      }}
                                      replies={replies}
                                      commentUserData={commentUserData}
                                      navigateToCommenterProfile={navigateToCommenterProfile}
                                      formatTimestamp={formatTimestamp}
                                      waveId={selectedWave.id}
                                    />
                                  </ListItem>
                                );
                              })}
                          </List>
                        ) : (
                          <Flex
                            height="100%"
                            alignItems="center"
                            justifyContent="center"
                            flexDirection="column"
                            color="gray.500"
                          >
                            <Icon as={FiMessageSquare} fontSize="3xl" mb={2} />
                            <Text>No comments yet</Text>
                            <Text fontSize="sm">Be the first to comment!</Text>
                          </Flex>
                        )}
                      </VStack>
                    ) : (
                      <Flex
                        height="100%"
                        alignItems="center"
                        justifyContent="center"
                        flexDirection="column"
                        color="gray.500"
                      >
                        <Text>No wave selected</Text>
                      </Flex>
                    )}
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Grid>
      </Flex>
    </Box>
  );
};

export default HomePage;