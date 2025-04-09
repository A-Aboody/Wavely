import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Avatar,
  Text,
  Heading,
  Image,
  IconButton,
  Tag,
  HStack,
  VStack,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Input,
  Collapse,
  useColorMode,
  useToast,
  Skeleton,
  SkeletonCircle,
  AspectRatio,
  Spinner,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody
} from '@chakra-ui/react';
import { 
  FiHeart, 
  FiMessageSquare, 
  FiEye, 
  FiStar, 
  FiMoreHorizontal, 
  FiTrash2, 
  FiSend, 
  FiTrash,
  FiChevronUp,
  FiChevronDown,
  FiPlay,
  FiVolume,
  FiVolume1,
  FiVolume2,
  FiVolumeX
} from 'react-icons/fi';
import { doc, getDoc, deleteDoc, updateDoc, arrayUnion, increment, arrayRemove } from 'firebase/firestore';
import { db } from '../../Firebase/firebase';
import { useNavigate } from 'react-router-dom';

const WaveCard = ({ wave, currentUser, compactMode = false }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [authorData, setAuthorData] = useState(null);
  const [loadingAuthor, setLoadingAuthor] = useState(true);
  const [commentUserData, setCommentUserData] = useState({});
  const [loadingCommentUsers, setLoadingCommentUsers] = useState(false);
  const [localComments, setLocalComments] = useState(wave.commentsList || []);
  const [localLikes, setLocalLikes] = useState({
    wave: {
      count: wave.likes || 0,
      isLiked: wave.likedBy?.includes(currentUser?.uid) || false
    },
    comments: {}
  });

  // Video player state
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [videoVolume, setVideoVolume] = useState(0.5);
  const [hasVideoPlayed, setHasVideoPlayed] = useState(false);
  const [isVideoInView, setIsVideoInView] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [volumeTimeout, setVolumeTimeout] = useState(null);

  const cancelRef = useRef();
  const toast = useToast();
  const navigate = useNavigate();

  // Initialize local state
  useEffect(() => {
    setLocalComments(wave.commentsList || []);
    setLocalLikes({
      wave: {
        count: wave.likes || 0,
        isLiked: wave.likedBy?.includes(currentUser?.uid) || false
      },
      comments: {}
    });
  }, [wave.commentsList, wave.likes, wave.likedBy, currentUser?.uid]);

  // Intersection Observer for video autoplay
  useEffect(() => {
    if (!videoRef.current || wave.mediaType !== 'video') return;
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsVideoInView(entry.isIntersecting);
          
          if (entry.isIntersecting) {
            if (videoRef.current) {
              videoRef.current.currentTime = 0; // Reset video to start
              videoRef.current.play()
                .then(() => {
                  setIsVideoPlaying(true);
                  setHasVideoPlayed(true);
                })
                .catch(error => {
                  console.error('Autoplay failed:', error);
                  if (videoRef.current) {
                    videoRef.current.muted = true;
                    videoRef.current.play()
                      .then(() => {
                        setIsVideoPlaying(true);
                        setHasVideoPlayed(true);
                        setIsVideoMuted(true);
                      });
                  }
                });
            }
          } else {
            if (videoRef.current) {
              videoRef.current.pause();
              setIsVideoPlaying(false);
            }
          }
        });
      },
      {
        threshold: 0.8,
        rootMargin: '0px 0px -100px 0px'
      }
    );
  
    observer.observe(videoRef.current);
  
    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [wave.mediaType]);

  // Update video element when volume changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = videoVolume;
      setIsVideoMuted(videoVolume === 0);
    }
  }, [videoVolume]);

  // Fetch author data
  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoadingAuthor(true);
        if (wave.userId) {
          const userRef = doc(db, 'users', wave.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setAuthorData(userSnap.data());
          } else {
            setAuthorData({
              displayName: wave.displayName || 'User',
              username: wave.username || 'user',
              profileImage: wave.profileImage || '/default-avatar.png'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching author data:', error);
        toast({
          title: 'Error',
          description: 'Could not load author information',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setAuthorData({
          displayName: wave.displayName || 'User',
          username: wave.username || 'user',
          profileImage: wave.profileImage || '/default-avatar.png'
        });
      } finally {
        setLoadingAuthor(false);
      }
    };

    fetchAuthorData();
  }, [wave.userId, wave.displayName, wave.username, wave.profileImage, toast]);

  // Fetch comment users data
  useEffect(() => {
    const fetchCommentUsersData = async () => {
      if (!showComments || !localComments || localComments.length === 0) return;
      
      try {
        setLoadingCommentUsers(true);
        const userData = {};
        const uniqueUserIds = [...new Set(localComments.map(comment => comment.userId))];
        
        await Promise.all(uniqueUserIds.map(async (userId) => {
          if (!userId) return;
          
          try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              userData[userId] = userSnap.data();
            }
          } catch (error) {
            console.error(`Error fetching data for user ${userId}:`, error);
          }
        }));
        
        setCommentUserData(userData);
      } catch (error) {
        console.error('Error fetching comment users data:', error);
      } finally {
        setLoadingCommentUsers(false);
      }
    };

    fetchCommentUsersData();
  }, [showComments, localComments]);

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

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play()
          .catch(error => {
            console.error('Playback failed:', error);
            videoRef.current.muted = true;
            videoRef.current.play();
            setIsVideoMuted(true);
          });
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isVideoMuted) {
        videoRef.current.muted = false;
        setVideoVolume(prev => prev === 0 ? 0.5 : prev);
      } else {
        videoRef.current.muted = true;
      }
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const handleVolumeChange = (value) => {
    setVideoVolume(value);
    if (videoRef.current) {
      videoRef.current.muted = value === 0;
      setIsVideoMuted(value === 0);
    }
  };

  const getVolumeIcon = () => {
    if (isVideoMuted || videoVolume === 0) return FiVolumeX;
    if (videoVolume < 0.33) return FiVolume;
    if (videoVolume < 0.66) return FiVolume1;
    return FiVolume2;
  };

  const displayTimestamp = formatTimestamp(wave.createdAt);
  const isOwner = currentUser?.uid === wave.userId;

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: 'Login Required',
        description: 'Please log in to like waves.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const newLikeStatus = !localLikes.wave.isLiked;
      setLocalLikes(prev => ({
        ...prev,
        wave: {
          count: newLikeStatus ? prev.wave.count + 1 : prev.wave.count - 1,
          isLiked: newLikeStatus
        }
      }));

      const waveRef = doc(db, 'waves', wave.id);
      await updateDoc(waveRef, {
        likes: increment(newLikeStatus ? 1 : -1),
        likedBy: newLikeStatus
          ? arrayUnion(currentUser.uid)
          : arrayRemove(currentUser.uid)
      });
    } catch (error) {
      console.error('Error liking wave:', error);
      setLocalLikes(prev => ({
        ...prev,
        wave: {
          count: prev.wave.count,
          isLiked: !prev.wave.isLiked
        }
      }));
      toast({
        title: 'Error',
        description: 'Could not update like status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;

    try {
      await deleteDoc(doc(db, 'waves', wave.id));
      onClose();
      toast({
        title: 'Wave deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting wave:', error);
      toast({
        title: 'Error',
        description: 'Could not delete wave.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!currentUser) {
      toast({
        title: 'Login Required',
        description: 'Please log in to like comments.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    try {
      const comment = localComments.find(c => c.id === commentId);
      if (!comment) return;

      const currentLikes = comment.likes || [];
      const isLiked = currentLikes.includes(currentUser.uid);

      const updatedComments = localComments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            likes: isLiked 
              ? currentLikes.filter(uid => uid !== currentUser.uid)
              : [...currentLikes, currentUser.uid]
          };
        }
        return c;
      });
      
      setLocalComments(updatedComments);

      const waveRef = doc(db, 'waves', wave.id);
      await updateDoc(waveRef, {
        commentsList: updatedComments
      });
  
    } catch (error) {
      console.error('Error updating comment like:', error);
      setLocalComments(wave.commentsList || []);
      
      toast({
        title: 'Error',
        description: 'Could not update like status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };
  
  const handleReply = async (parentCommentId) => {
    if (!currentUser || !replyText.trim()) return;
  
    try {
      const newReply = {
        id: Date.now().toString(),
        userId: currentUser.uid,
        username: currentUser.username || currentUser.email?.split('@')[0],
        displayName: currentUser.displayName || currentUser.email?.split('@')[0],
        profileImage: currentUser.profileImage || '/default-avatar.png',
        content: replyText,
        timestamp: new Date().toISOString(),
        parentCommentId,
        likes: []
      };

      const updatedComments = [...localComments, newReply];
      setLocalComments(updatedComments);
      setReplyText('');
      setReplyingTo(null);

      const waveRef = doc(db, 'waves', wave.id);
      await updateDoc(waveRef, {
        comments: increment(1),
        commentsList: arrayUnion(newReply)
      });
  
    } catch (error) {
      console.error('Error adding reply:', error);
      setLocalComments(wave.commentsList || []);
      
      toast({
        title: 'Error',
        description: 'Could not add reply.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) return;
    
    try {
      const comment = localComments.find(c => c.id === commentId);
      if (!comment || (comment.userId !== currentUser.uid && !isOwner)) return;

      const updatedComments = localComments.filter(c => c.id !== commentId);
      setLocalComments(updatedComments);

      const waveRef = doc(db, 'waves', wave.id);
      await updateDoc(waveRef, {
        comments: increment(-1),
        commentsList: updatedComments
      });
  
      toast({
        title: 'Comment deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      setLocalComments(wave.commentsList || []);
      
      toast({
        title: 'Error',
        description: 'Could not delete comment.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleComment = async () => {
    if (!currentUser) {
      toast({
        title: 'Login Required',
        description: 'Please log in to comment.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!newComment.trim()) return;

    try {
      const newCommentObj = {
        id: Date.now().toString(),
        userId: currentUser.uid,
        username: currentUser.username || currentUser.email?.split('@')[0],
        displayName: currentUser.displayName || currentUser.email?.split('@')[0],
        profileImage: currentUser.profileImage || '/default-avatar.png',
        content: newComment,
        timestamp: new Date().toISOString(),
        likes: []
      };

      const updatedComments = [...localComments, newCommentObj];
      setLocalComments(updatedComments);
      setNewComment('');

      const waveRef = doc(db, 'waves', wave.id);
      await updateDoc(waveRef, {
        comments: increment(1),
        commentsList: arrayUnion(newCommentObj)
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      setLocalComments(wave.commentsList || []);
      
      toast({
        title: 'Error',
        description: 'Could not add comment.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const navigateToAuthorProfile = (e) => {
    e.stopPropagation();
    if (authorData?.username) {
      navigate(`/profile/${authorData.username}`);
    } else {
      toast({
        title: 'Error',
        description: 'Could not find author profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const navigateToCommenterProfile = (e, userId) => {
    e.stopPropagation();
    const userData = commentUserData[userId];
    if (userData?.username) {
      navigate(`/profile/${currentUser?.username}`);
    } else {
      toast({
        title: 'Error',
        description: 'Could not find user profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const mediaContainerHeight = compactMode ? '200px' : '350px';
  const commentsMaxHeight = '200px';

  return (
    <Box
      w="100%"
      bg={isDark ? '#121212' : 'white'}
      borderRadius="lg"
      p={compactMode ? 3 : 4}
      mb={4}
      boxShadow={compactMode ? 'base' : 'md'}
      borderWidth="1px"
      borderColor={isDark ? 'gray.700' : 'gray.200'}
      overflow="hidden"
    >
      {/* User Info Header */}
      <Flex align="center" mb={3} justify="space-between">
        <Flex align="center" cursor="pointer" onClick={navigateToAuthorProfile}>
          {loadingAuthor ? (
            <SkeletonCircle size={compactMode ? 'sm' : 'md'} mr={3} />
          ) : (
            <Avatar
              src={authorData?.profileImage || '/default-avatar.png'}
              name={authorData?.displayName || 'User'}
              size={compactMode ? 'sm' : 'md'}
              mr={3}
            />
          )}
          <Box>
            {loadingAuthor ? (
              <>
                <Skeleton height="16px" width="120px" mb={1} />
                <Skeleton height="12px" width="80px" />
              </>
            ) : (
              <>
                <Text fontWeight="bold" fontSize={compactMode ? 'sm' : 'md'}>
                  {authorData?.displayName || 'User'}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  @{authorData?.username || 'user'} · {displayTimestamp}
                </Text>
              </>
            )}
          </Box>
        </Flex>

        {isOwner && (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiMoreHorizontal />}
              variant="ghost"
              aria-label="Options"
              size={compactMode ? 'xs' : 'sm'}
            />
            <MenuList bg={isDark ? '#121212' : 'white'} borderColor={isDark ? 'gray.600' : 'gray.200'}>
              <MenuItem
                icon={<FiTrash2 />}
                onClick={onOpen}
                color="red.400"
                _hover={{ bg: isDark ? 'red.900' : 'red.50' }}
                bg={isDark ? '#121212' : 'white'}
              >
                Delete Wave
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>

      {/* Title and Content */}
      <Box px={1} mb={3}>
        {wave.title && (
          <Heading size={compactMode ? 'xs' : 'sm'} mb={1}>
            {wave.title}
          </Heading>
        )}
        {wave.content && (
          <Text
            fontSize={compactMode ? 'xs' : 'sm'}
            noOfLines={compactMode ? 2 : 4}
            whiteSpace="pre-wrap"
          >
            {wave.content}
          </Text>
        )}
      </Box>

      {/* Media Content */}
      {wave.mediaUrls && wave.mediaUrls.length > 0 && (
        <Box
          width="100%"
          height={mediaContainerHeight}
          mb={3}
          position="relative"
          overflow="hidden"
          bg={isDark ? 'gray.800' : 'gray.100'}
          borderRadius="md"
          onClick={wave.mediaType === 'video' ? toggleVideoPlayback : undefined}
          cursor={wave.mediaType === 'video' ? 'pointer' : 'auto'}
        >
          {wave.mediaType === 'image' && (
            <Image
              src={wave.mediaUrls[0]}
              alt={wave.title || 'Wave image'}
              width="100%"
              height="100%"
              objectFit="contain"
              fallbackSrc="/placeholder-image.jpg"
            />
          )}

          {wave.mediaType === 'video' && (
            <>
              <AspectRatio ratio={9/16} width="100%" height="100%">
                <Box
                  as="video"
                  ref={videoRef}
                  src={wave.mediaUrls[0]}
                  loop
                  muted={isVideoMuted}
                  volume={videoVolume}
                  playsInline
                  preload="metadata"
                  objectFit="cover"
                  width="100%"
                  height="100%"
                  style={{
                    backgroundColor: isDark ? '#000' : '#f0f0f0',
                  }}
                />
              </AspectRatio>
              
              {/* Video controls overlay */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                pointerEvents="none"
              >
                {!isVideoPlaying && (
                  <Box
                    bg="blackAlpha.600"
                    borderRadius="full"
                    p={4}
                    pointerEvents="none"
                  >
                    <Icon 
                      as={FiPlay} 
                      boxSize={8} 
                      color="white" 
                    />
                  </Box>
                )}
              </Box>
              
              {/* Volume controls */}
              <Box
                position="absolute"
                bottom={4}
                right={4}
                display="flex"
                flexDirection="column"
                alignItems="flex-end"
                gap={2}
                onMouseLeave={() => {
                  const timeout = setTimeout(() => {
                    setIsVolumeHovered(false);
                  }, 500);
                  setVolumeTimeout(timeout);
                }}
                onMouseEnter={() => {
                  if (volumeTimeout) {
                    clearTimeout(volumeTimeout);
                  }
                  setIsVolumeHovered(true);
                }}
              >
                <Popover
                  isOpen={isVolumeHovered}
                  placement="top-end"
                  closeOnBlur={false}
                  autoFocus={false}
                >
                  <PopoverTrigger>
                    <IconButton
                      aria-label={isVideoMuted ? 'Unmute video' : 'Mute video'}
                      icon={<Icon as={getVolumeIcon()} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute(e);
                      }}
                      size="sm"
                      borderRadius="full"
                      bg="blackAlpha.600"
                      color="white"
                      _hover={{ bg: 'blackAlpha.700' }}
                      pointerEvents="auto"
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    width="24px"
                    bg="blackAlpha.700"
                    border="none"
                    shadow="none"
                    _focus={{ outline: 'none' }}
                    pointerEvents="auto"
                    onClick={(e) => e.stopPropagation()}
                    borderRadius="md"
                  >
                    <PopoverBody p={1}>
                      <Slider
                        aria-label="Volume slider"
                        orientation="vertical"
                        minH="80px"
                        min={0}
                        max={1}
                        step={0.1}
                        value={isVideoMuted ? 0 : videoVolume}
                        onChange={handleVolumeChange}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SliderTrack 
                          bg="whiteAlpha.200" 
                          width="2px"
                        >
                          <SliderFilledTrack 
                            bg="white" 
                          />
                        </SliderTrack>
                        <SliderThumb 
                          boxSize={2.5}
                          bg="white"
                          _focus={{ boxShadow: 'none' }}
                          _hover={{ boxSize: 3 }}
                          transition="all 0.2s"
                        />
                      </Slider>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Box>
              
              {/* Loading indicator */}
              {!hasVideoPlayed && isVideoInView && (
                <Flex
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  alignItems="center"
                  justifyContent="center"
                  bg="blackAlpha.300"
                >
                  <Spinner color="white" size="lg" />
                </Flex>
              )}
            </>
          )}

          {wave.mediaType === 'audio' && (
            <Flex width="100%" height="100%" align="center" justify="center" p={4}>
              <audio controls src={wave.mediaUrls[0]} style={{ width: '100%' }} />
            </Flex>
          )}
        </Box>
      )}

      {/* Category and Rating */}
      <HStack justify="space-between" align="center" mb={3} px={1}>
        {wave.category && (
          <Tag colorScheme="blue" size="sm">
            {wave.category}
          </Tag>
        )}
        {typeof wave.rating === 'number' && (
          <HStack spacing={1}>
            <Icon as={FiStar} color="yellow.400" />
            <Text fontSize="sm" fontWeight="bold">
              {wave.rating.toFixed(1)}
            </Text>
          </HStack>
        )}
      </HStack>

      {/* Interaction Buttons */}
      <Flex
        justify="space-between"
        align="center"
        px={1}
        py={2}
        borderTopWidth="1px"
        borderColor={isDark ? 'gray.700' : 'gray.200'}
      >
        <HStack spacing={compactMode ? 1 : 2}>
          <Button
            leftIcon={<FiHeart fill={localLikes.wave.isLiked ? 'currentColor' : 'none'} />}
            onClick={handleLike}
            variant="ghost"
            size="sm"
            colorScheme={localLikes.wave.isLiked ? 'red' : 'gray'}
          >
            {localLikes.wave.count}
          </Button>

          <Button
            leftIcon={<FiMessageSquare />}
            onClick={() => setShowComments(!showComments)}
            variant="ghost"
            size="sm"
            colorScheme={showComments ? 'blue' : 'gray'}
          >
            {wave.comments || 0}
          </Button>
        </HStack>

        {typeof wave.views === 'number' && !compactMode && (
          <HStack spacing={1} color="gray.500">
            <Icon as={FiEye} boxSize={4} />
            <Text fontSize="sm">{wave.views}</Text>
          </HStack>
        )}
      </Flex>

      {/* Comments Section */}
      <Collapse in={showComments}>
        <VStack spacing={3} align="stretch" mt={3} px={1} pb={2}>
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
                  if (e.key === 'Enter') handleComment();
                }}
              />
              <IconButton
                icon={<FiSend />}
                aria-label="Send Comment"
                onClick={handleComment}
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

          {/* Scrollable Comments Container */}
          <Box 
            maxHeight={commentsMaxHeight}
            overflowY="auto"
            css={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                width: '8px',
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                borderRadius: '24px',
              },
            }}
          >
            {loadingCommentUsers && (
              <Box py={2}>
                <Skeleton height="24px" mb={2} />
                <Skeleton height="24px" mb={2} />
                <Skeleton height="24px" />
              </Box>
            )}

            {!loadingCommentUsers && localComments && localComments.length > 0 ? (
              [...localComments]
                .filter(comment => !comment.parentCommentId)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((comment) => {
                  const userData = commentUserData[comment.userId] || {};
                  const displayName = userData.displayName || comment.displayName || 'User';
                  const profileImage = userData.profileImage || comment.profileImage || '/default-avatar.png';
                  const username = userData.username || comment.username || 'user';
                  const isCommentOwner = currentUser?.uid === comment.userId;
                  const isCommentLiked = comment.likes?.includes(currentUser?.uid);
                  const replies = localComments.filter(c => c.parentCommentId === comment.id);
                  const isExpanded = expandedComments.has(comment.id);

                  return (
                    <VStack key={comment.id} align="stretch" spacing={2}>
                      <Flex 
                        align="start"
                        p={2}
                        _hover={{
                          bg: isDark ? 'whiteAlpha.50' : 'gray.50',
                          borderRadius: 'md'
                        }}
                      >
                        <Avatar 
                          size="xs" 
                          src={profileImage} 
                          mr={2} 
                          cursor="pointer" 
                          onClick={(e) => navigateToCommenterProfile(e, comment.userId)}
                        />
                        <Box flex={1}>
                          {/* Comment Header */}
                          <Flex alignItems="center" justifyContent="space-between">
                            <Flex alignItems="center" flex={1}>
                              <Text 
                                fontWeight="bold" 
                                fontSize="xs" 
                                cursor="pointer" 
                                onClick={(e) => navigateToCommenterProfile(e, comment.userId)}
                              >
                                {displayName}
                              </Text>
                              <Text fontSize="xs" color="gray.500" ml={1}>
                                @{username}
                              </Text>
                              <Text fontSize="xs" color="gray.500" ml={2}>
                                {formatTimestamp(comment.timestamp)}
                              </Text>
                            </Flex>
                            {(isCommentOwner || isOwner) && (
                              <IconButton
                                icon={<FiTrash />}
                                aria-label="Delete comment"
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteComment(comment.id)}
                              />
                            )}
                          </Flex>

                          {/* Comment Content */}
                          <Text fontSize="xs" whiteSpace="pre-wrap" mt={1}>
                            {comment.content}
                          </Text>

                          {/* Comment Actions */}
                          <HStack mt={2} spacing={4}>
                            <Button
                              leftIcon={<FiHeart fill={isCommentLiked ? 'currentColor' : 'none'} />}
                              onClick={() => handleLikeComment(comment.id)}
                              variant="ghost"
                              size="xs"
                              colorScheme={isCommentLiked ? 'red' : 'gray'}
                            >
                              {comment.likes?.length || 0}
                            </Button>
                            <Button
                              leftIcon={<FiMessageSquare />}
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              variant="ghost"
                              size="xs"
                              colorScheme={replyingTo === comment.id ? 'blue' : 'gray'}
                            >
                              Reply
                            </Button>
                            {replies.length > 0 && (
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => toggleReplies(comment.id)}
                                rightIcon={
                                  <Icon 
                                    as={isExpanded ? FiChevronUp : FiChevronDown} 
                                    transition="transform 0.2s"
                                  />
                                }
                              >
                                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                              </Button>
                            )}
                          </HStack>

                          {/* Reply Input */}
                          {replyingTo === comment.id && (
                            <Flex mt={2}>
                              <Input
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                size="xs"
                                mr={2}
                                bg={isDark ? 'gray.700' : 'white'}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') handleReply(comment.id);
                                }}
                              />
                              <IconButton
                                icon={<FiSend />}
                                aria-label="Send Reply"
                                onClick={() => handleReply(comment.id)}
                                isDisabled={!replyText.trim()}
                                colorScheme="blue"
                                size="xs"
                              />
                            </Flex>
                          )}

                          {/* Replies Collapse */}
                          <Collapse in={isExpanded}>
                            <VStack mt={2} pl={4} spacing={2} align="stretch">
                              {replies
                                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                                .map(reply => {
                                  const replyUserData = commentUserData[reply.userId] || {};
                                  const replyDisplayName = replyUserData.displayName || reply.displayName || 'User';
                                  const replyProfileImage = replyUserData.profileImage || reply.profileImage || '/default-avatar.png';
                                  const replyUsername = replyUserData.username || reply.username || 'user';
                                  const isReplyOwner = currentUser?.uid === reply.userId;
                                  const isReplyLiked = reply.likes?.includes(currentUser?.uid);

                                  return (
                                    <Flex 
                                      key={reply.id}
                                      align="start"
                                      p={2}
                                      borderLeftWidth="2px"
                                      borderLeftColor={isDark ? 'whiteAlpha.200' : 'gray.200'}
                                      _hover={{
                                        bg: isDark ? 'whiteAlpha.50' : 'gray.50',
                                        borderRadius: 'md'
                                      }}
                                    >
                                    <Avatar 
                                      size="xs" 
                                      src={profileImage} 
                                      mr={2} 
                                      cursor="pointer" 
                                      onClick={(e) => navigateToCommenterProfile(e, comment.userId)}
                                    />
                                      <Box flex={1}>
                                        <Flex alignItems="center" justifyContent="space-between">
                                          <Flex alignItems="center" flex={1}>
                                          <Text 
                                            fontWeight="bold" 
                                            fontSize="xs" 
                                            cursor="pointer" 
                                            onClick={(e) => navigateToCommenterProfile(e, comment.userId)}
                                          >
                                            {displayName}
                                          </Text>
                                            <Text fontSize="xs" color="gray.500" ml={1}>
                                              @{replyUsername}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500" ml={2}>
                                              {formatTimestamp(reply.timestamp)}
                                            </Text>
                                          </Flex>
                                          {(isReplyOwner || isOwner) && (
                                            <IconButton
                                              icon={<FiTrash />}
                                              aria-label="Delete reply"
                                              size="xs"
                                              variant="ghost"
                                              colorScheme="red"
                                              onClick={() => handleDeleteComment(reply.id)}
                                            />
                                          )}
                                        </Flex>
                                        <Text fontSize="xs" whiteSpace="pre-wrap" mt={1}>
                                          {reply.content}
                                        </Text>
                                        <Button
                                          leftIcon={<FiHeart fill={isReplyLiked ? 'currentColor' : 'none'} />}
                                          onClick={() => handleLikeComment(reply.id)}
                                          variant="ghost"
                                          size="xs"
                                          mt={2}
                                          colorScheme={isReplyLiked ? 'red' : 'gray'}
                                        >
                                          {reply.likes?.length || 0}
                                        </Button>
                                      </Box>
                                    </Flex>
                                  );
                                })}
                            </VStack>
                          </Collapse>
                        </Box>
                      </Flex>
                    </VStack>
                  );
                })
            ) : (
              !loadingCommentUsers && (
                <Text fontSize="xs" color="gray.500" textAlign="center" py={2}>
                  No comments yet.
                </Text>
              )
            )}
          </Box>
        </VStack>
      </Collapse>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent bg={isDark ? '#121212' : 'white'}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Wave
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this wave? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="ghost">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default WaveCard;