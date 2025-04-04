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
  SkeletonCircle
} from '@chakra-ui/react';
import {
  FiHeart,
  FiMessageSquare,
  FiEye,
  FiStar,
  FiMoreHorizontal,
  FiTrash2,
  FiSend
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
  const [authorData, setAuthorData] = useState(null);
  const [loadingAuthor, setLoadingAuthor] = useState(true);
  const cancelRef = useRef();
  const toast = useToast();
  const navigate = useNavigate();

  // Fetch author data when component mounts or wave.userId changes
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
            // Fallback to wave data if user doc doesn't exist
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
        // Set fallback data
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

  const isOwner = currentUser?.uid === wave.userId;
  const isLiked = Array.isArray(wave.likedBy) && wave.likedBy.includes(currentUser?.uid);

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
  const displayTimestamp = formatTimestamp(wave.createdAt);

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
      const waveRef = doc(db, 'waves', wave.id);
      await updateDoc(waveRef, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked
          ? arrayRemove(currentUser.uid)
          : arrayUnion(currentUser.uid)
      });
    } catch (error) {
      console.error('Error liking wave:', error);
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
      const comment = {
        id: Date.now().toString(),
        userId: currentUser.uid,
        username: currentUser.username || currentUser.email?.split('@')[0],
        displayName: currentUser.displayName || currentUser.email?.split('@')[0],
        profileImage: currentUser.profileImage || '/default-avatar.png',
        content: newComment,
        timestamp: new Date().toISOString()
      };

      const waveRef = doc(db, 'waves', wave.id);
      await updateDoc(waveRef, {
        comments: increment(1),
        commentsList: arrayUnion(comment)
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
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
    if (wave.userId) {
      navigate(`/profile/${wave.userId}`);
    }
  };

  const mediaContainerHeight = compactMode ? '200px' : '350px';

  return (
    <Box
      w="100%"
      bg={isDark ? 'gray.800' : 'white'}
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
            <MenuList bg={isDark ? 'gray.700' : 'white'} borderColor={isDark ? 'gray.600' : 'gray.200'}>
              <MenuItem
                icon={<FiTrash2 />}
                onClick={onOpen}
                color="red.400"
                _hover={{ bg: isDark ? 'red.900' : 'red.50' }}
                bg={isDark ? 'gray.700' : 'white'}
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
          bg={isDark ? 'black' : 'gray.100'}
          borderRadius="md"
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
            <Box
              as="video"
              src={wave.mediaUrls[0]}
              controls
              width="100%"
              height="100%"
              objectFit="contain"
            />
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
            leftIcon={<FiHeart fill={isLiked ? 'currentColor' : 'none'} />}
            onClick={handleLike}
            variant="ghost"
            size="sm"
            colorScheme={isLiked ? 'red' : 'gray'}
          >
            {wave.likes || 0}
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

          {wave.commentsList && wave.commentsList.length > 0 ? (
            [...wave.commentsList]
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((comment) => (
                <Flex key={comment.id} align="start">
                  <Avatar size="xs" src={comment.profileImage || '/default-avatar.png'} mr={2} />
                  <Box
                    bg={isDark ? 'whiteAlpha.100' : 'gray.50'}
                    p={2}
                    borderRadius="md"
                    flex={1}
                  >
                    <Text fontWeight="bold" fontSize="xs">
                      {comment.displayName || 'User'}
                    </Text>
                    <Text fontSize="xs" whiteSpace="pre-wrap">
                      {comment.content}
                    </Text>
                  </Box>
                </Flex>
              ))
          ) : (
            <Text fontSize="xs" color="gray.500" textAlign="center" pt={2}>
              No comments yet.
            </Text>
          )}
        </VStack>
      </Collapse>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent bg={isDark ? 'gray.800' : 'white'}>
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