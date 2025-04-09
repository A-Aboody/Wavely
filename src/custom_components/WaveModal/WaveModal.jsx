import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Flex,
    Box,
    Image,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Divider,
    Avatar,
    useColorMode,
    useToast,
    Icon,
    Collapse,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Skeleton,
    SkeletonCircle,
    Tag,
    Badge,
    Stack
  } from '@chakra-ui/react';
  import { 
    FiHeart, 
    FiMessageCircle, 
    FiMusic, 
    FiSend, 
    FiTrash2,
    FiVideo,
    FiMoreHorizontal,
    FiChevronUp,
    FiChevronDown,
    FiStar
  } from 'react-icons/fi';
  import { useUser } from '../../context/UserContext';
  import { useWaves } from '../../context/WaveContext';
  import { useState, useEffect, useRef } from 'react';
  import { doc, getDoc } from 'firebase/firestore';
  import { db } from '../../Firebase/firebase';
  import { useNavigate } from 'react-router-dom';
  
  const WaveModal = ({ wave: initialWave, isOpen, onClose, onDeleteSuccess }) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    const { currentUser } = useUser();
    const { likeWave, addComment, deleteWave, updateWave } = useWaves();
    const toast = useToast();
    const navigate = useNavigate();
    
    const [wave, setWave] = useState(initialWave);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [expandedComments, setExpandedComments] = useState(new Set());
    const [commentUserData, setCommentUserData] = useState({});
    const [loadingCommentUsers, setLoadingCommentUsers] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const cancelRef = useRef();
    
    // Update local wave state when the prop changes
    useEffect(() => {
      setWave(initialWave);
      if (initialWave?.commentsList) {
        fetchCommentUsersData(initialWave.commentsList);
      }
    }, [initialWave]);
  
    const fetchCommentUsersData = async (commentsList) => {
      if (!commentsList || commentsList.length === 0) return;
      
      try {
        setLoadingCommentUsers(true);
        const userData = {};
        const uniqueUserIds = [...new Set(commentsList.map(comment => comment.userId))];
        
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
        toast({
          title: 'Error',
          description: 'Could not load commenter information',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingCommentUsers(false);
      }
    };
  
    const formatTimestamp = (dateString) => {
      if (!dateString) return 'Just now';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
  
        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
      } catch (e) {
        console.error("Error formatting timestamp:", e);
        return 'Invalid date';
      }
    };
  
    const handleLike = async (waveId) => {
      if (!currentUser) {
        toast({ title: "Login required to like waves", status: "warning", duration: 3000, isClosable: true });
        return;
      }
      
      try {
        // Optimistic update
        const likedBy = [...(wave.likedBy || [])];
        const userIndex = likedBy.indexOf(currentUser.uid);
        let newLikes = wave.likes || 0;
        
        if (userIndex === -1) {
          likedBy.push(currentUser.uid);
          newLikes += 1;
        } else {
          likedBy.splice(userIndex, 1);
          newLikes = Math.max(0, newLikes - 1);
        }
        
        setWave(prev => ({
          ...prev,
          likedBy,
          likes: newLikes
        }));
        
        // Pass both waveId and userId to likeWave
        await likeWave(waveId, currentUser.uid);
      } catch (error) {
        console.error("Error liking wave:", error);
        // Rollback
        setWave(prev => ({
          ...prev,
          likedBy: wave.likedBy,
          likes: wave.likes
        }));
        toast({ 
          title: "Error", 
          description: "Could not update like status", 
          status: "error", 
          duration: 3000 
        });
      }
    };
  
    const handleLikeComment = async (commentId) => {
      if (!currentUser) {
        toast({ title: "Login required to like comments", status: "warning", duration: 3000, isClosable: true });
        return;
      }
      
      try {
        // Find the comment
        const comment = wave.commentsList.find(c => c.id === commentId);
        if (!comment) return;
    
        // Determine current like status
        const currentLikes = comment.likes || [];
        const isLiked = currentLikes.includes(currentUser.uid);
    
        // Create updated comments list
        const updatedCommentsList = wave.commentsList.map(c => {
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
        
        // Optimistic update
        setWave(prev => ({
          ...prev,
          commentsList: updatedCommentsList
        }));
    
        // Firestore update
        await updateWave(wave.id, {
          commentsList: updatedCommentsList
        });
      } catch (error) {
        console.error("Error updating comment like:", error);
        toast({ 
          title: "Error updating comment like", 
          status: "error", 
          duration: 3000 
        });
        // Rollback
        setWave(prev => ({
          ...prev,
          commentsList: wave.commentsList
        }));
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
  
    const handleAddComment = async () => {
      if (!newComment.trim() || !wave || !currentUser) {
        if (!currentUser) toast({ title: "Login required to comment", status: "warning", duration: 3000, isClosable: true });
        return;
      }
  
      const commentData = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        userId: currentUser.uid,
        username: currentUser.username,
        displayName: currentUser.displayName,
        profileImage: currentUser.profileImage,
        content: newComment,
        timestamp: new Date().toISOString(),
        likes: [],
        parentCommentId: null
      };
  
      try {
        // Optimistic update
        const updatedCommentsList = [...(wave.commentsList || []), commentData];
        setWave(prev => ({
          ...prev,
          commentsList: updatedCommentsList,
          comments: updatedCommentsList.length
        }));
        
        setNewComment('');
        
        // Firestore update
        await addComment(wave.id, commentData);
        
        // Fetch user data for the new comment
        fetchCommentUsersData(updatedCommentsList);
        
        toast({ title: "Comment added", status: "success", duration: 2000 });
      } catch (error) {
        console.error("Error adding comment:", error);
        // Rollback
        setWave(prev => ({
          ...prev,
          commentsList: wave.commentsList,
          comments: wave.commentsList?.length || 0
        }));
        toast({ 
          title: "Error adding comment", 
          description: error.message, 
          status: "error", 
          duration: 3000, 
          isClosable: true 
        });
      }
    };
  
    const handleAddReply = async (parentCommentId) => {
      if (!replyText.trim() || !wave || !currentUser) {
        if (!currentUser) toast({ title: "Login required to reply", status: "warning", duration: 3000, isClosable: true });
        return;
      }
  
      const replyData = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        userId: currentUser.uid,
        username: currentUser.username,
        displayName: currentUser.displayName,
        profileImage: currentUser.profileImage,
        content: replyText,
        timestamp: new Date().toISOString(),
        likes: [],
        parentCommentId
      };
  
      try {
        // Optimistic update
        const updatedCommentsList = [...(wave.commentsList || []), replyData];
        setWave(prev => ({
          ...prev,
          commentsList: updatedCommentsList,
          comments: updatedCommentsList.length
        }));
        
        setReplyText('');
        setReplyingTo(null);
        
        // Firestore update
        await addComment(wave.id, replyData);
        
        // Fetch user data for the new reply
        fetchCommentUsersData(updatedCommentsList);
        
        toast({ title: "Reply added", status: "success", duration: 2000 });
      } catch (error) {
        console.error("Error adding reply:", error);
        // Rollback
        setWave(prev => ({
          ...prev,
          commentsList: wave.commentsList,
          comments: wave.commentsList?.length || 0
        }));
        toast({ 
          title: "Error adding reply", 
          description: error.message, 
          status: "error", 
          duration: 3000, 
          isClosable: true 
        });
      }
    };
  
    const handleDeleteComment = async (commentId) => {
      if (!currentUser) return;
      
      try {
        // Check if user owns the comment or is the wave owner
        const comment = wave.commentsList.find(c => c.id === commentId);
        if (!comment || (comment.userId !== currentUser.uid && wave.userId !== currentUser.uid)) return;
  
        // Optimistic update
        const updatedCommentsList = wave.commentsList.filter(c => c.id !== commentId);
        setWave(prev => ({
          ...prev,
          commentsList: updatedCommentsList,
          comments: updatedCommentsList.length
        }));
  
        // Firestore update
        await updateWave(wave.id, {
          commentsList: updatedCommentsList,
          comments: updatedCommentsList.length
        });
        
        toast({ title: "Comment deleted", status: "info", duration: 2000 });
      } catch (error) {
        console.error("Error deleting comment:", error);
        // Rollback
        setWave(prev => ({
          ...prev,
          commentsList: wave.commentsList,
          comments: wave.commentsList?.length || 0
        }));
        toast({ 
          title: "Error deleting comment", 
          status: "error", 
          duration: 3000 
        });
      }
    };
  
    const handleDeleteWave = async () => {
      try {
        await deleteWave(wave.id);
        setIsDeleteAlertOpen(false);
        onClose();
        if (onDeleteSuccess) onDeleteSuccess();
        toast({ title: "Wave deleted", status: "info", duration: 2000 });
      } catch (error) {
        toast({ title: "Error deleting wave", status: "error", duration: 3000 });
      }
    };
  
    const navigateToProfile = (userId) => {
      if (userId) {
        const targetUser = commentUserData[userId];
        onClose();
        // Navigate to the user's profile using their username
        if (targetUser?.username) {
          navigate(`/profile/${targetUser.username}`);
        } else if (userId === wave.userId) {
          // If clicking the wave owner's profile
          navigate(`/profile/${wave.username}`);
        } else {
          // Fallback message if username is not found
          toast({
            title: "Error",
            description: "Could not navigate to profile",
            status: "error",
            duration: 3000,
            isClosable: true
          });
        }
      }
    };
  
    if (!wave) return null;
  
    const isOwner = currentUser?.uid === wave.userId;
    const hasComments = wave.commentsList && wave.commentsList.length > 0;
    const parentComments = hasComments 
      ? wave.commentsList.filter(comment => !comment.parentCommentId)
      : [];
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "4xl", lg: "6xl" }}>
        <ModalOverlay />
        <ModalContent bg={isDark ? '#121212' : 'white'} maxH={{ base: "100vh", md: "90vh" }} h={{ md: "90vh" }}>
          <ModalHeader borderBottomWidth="1px" borderColor={isDark ? 'gray.700' : 'gray.200'}>
            <Flex justify="space-between" align="center">
              <HStack>
                <Avatar 
                  src={wave.profileImage} 
                  name={wave.displayName} 
                  size="md" 
                  mr={2} 
                  cursor="pointer"
                  onClick={() => navigateToProfile(wave.userId)}
                />
                <Box>
                  <Text 
                    fontWeight="bold" 
                    cursor="pointer"
                    onClick={() => navigateToProfile(wave.userId)}
                  >
                    {wave.displayName}
                  </Text>
                  <Flex align="center" fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>
                    <Text>@{wave.username}</Text>
                    <Text mx={1}>•</Text>
                    <Text>{formatTimestamp(wave.timestamp)}</Text>
                </Flex>
                </Box>
              </HStack>
              
              {isOwner && (
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreHorizontal />}
                    variant="ghost"
                    aria-label="Options"
                    size="sm"
                  />
                  <MenuList bg={isDark ? 'gray.700' : 'white'} borderColor={isDark ? 'gray.600' : 'gray.200'}>
                    <MenuItem
                      icon={<FiTrash2 />}
                      onClick={() => setIsDeleteAlertOpen(true)}
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
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0} overflow="hidden">
            <Flex direction={{ base: 'column', lg: 'row' }} h="100%" overflow="hidden">
              {/* Media Column */}
              <Flex
                flex={{ base: "none", lg: 2 }}
                direction="column"
                p={{ base: 2, md: 4 }}
                bg={isDark ? 'gray.900' : 'gray.50'}
                h={{ base: "auto", lg: "100%" }}
                overflow="hidden"
                position="relative"
              >
                <Box flex={1} display="flex" justifyContent="center" alignItems="center" mb={4}>
                  {wave.mediaType === 'image' && wave.mediaUrls?.[0] && (
                    <Image
                      src={wave.mediaUrls[0]}
                      alt={wave.title || 'Wave Image'}
                      maxW="100%"
                      maxH="100%"
                      objectFit="contain"
                      fallbackSrc='/placeholder-image.jpg'
                      borderRadius="md"
                    />
                  )}
                  {wave.mediaType === 'video' && wave.mediaUrls?.[0] && (
                    <Box 
                      as="video" 
                      src={wave.mediaUrls[0]} 
                      controls 
                      width="100%" 
                      maxH="100%" 
                      objectFit="contain" 
                      poster={wave.thumbnailUrl}
                      borderRadius="md"
                    />
                  )}
                  {wave.mediaType === 'audio' && wave.mediaUrls?.[0] && (
                    <VStack spacing={4} p={{ base: 4, md: 6 }} width="100%" justify="center">
                      <Icon as={FiMusic} boxSize={16} color={isDark ? 'blue.300' : 'blue.500'} />
                      <Text fontWeight="bold" textAlign="center">{wave.title}</Text>
                      <Box as="audio" src={wave.mediaUrls[0]} controls width="100%" />
                    </VStack>
                  )}
                  {(!wave.mediaUrls || wave.mediaUrls.length === 0) && !['image', 'video', 'audio'].includes(wave.mediaType) && (
                    <Box p={{ base: 4, md: 10 }} overflowY="auto" maxH="100%">
                      <Heading size="lg" mb={3}>{wave.title || "Untitled Wave"}</Heading>
                      <Text whiteSpace="pre-wrap" fontSize="md">{wave.content || "No description."}</Text>
                    </Box>
                  )}
                </Box>
  
                {/* Rating and Info Section */}
                <VStack 
                  spacing={3} 
                  p={4} 
                  bg={isDark ? '#121212' : 'gray.100'} 
                  borderRadius="md"
                  align="stretch"
                >
                  <Heading size="md">Wave Details</Heading>
                  
                  {typeof wave.rating === 'number' && (
                    <HStack spacing={2} align="center">
                      <Badge 
                        colorScheme="yellow" 
                        fontSize="lg" 
                        px={3} 
                        py={1} 
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                      >
                        <Icon as={FiStar} mr={1} />
                        {wave.rating.toFixed(1)}/5.0
                      </Badge>
                      <Text fontSize="sm" color={isDark ? "gray.300" : "gray.600"}>
                        Rating
                      </Text>
                    </HStack>
                  )}
                  
                  {wave.category && (
                    <HStack spacing={2} align="center">
                      <Badge 
                        colorScheme="blue" 
                        fontSize="sm" 
                        px={2} 
                        py={1} 
                        borderRadius="md"
                      >
                        {wave.category}
                      </Badge>
                      <Text fontSize="sm" color={isDark ? "gray.300" : "gray.600"}>
                        Category
                      </Text>
                    </HStack>
                  )}
                  
                  <HStack spacing={4} mt={2}>
                    <Button
                      leftIcon={<Icon as={FiHeart} fill={wave.likedBy?.includes(currentUser?.uid) ? 'currentColor' : 'none'} />}
                      onClick={() => handleLike(wave.id)}
                      variant={wave.likedBy?.includes(currentUser?.uid) ? 'solid' : 'outline'}
                      colorScheme={wave.likedBy?.includes(currentUser?.uid) ? 'red' : 'gray'}
                      size="sm"
                    >
                      {wave.likes || 0} Likes
                    </Button>
                    <Button
                      leftIcon={<FiMessageCircle />}
                      variant="outline"
                      colorScheme="gray"
                      size="sm"
                    >
                      {wave.comments || 0} Comments
                    </Button>
                  </HStack>
                </VStack>
              </Flex>
  
              {/* Details & Comments Column */}
              <Flex
                flex={{ base: 1, lg: 1 }}
                flexDirection="column"
                h={{ base: "calc(70vh - 60px)", lg: "100%" }}
                borderLeftWidth={{ base: 0, lg: "1px" }}
                borderColor={isDark ? 'gray.700' : 'gray.200'}
              >
                {/* Fixed content area */}
                <Box p={{ base: 4, md: 6 }} borderBottomWidth="1px" borderColor={isDark ? 'gray.700' : 'gray.200'}>
                  <Heading size="lg" mb={3}>{wave.title || "Untitled Wave"}</Heading>
                  <Text whiteSpace="pre-wrap" mb={4}>{wave.content || "No description."}</Text>
                  
                  <Divider my={4} />
                  
                  <Heading size="md" mb={4}>Comments ({wave.comments || 0})</Heading>
  
                  {currentUser && (
                    <InputGroup mb={4}>
                      <Input
                        placeholder="Add a public comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                        pr="4.5rem"
                        bg={isDark ? 'gray.700' : 'white'}
                      />
                      <InputRightElement width="4.5rem">
                        <IconButton
                          h="1.75rem"
                          size="sm"
                          icon={<Icon as={FiSend} />}
                          aria-label="Send comment"
                          onClick={handleAddComment}
                          isDisabled={!newComment.trim()}
                          colorScheme='blue'
                        />
                      </InputRightElement>
                    </InputGroup>
                  )}
                  {!currentUser && (
                    <Text fontSize="sm" color="gray.500" mb={4}>Log in to add a comment.</Text>
                  )}
                </Box>
  
                {/* Scrollable comments area */}
                <Box 
                  flex="1" 
                  overflowY="auto" 
                  p={{ base: 4, md: 6 }}
                  pt={0}
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
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
  
                  {!loadingCommentUsers && hasComments ? (
                    <VStack align="stretch" spacing={4}>
                      {parentComments
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map((comment) => {
                          const userData = commentUserData[comment.userId] || {};
                          const displayName = userData.displayName || comment.displayName || 'User';
                          const profileImage = userData.profileImage || comment.profileImage || '/default-avatar.png';
                          const username = userData.username || comment.username || 'user';
                          const isCommentOwner = currentUser?.uid === comment.userId;
                          const isCommentLiked = comment.likes?.includes(currentUser?.uid);
                          const replies = wave.commentsList.filter(c => c.parentCommentId === comment.id);
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
                                  size="sm" 
                                  src={profileImage} 
                                  mr={2} 
                                  cursor="pointer" 
                                  onClick={() => navigateToProfile(comment.userId)}
                                />
                                <Box flex={1}>
                                  {/* Comment Header */}
                                  <Flex alignItems="center" justifyContent="space-between">
                                    <Flex alignItems="center" flex={1}>
                                      <Text 
                                        fontWeight="bold" 
                                        fontSize="sm" 
                                        cursor="pointer" 
                                        onClick={() => navigateToProfile(comment.userId)}
                                      >
                                        {displayName}
                                      </Text>
                                      <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} ml={1}>
                                        @{username}
                                      </Text>
                                      <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} ml={2}>
                                        {formatTimestamp(comment.timestamp)}
                                      </Text>
                                    </Flex>
                                    {(isCommentOwner || isOwner) && (
                                      <IconButton
                                        icon={<FiTrash2 />}
                                        aria-label="Delete comment"
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="red"
                                        onClick={() => handleDeleteComment(comment.id)}
                                      />
                                    )}
                                  </Flex>
  
                                  {/* Comment Content */}
                                  <Text fontSize="sm" whiteSpace="pre-wrap" mt={1}>
                                    {comment.content}
                                  </Text>
  
                                  {/* Comment Actions */}
                                  <HStack mt={2} spacing={4}>
                                    <Button
                                      leftIcon={<Icon as={FiHeart} fill={isCommentLiked ? 'currentColor' : 'none'} />}
                                      onClick={() => handleLikeComment(comment.id)}
                                      variant={isCommentLiked ? 'solid' : 'ghost'}
                                      size="xs"
                                      colorScheme={isCommentLiked ? 'red' : 'gray'}
                                    >
                                      {comment.likes?.length || 0}
                                    </Button>
                                    <Button
                                      leftIcon={<FiMessageCircle />}
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
                                        size="sm"
                                        mr={2}
                                        bg={isDark ? 'gray.700' : 'white'}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') handleAddReply(comment.id);
                                        }}
                                      />
                                      <IconButton
                                        icon={<FiSend />}
                                        aria-label="Send reply"
                                        onClick={() => handleAddReply(comment.id)}
                                        isDisabled={!replyText.trim()}
                                        colorScheme="blue"
                                        size="sm"
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
                                              borderLeftColor={isDark ? 'gray.600' : 'gray.200'}
                                              _hover={{
                                                bg: isDark ? 'whiteAlpha.50' : 'gray.50',
                                                borderRadius: 'md'
                                              }}
                                            >
                                              <Avatar 
                                                size="sm" 
                                                src={replyProfileImage} 
                                                mr={2} 
                                                cursor="pointer" 
                                                onClick={() => navigateToProfile(reply.userId)}
                                              />
                                              <Box flex={1}>
                                                <Flex alignItems="center" justifyContent="space-between">
                                                  <Flex alignItems="center" flex={1}>
                                                    <Text 
                                                      fontWeight="bold" 
                                                      fontSize="sm" 
                                                      cursor="pointer" 
                                                      onClick={() => navigateToProfile(reply.userId)}
                                                    >
                                                      {replyDisplayName}
                                                    </Text>
                                                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} ml={1}>
                                                      @{replyUsername}
                                                    </Text>
                                                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} ml={2}>
                                                      {formatTimestamp(reply.timestamp)}
                                                    </Text>
                                                  </Flex>
                                                  {(isReplyOwner || isOwner) && (
                                                    <IconButton
                                                      icon={<FiTrash2 />}
                                                      aria-label="Delete reply"
                                                      size="xs"
                                                      variant="ghost"
                                                      colorScheme="red"
                                                      onClick={() => handleDeleteComment(reply.id)}
                                                    />
                                                  )}
                                                </Flex>
                                                <Text fontSize="sm" whiteSpace="pre-wrap" mt={1}>
                                                  {reply.content}
                                                </Text>
                                                <Button
                                                  leftIcon={<Icon as={FiHeart} fill={isReplyLiked ? 'currentColor' : 'none'} />}
                                                  onClick={() => handleLikeComment(reply.id)}
                                                  variant={isReplyLiked ? 'solid' : 'ghost'}
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
                        })}
                    </VStack>
                  ) : (
                    !loadingCommentUsers && (
                      <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>
                        No comments yet.
                      </Text>
                    )
                  )}
                </Box>
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
  
        {/* Delete Confirmation Dialog */}
        <AlertDialog 
          isOpen={isDeleteAlertOpen} 
          leastDestructiveRef={cancelRef} 
          onClose={() => setIsDeleteAlertOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent bg={isDark ? 'gray.800' : 'white'}>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Wave
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete this wave? This action cannot be undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)} variant="ghost">
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteWave} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Modal>
    );
  };
  
  export default WaveModal;