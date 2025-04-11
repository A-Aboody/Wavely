import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Avatar,
  Text,
  IconButton,
  Button,
  Input,
  VStack,
  HStack,
  Icon,
  Collapse,
  useColorMode,
  Skeleton,
  SkeletonCircle,
  useToast
} from '@chakra-ui/react';
import {
  FiHeart,
  FiMessageSquare,
  FiTrash,
  FiSend,
  FiChevronUp,
  FiChevronDown
} from 'react-icons/fi';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../Firebase/firebase';

const CommentItem = ({
  comment,
  currentUser,
  isOwner,
  onLike,
  onDelete,
  onReply,
  replies = [],
  navigateToCommenterProfile,
  formatTimestamp,
  waveId,
  parentCommentId = null,
}) => {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [localReplies, setLocalReplies] = useState(replies);
  const isParentComment = !parentCommentId;

  if (!waveId) {
    console.error('CommentItem: waveId prop is required');
    return (
      <Box p={2} bg={isDark ? 'red.900' : 'red.50'} borderRadius="md">
        <Text fontSize="xs" color="red.500">
          Error: Could not load comment
        </Text>
      </Box>
    );
  }

  useEffect(() => {
    setLocalReplies(replies);
  }, [replies]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (comment.userId) {
          const userRef = doc(db, 'users', comment.userId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            setUserData({
              displayName: comment.displayName,
              profileImage: comment.profileImage
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({
          displayName: comment.displayName,
          profileImage: comment.profileImage
        });
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, [comment.userId, comment.displayName, comment.profileImage]);

  const displayName = userData?.displayName || comment.displayName || 'User';
  const profileImage = userData?.profileImage || comment.profileImage || '/default-avatar.png';
  const isCommentOwner = currentUser?.uid === comment.userId;
  const isCommentLiked = comment.likes?.includes(currentUser?.uid);

  const handleCommentLike = async (commentId) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to like comments",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    
    try {
      const waveRef = doc(db, 'waves', waveId);
      const waveSnap = await getDoc(waveRef);
      
      if (!waveSnap.exists()) {
        throw new Error("Wave not found");
      }
      
      const waveData = waveSnap.data();
      let commentsList = waveData.commentsList || [];
      
      if (isParentComment) {
        // Liking a parent comment
        const commentIndex = commentsList.findIndex(c => c.id === commentId);
        if (commentIndex === -1) return;
        
        const targetComment = commentsList[commentIndex];
        const likes = Array.isArray(targetComment.likes) ? targetComment.likes : [];
        const userIndex = likes.indexOf(currentUser.uid);
        
        if (userIndex === -1) {
          // Like the comment
          commentsList[commentIndex] = {
            ...targetComment,
            likes: [...likes, currentUser.uid]
          };
        } else {
          // Unlike the comment
          const newLikes = [...likes];
          newLikes.splice(userIndex, 1);
          commentsList[commentIndex] = {
            ...targetComment,
            likes: newLikes
          };
        }
      } else {
        // Liking a reply
        const parentCommentIndex = commentsList.findIndex(c => c.id === parentCommentId);
        if (parentCommentIndex === -1) return;
        
        const parentComment = commentsList[parentCommentIndex];
        if (!Array.isArray(parentComment.replies)) return;
        
        const replyIndex = parentComment.replies.findIndex(r => r.id === commentId);
        if (replyIndex === -1) return;
        
        const targetReply = parentComment.replies[replyIndex];
        const likes = Array.isArray(targetReply.likes) ? targetReply.likes : [];
        const userIndex = likes.indexOf(currentUser.uid);
        
        const updatedReplies = [...parentComment.replies];
        
        if (userIndex === -1) {
          // Like the reply
          updatedReplies[replyIndex] = {
            ...targetReply,
            likes: [...likes, currentUser.uid]
          };
        } else {
          // Unlike the reply
          const newLikes = [...likes];
          newLikes.splice(userIndex, 1);
          updatedReplies[replyIndex] = {
            ...targetReply,
            likes: newLikes
          };
        }
        
        commentsList[parentCommentIndex] = {
          ...parentComment,
          replies: updatedReplies
        };
      }
      
      // Update the database
      await updateDoc(waveRef, {
        commentsList: commentsList
      });
      
      // Call the parent onLike handler
      if (onLike) {
        onLike(commentId);
      }
      
    } catch (error) {
      console.error('Error liking comment:', error);
      toast({
        title: "Error",
        description: "Could not update like status",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !currentUser || !waveId) {
      toast({
        title: "Error",
        description: "Please sign in and write a reply",
        status: "error",
        duration: 3000,
      });
      return;
    }
  
    try {
      const waveRef = doc(db, 'waves', waveId);
      const waveSnap = await getDoc(waveRef);
      
      if (!waveSnap.exists()) {
        throw new Error("Wave not found");
      }
      
      const waveData = waveSnap.data();
      const commentsList = waveData.commentsList || [];
      
      // Find the parent comment
      const parentCommentIndex = commentsList.findIndex(c => c.id === comment.id);
      
      if (parentCommentIndex === -1) {
        throw new Error("Parent comment not found");
      }
      
      // Create new reply object
      const newReply = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'User',
        profileImage: currentUser.photoURL || '/default-avatar.png',
        content: replyText,
        timestamp: new Date().toISOString(),
        likes: [],
        parentCommentId: comment.id,
        isReply: true // Add this flag to identify replies
      };
      
      // Update the comment with the new reply
      const updatedComment = {
        ...commentsList[parentCommentIndex],
        replies: [...(commentsList[parentCommentIndex].replies || []), newReply]
      };
      
      // Replace the comment in the list
      const updatedCommentsList = [...commentsList];
      updatedCommentsList[parentCommentIndex] = updatedComment;
      
      // Update the database with new reply but don't increment total comment count
      // The total count will be calculated from commentsList structure
      await updateDoc(waveRef, {
        commentsList: updatedCommentsList,
        // Remove any explicit comments count update
      });
      
      // Update local state
      setLocalReplies([...localReplies, newReply]);
      setReplyText('');
      setIsReplying(false);
      setIsExpanded(true);
      
      // Notify parent component about the new reply
      if (onReply) {
        onReply(comment.id, newReply);
      }
  
      toast({
        title: "Reply added",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: error.message || "Could not add reply",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const waveRef = doc(db, 'waves', waveId);
      const waveSnap = await getDoc(waveRef);
      
      if (!waveSnap.exists()) {
        throw new Error("Wave not found");
      }
      
      const waveData = waveSnap.data();
      let commentsList = waveData.commentsList || [];
      let deletedCount = 0;
      
      if (isParentComment && comment.id === commentId) {
        // Deleting a parent comment (and all its replies)
        const commentToDelete = commentsList.find(c => c.id === commentId);
        if (!commentToDelete) return;
        
        // Count the parent + all replies
        deletedCount = 1 + (Array.isArray(commentToDelete.replies) ? commentToDelete.replies.length : 0);
        
        // Remove the parent comment
        commentsList = commentsList.filter(c => c.id !== commentId);
      } else {
        // Deleting a reply
        const parentCommentIndex = commentsList.findIndex(c => c.id === parentCommentId);
        if (parentCommentIndex === -1) return;
        
        const parentComment = commentsList[parentCommentIndex];
        if (!Array.isArray(parentComment.replies)) return;
        
        // Remove the reply
        const updatedReplies = parentComment.replies.filter(r => r.id !== commentId);
        
        // Update the parent comment
        commentsList[parentCommentIndex] = {
          ...parentComment,
          replies: updatedReplies
        };
        
        deletedCount = 1;
      }
      
      // Update the database
      await updateDoc(waveRef, {
        commentsList: commentsList,
        // Decrement the comment count by the number of deleted items
        comments: Math.max((waveData.comments || 0) - deletedCount, 0)
      });
      
      // Update local state
      if (isParentComment && comment.id === commentId) {
        onDelete(commentId);
      } else {
        setLocalReplies(prev => prev.filter(reply => reply.id !== commentId));
      }
      
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

  return (
    <VStack align="stretch" spacing={2}>
      <Flex 
        align="start"
        p={2}
        _hover={{
          bg: isDark ? 'whiteAlpha.50' : 'gray.100',
          borderRadius: 'md'
        }}
      >
        {loadingUser ? (
          <SkeletonCircle size="8" mr={2} />
        ) : (
          <Avatar 
            size="xs" 
            src={profileImage} 
            mr={2} 
            cursor="pointer" 
            onClick={(e) => navigateToCommenterProfile(e, comment.userId)}
          />
        )}
        <Box flex={1} width="full">
          <Flex alignItems="center" justifyContent="space-between" width="full">
            <Box flex={1} overflow="hidden">
              {loadingUser ? (
                <Skeleton height="16px" width="120px" mr={2} />
              ) : (
                <Flex align="center">
                  <Text 
                    fontWeight="bold" 
                    fontSize="xs" 
                    cursor="pointer" 
                    isTruncated
                    onClick={(e) => navigateToCommenterProfile(e, comment.userId)}
                  >
                    {displayName}
                  </Text>
                  <Text fontSize="xs" color="gray.500" ml={2} noOfLines={1}>
                    {formatTimestamp(comment.timestamp)}
                  </Text>
                </Flex>
              )}
            </Box>
            {(isCommentOwner || isOwner) && (
              <IconButton
                icon={<FiTrash />}
                aria-label="Delete comment"
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={() => handleDelete(comment.id)}
                minWidth="auto"
              />
            )}
          </Flex>

          <Text fontSize="xs" whiteSpace="pre-wrap" mt={1} overflowWrap="break-word" wordBreak="break-word">
            {typeof comment.content === 'string' ? comment.content : ''}
          </Text>

          <HStack mt={2} spacing={3} overflow="hidden">
            <Button
              leftIcon={<FiHeart fill={isCommentLiked ? 'currentColor' : 'none'} />}
              onClick={() => handleCommentLike(comment.id)}
              variant="ghost"
              size="xs"
              colorScheme={isCommentLiked ? 'red' : 'gray'}
              minWidth="auto"
            >
              {Array.isArray(comment.likes) ? comment.likes.length : 0}
            </Button>
            {isParentComment && (
              <Button
                leftIcon={<FiMessageSquare />}
                onClick={() => setIsReplying(!isReplying)}
                variant="ghost"
                size="xs"
                colorScheme={isReplying ? 'blue' : 'gray'}
                minWidth="auto"
              >
                Reply
              </Button>
            )}
            {localReplies?.length > 0 && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                rightIcon={
                  <Icon 
                    as={isExpanded ? FiChevronUp : FiChevronDown} 
                    transition="transform 0.2s"
                  />
                }
                minWidth="auto"
              >
                {localReplies.length} {localReplies.length === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </HStack>

          {isReplying && (
            <Flex mt={2}>
              <Input
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                size="xs"
                mr={2}
                bg={isDark ? 'gray.700' : 'white'}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleReplySubmit();
                }}
              />
              <IconButton
                icon={<FiSend />}
                aria-label="Send Reply"
                onClick={handleReplySubmit}
                isDisabled={!replyText.trim()}
                colorScheme="blue"
                size="xs"
                minWidth="auto"
              />
            </Flex>
          )}

          <Collapse in={isExpanded}>
            <VStack mt={2} pl={4} spacing={2} align="stretch">
              {Array.isArray(localReplies) && localReplies.map(reply => {
                if (!reply?.id) return null;
                
                const replyKey = `${waveId}_${comment.id}_${reply.id}`;
                
                return (
                  <CommentItem
                    key={replyKey}
                    comment={reply}
                    currentUser={currentUser}
                    isOwner={isOwner}
                    onLike={onLike}
                    onDelete={handleDelete}
                    onReply={onReply}
                    waveId={waveId}
                    parentCommentId={comment.id}
                    navigateToCommenterProfile={navigateToCommenterProfile}
                    formatTimestamp={formatTimestamp}
                    replies={[]}
                  />
                );
              })}
            </VStack>
          </Collapse>
        </Box>
      </Flex>
    </VStack>
  );
};

export default CommentItem;