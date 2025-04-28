import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Flex,
  Avatar,
  Text,
  Image,
  IconButton,
  Badge,
  HStack,
  VStack,
  useDisclosure,
  Icon,
  Button,
  useColorMode,
  useToast,
  AspectRatio,
  Spinner,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Progress,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tooltip,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  RadioGroup,
  Radio,
  Stack,
  Divider
} from '@chakra-ui/react';
import { 
  FiHeart, 
  FiMessageSquare, 
  FiStar, 
  FiMoreHorizontal,
  FiPlay,
  FiPause,
  FiVolumeX,
  FiVolume2,
  FiShare2,
  FiTrash2,
  FiBookmark,
  FiBell,
  FiZap,
  FiMapPin,
  FiUser,
  FiUsers,
  FiX,
  FiCheck
} from 'react-icons/fi';
import { doc, getDoc, deleteDoc, updateDoc, arrayUnion, increment, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../../Firebase/firebase';
import { useNavigate } from 'react-router-dom';

const WaveCard = ({ wave, currentUser, onCommentsClick = false }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const [authorData, setAuthorData] = useState(null);
  const [waveData, setWaveData] = useState(wave);
  const [localLikes, setLocalLikes] = useState({
    count: wave.likes || 0,
    isLiked: wave.likedBy?.includes(currentUser?.uid) || false
  });
  const [isSaved, setIsSaved] = useState(wave.savedBy?.includes(currentUser?.uid) || false);
  const [userRating, setUserRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [tempRating, setTempRating] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const fullContentRef = useRef(null);

  // Video player state
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoVolume, setVideoVolume] = useState(0.5);
  const [hasVideoPlayed, setHasVideoPlayed] = useState(false);
  const [isVideoInView, setIsVideoInView] = useState(false);
  
  const cancelRef = useRef();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!wave.id) return;
  
    const waveRef = doc(db, 'waves', wave.id);
    const unsubscribe = onSnapshot(waveRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setWaveData(data);
        
        setLocalLikes({
          count: data.likes || 0,
          isLiked: data.likedBy?.includes(currentUser?.uid) || false
        });
        
        setIsSaved(data.savedBy?.includes(currentUser?.uid) || false);

        // Find the user's rating if it exists
        if (currentUser?.uid && data.communityRatings) {
          const userRatingObj = data.communityRatings.find(r => r.userId === currentUser.uid);
          setUserRating(userRatingObj ? userRatingObj.rating : null);
        }
      }
    });
  
    return () => unsubscribe();
  }, [wave.id, currentUser?.uid]);

  useEffect(() => {
    if (!videoRef.current || wave.mediaType !== 'video') return;
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsVideoInView(entry.isIntersecting);
          
          if (entry.isIntersecting) {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
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
        threshold: 0.6,
        rootMargin: '0px 0px -50px 0px'
      }
    );
  
    observer.observe(videoRef.current);
  
    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [wave.mediaType]);

  // Video progress tracking
  useEffect(() => {
    if (!videoRef.current || wave.mediaType !== 'video') return;
    
    const updateProgress = () => {
      if (videoRef.current) {
        const duration = videoRef.current.duration;
        const currentTime = videoRef.current.currentTime;
        if (duration > 0) {
          setVideoProgress((currentTime / duration) * 100);
        }
      }
    };
    
    videoRef.current.addEventListener('timeupdate', updateProgress);
    
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, [wave.mediaType, isVideoPlaying]);

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
        setAuthorData({
          displayName: wave.displayName || 'User',
          username: wave.username || 'user',
          profileImage: wave.profileImage || '/default-avatar.png'
        });
      }
    };

    fetchAuthorData();
  }, [wave.userId, wave.displayName, wave.username, wave.profileImage]);

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
      const newMuted = !isVideoMuted;
      setIsVideoMuted(newMuted);
      videoRef.current.muted = newMuted;
      if (newMuted) {
        setVideoVolume(0);
      } else {
        setVideoVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
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
      const newLikeStatus = !localLikes.isLiked;
      setLocalLikes({
        count: newLikeStatus ? localLikes.count + 1 : localLikes.count - 1,
        isLiked: newLikeStatus
      });

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
        count: prev.count,
        isLiked: !prev.isLiked
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

  const handleSave = async () => {
    if (!currentUser) {
      toast({
        title: 'Login Required',
        description: 'Please log in to save waves.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const newSaveStatus = !isSaved;
      setIsSaved(newSaveStatus);

      const waveRef = doc(db, 'waves', wave.id);
      await updateDoc(waveRef, {
        savedBy: newSaveStatus
          ? arrayUnion(currentUser.uid)
          : arrayRemove(currentUser.uid)
      });
      
      toast({
        title: newSaveStatus ? 'Wave saved' : 'Wave unsaved',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving wave:', error);
      setIsSaved(!isSaved);
      toast({
        title: 'Error',
        description: 'Could not update save status.',
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

  const getLikesText = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getCommentsText = (count) => {
    if (!count) return '0 comments';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k comments`;
    }
    return `${count} ${count === 1 ? 'comment' : 'comments'}`;
  };

  const handleRateClick = () => {
    if (!currentUser) {
      toast({
        title: 'Login Required',
        description: 'Please log in to rate waves.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isOwner) {
      toast({
        title: 'Cannot Rate',
        description: 'You cannot rate your own community wave.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setTempRating(userRating || 0);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    try {
      const waveRef = doc(db, 'waves', wave.id);
      
      // Remove existing rating if it exists
      const updatedRatings = waveData.communityRatings
        ? waveData.communityRatings.filter(r => r.userId !== currentUser.uid)
        : [];
      
      // Add new rating
      updatedRatings.push({
        userId: currentUser.uid,
        rating: tempRating
      });
      
      // Calculate new average
      const averageRating = updatedRatings.reduce((sum, r) => sum + r.rating, 0) / updatedRatings.length;
      
      await updateDoc(waveRef, {
        communityRatings: updatedRatings,
        averageRating: parseFloat(averageRating.toFixed(1))
      });
      
      setUserRating(tempRating);
      setShowRatingModal(false);
      
      toast({
        title: 'Rating submitted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Error',
        description: 'Could not submit rating.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderRatingStars = (rating, max = 5, size = 4) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= max; i++) {
      if (i <= fullStars) {
        stars.push(<Icon key={i} as={FiStar} color="yellow.400" boxSize={size} fill="yellow.400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Icon key={i} as={FiStar} color="yellow.400" boxSize={size} fill="url(#half-star)" />);
      } else {
        stars.push(<Icon key={i} as={FiStar} color="yellow.400" boxSize={size} />);
      }
    }
    
    return (
      <HStack spacing={0.5}>
        {stars}
        <svg width="0" height="0">
          <defs>
            <linearGradient id="half-star" x1="0" x2="100%" y1="0" y2="0">
              <stop offset="50%" stopColor="yellow" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </HStack>
    );
  };

  const renderRatingControl = () => {
    if (wave.communityRatingScale === 5) {
      return (
        <Box>
          <Text mb={2} fontSize="sm" color={isDark ? "gray.300" : "gray.600"}>
            Rate this content (1-5 stars):
          </Text>
          <HStack spacing={1} justify="center">
            {[1, 2, 3, 4, 5].map((star) => (
              <IconButton
                key={star}
                aria-label={`Rate ${star} stars`}
                icon={<FiStar />}
                color={tempRating >= star ? "yellow.400" : "gray.300"}
                fill={tempRating >= star ? "yellow.400" : "transparent"}
                variant="ghost"
                size="sm"
                onClick={() => setTempRating(star)}
                _hover={{ transform: 'scale(1.2)' }}
                transition="transform 0.2s"
              />
            ))}
          </HStack>
          <Text mt={1} textAlign="center" fontSize="sm">
            {tempRating} / 5 stars
          </Text>
        </Box>
      );
    } else {
      return (
        <Box>
          <Text mb={2} fontSize="sm" color={isDark ? "gray.300" : "gray.600"}>
            Rate this content (1-10 points):
          </Text>
          <Slider
            aria-label="Rating slider"
            min={1}
            max={10}
            step={0.5}
            value={tempRating}
            onChange={setTempRating}
            colorScheme="yellow"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={4}>
              <Box color="yellow.400" as={FiStar} />
            </SliderThumb>
          </Slider>
          <Text mt={1} textAlign="center" fontSize="sm">
            {tempRating} / 10 points
          </Text>
        </Box>
      );
    }
  };

  const renderWaveRating = () => {
    if (wave.waveType === 'personal' && wave.rating !== null) {
      // Determine if it's a 5-point or 10-point scale
      const isNumberRating = wave.rating > 5;
      const maxScale = isNumberRating ? 10 : 5;
      
      return (
        <Flex
          position="absolute"
          bottom="3%"
          left="50%"
          transform="translateX(-50%)"
          zIndex="10"
          bg={isDark ? "blue.900" : "blue.50"} 
          py={1}
          px={3}
          align="center"
          justify="center"
          borderRadius="full"
          boxShadow="md"
          borderWidth="1px"
          borderColor={isDark ? "blue.800" : "blue.100"}
        >
          <HStack spacing={1}>
            <Icon as={FiUser} color={isDark ? "blue.300" : "blue.500"} boxSize={3} />
            <Text fontSize="sm" fontWeight="bold">
              Author Rating: {wave.rating.toFixed(1)}/{maxScale}
            </Text>
          </HStack>
        </Flex>
      );
    } else if (wave.waveType === 'community' && wave.averageRating !== null) {
      return (
        <Flex
          position="absolute"
          bottom="3%"
          left="50%"
          transform="translateX(-50%)"
          zIndex="10"
          bg={isDark ? "purple.900" : "purple.50"} 
          py={1}
          px={3}
          align="center"
          justify="center"
          borderRadius="full"
          boxShadow="md"
          borderWidth="1px"
          borderColor={isDark ? "purple.800" : "purple.100"}
        >
          <HStack spacing={1}>
            <Icon as={FiUsers} color={isDark ? "purple.300" : "purple.500"} boxSize={3} />
            <Text fontSize="sm" fontWeight="bold">
              Community Rating: {wave.averageRating.toFixed(1)}/{wave.communityRatingScale}
            </Text>
          </HStack>
        </Flex>
      );
    }
    return null;
  };

  const handleRemoveRating = async () => {
    try {
      const waveRef = doc(db, 'waves', wave.id);
      
      // Filter out user's rating
      const updatedRatings = waveData.communityRatings.filter(r => r.userId !== currentUser.uid);
      
      // Calculate new average if there are remaining ratings
      const averageRating = updatedRatings.length > 0
        ? updatedRatings.reduce((sum, r) => sum + r.rating, 0) / updatedRatings.length
        : null;
      
      await updateDoc(waveRef, {
        communityRatings: updatedRatings,
        averageRating: averageRating ? parseFloat(averageRating.toFixed(1)) : null
      });
      
      setUserRating(null);
      setShowRatingModal(false);
      
      toast({
        title: 'Rating removed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error removing rating:', error);
      toast({
        title: 'Error',
        description: 'Could not remove rating.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (isExpanded && fullContentRef.current) {
      setContentHeight(fullContentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  return (
    <Box
      w="100%"
      bg={isDark ? '#1a1a1a' : '#f8f9fa'}
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      mb={4}
      boxShadow={isDark ? "0 4px 12px rgba(0,0,0,0.15)" : "0 4px 12px rgba(0,0,0,0.08)"}
      transition="transform 0.2s"
    >
      {/* Media Content with User Info Overlay */}
      {wave.mediaUrls && wave.mediaUrls.length > 0 && (
        <Box position="relative" width="100%" height="650px">
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            overflow="hidden"
            zIndex="0"
          >
            {wave.mediaType === 'image' && (
              <Image
                src={wave.mediaUrls[0]}
                alt=""
                objectFit="cover"
                width="100%"
                height="100%"
                filter="blur(20px)"
                transform="scale(1.1)"
                opacity="0.8"
              />
            )}
            {wave.mediaType === 'video' && (
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bgGradient={isDark ? "linear(to-b, blackAlpha.600, blackAlpha.800)" : "linear(to-b, whiteAlpha.600, whiteAlpha.800)"}
              />
            )}
          </Box>
          
          <Flex
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            justifyContent="center"
            alignItems="center"
            zIndex="1"
            padding="0"
            onClick={wave.mediaType === 'video' ? toggleVideoPlayback : undefined}
            cursor={wave.mediaType === 'video' ? 'pointer' : 'auto'}
          >
            {wave.mediaType === 'image' && (
              <Image
                src={wave.mediaUrls[0]}
                alt={wave.title || 'Wave image'}
                objectFit="contain"
                maxH="100%"
                maxW="100%"
                fallbackSrc="/placeholder-image.jpg"
              />
            )}

            {renderWaveRating()}

            {wave.mediaType === 'video' && (
              <>
                <Box
                  as="video"
                  ref={videoRef}
                  src={wave.mediaUrls[0]}
                  loop
                  muted={isVideoMuted}
                  volume={videoVolume}
                  playsInline
                  preload="metadata"
                  width="100%"
                  maxHeight="100%"
                  objectFit="contain"
                  style={{ maxWidth: "100%" }}
                />
                
                {/* Video play/pause overlay */}
                {isVideoInView && (
                  <IconButton
                    aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                    icon={<Icon as={isVideoPlaying ? FiPause : FiPlay} boxSize={8} />}
                    size="lg"
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    borderRadius="full"
                    bg="blackAlpha.600"
                    color="white"
                    _hover={{ bg: 'blackAlpha.700' }}
                    opacity={isVideoPlaying ? 0 : 1}
                    transition="opacity 0.3s"
                    _groupHover={{ opacity: 1 }}
                    onClick={toggleVideoPlayback}
                  />
                )}
                
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
                    <Spinner color="white" size="md" />
                  </Flex>
                )}
              </>
            )}
          </Flex>
          
          {/* Header with author info overlay */}
          <Flex 
            position="absolute" 
            top="0"
            left="0"
            right="0"
            zIndex="10"
            justify="space-between" 
            align="center" 
            p={3}
            bgGradient={isDark 
              ? "linear(to-b, blackAlpha.800, blackAlpha.600, transparent)" 
              : "linear(to-b, rgba(255,255,255,0.4), rgba(255,255,255,0.2), transparent)"}
          >
            <Flex align="center" flex="1" overflow="hidden">
              <Avatar 
                size="sm"
                src={authorData?.profileImage} 
                name={authorData?.displayName} 
                onClick={navigateToAuthorProfile}
                cursor="pointer"
                mr={2}
                borderWidth={2}
                borderColor={isDark ? "blue.500" : "blue.400"}
              />
              <Box flex="1" minW="0">
                <Text 
                  fontWeight="bold" 
                  fontSize="sm" 
                  onClick={navigateToAuthorProfile} 
                  cursor="pointer"
                  isTruncated
                  color={isDark ? "white" : "gray.800"}
                >
                  {authorData?.displayName || authorData?.username || 'User'}
                </Text>
                <HStack spacing={1}>
                  <Text color={isDark ? "gray.300" : "gray.600"} fontSize="xs" isTruncated>
                    @{authorData?.username || 'user'}
                  </Text>
                  <Text color={isDark ? "gray.300" : "gray.600"} fontSize="xs">
                    • {displayTimestamp}
                  </Text>
                </HStack>
              </Box>
            </Flex>
            
            <HStack>
              {wave.location && (
                <Tooltip label={wave.location} placement="top">
                  <Icon 
                    as={FiMapPin} 
                    color={isDark ? "blue.300" : "blue.500"} 
                    boxSize={4} 
                  />
                </Tooltip>
              )}
              {isOwner && ( 
                <IconButton
                  aria-label="More options"
                  icon={<FiMoreHorizontal />}
                  variant="ghost"
                  size="sm"
                  color={isDark ? "white" : "gray.700"}
                  onClick={onOpen}
                />
              )}
            </HStack>
          </Flex>
          
          {/* Video progress bar */}
          {wave.mediaType === 'video' && (
            <Progress 
              value={videoProgress} 
              size="xs" 
              colorScheme="blue" 
              width="100%" 
              position="absolute"
              bottom="0"
              left="0"
              right="0"
              zIndex="5"
            />
          )}
          
          {/* Volume control for video */}
          {wave.mediaType === 'video' && (
            <Flex
              position="absolute"
              bottom="2"
              left="2"
              align="center"
              bg="blackAlpha.600"
              borderRadius="full"
              padding="1"
              zIndex="5"
            >
              <IconButton
                aria-label={isVideoMuted ? 'Unmute video' : 'Mute video'}
                icon={<Icon as={isVideoMuted ? FiVolumeX : FiVolume2} />}
                onClick={toggleMute}
                size="sm"
                borderRadius="full"
                variant="ghost"
                color="white"
              />
              
              {!isVideoMuted && (
                <Slider
                  aria-label="Volume"
                  value={videoVolume * 100}
                  min={0}
                  max={100}
                  width="60px"
                  ml={1}
                  onChange={(val) => setVideoVolume(val / 100)}
                  colorScheme="blue"
                >
                  <SliderTrack bg="whiteAlpha.300">
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={2} />
                </Slider>
              )}
            </Flex>
          )}
        </Box>
      )}

<Box p={3} position="relative">
  {/* Wave content */}
  <Box position="relative">
    {isExpanded ? (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: 1,
          height: "auto", 
          transition: { duration: 0.3 }
        }}
        style={{
          position: 'absolute',
          bottom: '100%',
          left: -12,
          right: -12,
          width: 'calc(100% + 24px)',
          zIndex: 20
        }}
      >
        <Box
          bg={isDark ? '#1a1a1a' : '#f8f9fa'} 
          p={4}
          pb={10}
          boxShadow={isDark ? "0 -4px 12px rgba(0,0,0,0.15)" : "0 -4px 12px rgba(0,0,0,0.08)"}
          borderTopRadius="md"
          maxHeight="300px"
          overflowY="auto"
          width="100%"
        >
          {/* Title in expanded view */}
          {wave.title && (
            <Text fontWeight="bold" fontSize="md" mb={2}>
              {wave.title}
            </Text>
          )}
          <Text fontSize="sm">
            {wave.content}
          </Text>
          <Button 
            size="xs" 
            variant="ghost" 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            position="absolute"
            bottom="1rem"
            right="1rem"
          >
            Show less
          </Button>
        </Box>
      </motion.div>
    ) : (
      wave.title && (
        <Text fontWeight="bold" fontSize="md" mb={1} isTruncated>
          {wave.title}
        </Text>
      )
    )}
    
    {wave.content && !isExpanded && (
      <Text fontSize="sm" mb={2} noOfLines={2} position="relative">
        {wave.content}
        {wave.content.split(' ').length > 20 && (
          <Text
            as="span"
            color="blue.500"
            cursor="pointer"
            fontWeight="medium"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            position="absolute"
            right={0}
            bottom={0}
            bg={isDark ? "#1a1a1a" : "#f8f9fa"}
          >
            ... More
          </Text>
        )}
      </Text>
    )}
  </Box>
        
        {/* Compact action buttons */}
        <Flex justify="space-between" align="center" pt={1}>
          <HStack spacing={3}>
            <IconButton
              aria-label="Like"
              icon={<FiHeart 
                fill={localLikes.isLiked ? (isDark ? "#F45B69" : "#E53E3E") : "transparent"} 
                size={18}
              />}
              variant="ghost"
              size="sm"
              color={localLikes.isLiked ? (isDark ? "#F45B69" : "#E53E3E") : (isDark ? "white" : "black")}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              bg={isDark ? "whiteAlpha.100" : "blackAlpha.50"}
              _hover={{
                bg: isDark ? "whiteAlpha.200" : "blackAlpha.100"
              }}
              borderRadius="full"
            />
            
            <IconButton
              aria-label="Comment"
              icon={<FiMessageSquare size={18} />}
              variant="ghost"
              size="sm"
              color={isDark ? "white" : "black"}
              onClick={(e) => {
                e.stopPropagation();
                if (onCommentsClick) {
                  onCommentsClick(wave.id);
                }
              }}
              bg={isDark ? "whiteAlpha.100" : "blackAlpha.50"}
              _hover={{
                bg: isDark ? "whiteAlpha.200" : "blackAlpha.100"
              }}
              borderRadius="full"
            />

            <IconButton
              aria-label="Share"
              icon={<FiShare2 size={18} />}
              variant="ghost"
              size="sm"
              color={isDark ? "white" : "black"}
              onClick={() => toast({
                title: "Share options",
                status: "info",
                duration: 2000,
              })}
              bg={isDark ? "whiteAlpha.100" : "blackAlpha.50"}
              _hover={{
                bg: isDark ? "whiteAlpha.200" : "blackAlpha.100"
              }}
              borderRadius="full"
            />
            
            {wave.waveType === 'community' && !isOwner && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRateClick();
                }}
                bg={isDark ? "whiteAlpha.100" : "blackAlpha.50"}
                _hover={{
                  bg: isDark ? "whiteAlpha.200" : "blackAlpha.100"
                }}
                color={userRating ? (isDark ? "yellow.400" : "yellow.500") : (isDark ? "white" : "black")}
                leftIcon={<FiStar 
                  fill={userRating ? (isDark ? "yellow.400" : "yellow.500") : "transparent"} 
                  size={14}
                />}
                borderRadius="full"
              >
                {userRating ? 'Update' : 'Rate'}
              </Button>
            )}
          </HStack>
          
          <IconButton
            aria-label={isSaved ? "Unsave" : "Save"}
            icon={<FiBookmark 
              fill={isSaved ? (isDark ? "#63B3ED" : "#3182CE") : "transparent"} 
              size={18}
            />}
            variant="ghost"
            size="sm"
            color={isSaved ? (isDark ? "#63B3ED" : "#3182CE") : (isDark ? "white" : "black")}
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            bg={isDark ? "whiteAlpha.100" : "blackAlpha.50"}
            _hover={{
              bg: isDark ? "whiteAlpha.200" : "blackAlpha.100"
            }}
            borderRadius="full"
          />
        </Flex>
        
        <Flex justify="space-between" align="center" mt={1}>
          <HStack spacing={2} color={isDark ? "gray.400" : "gray.500"} fontSize="xs">
            <Text>{getLikesText(localLikes.count)} likes</Text>
            <Text>•</Text>
            <Text>{getCommentsText(wave.commentsList?.length)}</Text>
            {wave.waveType === 'community' && wave.averageRating && (
              <>
                <Text>•</Text>
                <HStack spacing={0.5}>
                  <Icon as={FiStar} color="yellow.400" boxSize={2.5} />
                  <Text>{wave.averageRating.toFixed(1)}/{wave.communityRatingScale}</Text>
                </HStack>
              </>
            )}
          </HStack>
          {wave.category && (
            <Badge colorScheme="blue" variant="subtle" rounded="full" fontSize="xs" px={2}>
              {wave.category}
            </Badge>
          )}
        </Flex>
      </Box>

      {/* Delete Modal */}
      {isOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex="modal"
          onClick={onClose}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            bg={isDark ? "#1a1a1a" : "white"}
            borderRadius="xl"
            overflow="hidden"
            width="300px"
            onClick={(e) => e.stopPropagation()}
            boxShadow="lg"
          >
            <VStack spacing={0} divider={<Box borderBottomWidth="1px" borderColor={isDark ? "gray.700" : "gray.200"} />}>
              <Text fontWeight="bold" p={4}>Wave Options</Text>
              <Button
                width="100%"
                py={6}
                variant="ghost"
                borderRadius="0"
                color="red.500"
                fontWeight="bold"
                leftIcon={<FiTrash2 />}
                onClick={handleDelete}
                justifyContent="flex-start"
                pl={6}
              >
                Delete Wave
              </Button>
              <Button
                width="100%"
                py={6}
                variant="ghost"
                borderRadius="0"
                onClick={onClose}
                justifyContent="center"
              >
                Cancel
              </Button>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Rating Modal */}
      <Modal 
        isOpen={showRatingModal} 
        onClose={() => setShowRatingModal(false)}
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent 
          bg={isDark ? "#1a1a1a" : "white"}
          boxShadow="xl"
          borderRadius="lg"
          maxW="400px"
        >
          <ModalHeader 
            borderBottom="1px solid" 
            borderColor={isDark ? "gray.700" : "gray.200"}
            pb={3}
          >
            {userRating ? 'Update Your Rating' : 'Rate This Wave'}
          </ModalHeader>
          <ModalCloseButton size="md" top="12px" />
          <ModalBody py={5}>
            <VStack spacing={4}>
              <Box textAlign="center" width="100%">
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                  {wave.title || 'Untitled Wave'}
                </Text>
                <Badge 
                  colorScheme={wave.waveType === 'community' ? "purple" : "blue"}
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {wave.waveType === 'community' ? 'Community Wave' : 'Personal Wave'}
                </Badge>
              </Box>
              
              <Divider />
              
              {renderRatingControl()}
              
              {userRating && (
                <Text 
                  fontSize="sm" 
                  color={isDark ? "gray.400" : "gray.600"}
                  fontStyle="italic"
                >
                  Your previous rating: {userRating}/{wave.communityRatingScale}
                </Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter 
            borderTop="1px solid" 
            borderColor={isDark ? "gray.700" : "gray.200"}
            pt={3}
          >
            <Flex width="100%" justify="space-between">
              <Box>
                {userRating && (
                  <Button
                    variant="ghost"
                    colorScheme="red"
                    onClick={handleRemoveRating}
                    leftIcon={<Icon as={FiX} />}
                    size="sm"
                    _hover={{ bg: isDark ? "red.900" : "red.50" }}
                  >
                    Remove Rating
                  </Button>
                )}
              </Box>
              <HStack spacing={2}>
                <Button
                  variant="outline"
                  onClick={() => setShowRatingModal(false)}
                  size="sm"
                >
                  Cancel
                </Button>
                {(!userRating || tempRating !== userRating) && (
                  <Button
                    colorScheme="yellow"
                    onClick={submitRating}
                    size="sm"
                    leftIcon={<Icon as={FiCheck} />}
                    _hover={{ transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                  >
                    {userRating ? 'Update Rating' : 'Submit Rating'}
                  </Button>
                )}
              </HStack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default WaveCard;