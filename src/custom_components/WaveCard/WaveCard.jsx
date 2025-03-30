import React, { useState, useRef } from 'react';
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
  AspectRatio
} from '@chakra-ui/react';
import { 
  FiHeart, 
  FiMessageSquare, 
  FiShare2, 
  FiEye, 
  FiStar, 
  FiMoreHorizontal, 
  FiTrash2,
  FiSend
} from 'react-icons/fi';
import { useWaves } from '../../context/WaveContext';

const WaveCard = ({ wave, currentUser, compactMode = false }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const { likeWave, deleteWave, addComment } = useWaves();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const cancelRef = useRef();

  const profileData = JSON.parse(localStorage.getItem('profileData')) || {
    username: 'DefaultUser',
    displayName: 'Default User',
    profileImage: '/api/placeholder/200/200'
  };

  const handleLike = () => likeWave(wave.id);
  const handleDelete = () => { deleteWave(wave.id); onClose(); };

  const handleComment = () => {
    if (newComment.trim()) {
      addComment(wave.id, {
        id: Date.now(),
        username: profileData.username,
        displayName: profileData.displayName,
        profileImage: profileData.profileImage,
        content: newComment,
        timestamp: new Date().toISOString()
      });
      setNewComment('');
    }
  };

  const isOwner = profileData.username === wave.username;

  // Media container dimensions
  const mediaContainerHeight = compactMode ? '250px' : '350px';

  return (
    <Box
      w="100%"
      bg={isDark ? '#1a1a1a' : 'white'}
      borderRadius="lg"
      p={compactMode ? 2 : 3}
      mb={4}
      boxShadow={compactMode ? 'sm' : 'md'}
      borderWidth="1px"
      borderColor={isDark ? 'gray.700' : 'gray.200'}
      overflow="hidden"
    >
      {/* User Info Header */}
      <Flex align="center" mb={2} justify="space-between" px={1}>
        <Flex align="center">
          <Avatar 
            src={wave.profileImage} 
            name={wave.displayName} 
            size={compactMode ? 'sm' : 'md'}
            mr={2}
          />
          <Box>
            <Text fontWeight="bold" fontSize={compactMode ? 'sm' : 'md'}>
              {wave.displayName}
            </Text>
            <Text fontSize="xs" color="gray.500">
              @{wave.username} · {wave.timestamp}
            </Text>
          </Box>
        </Flex>
        
        {isOwner && (
            <Menu>
                <MenuButton
                    as={IconButton}
                    icon={<FiMoreHorizontal />}
                    variant="ghost"
                    aria-label="Options"
                    size="xs"
                />
                <MenuList bg={isDark ? '#121212' : 'white'} borderColor={isDark ? 'gray.700' : 'gray.200'}>
                    <MenuItem 
                    icon={<FiTrash2 />} 
                    onClick={onOpen} 
                    color="red.500"
                    _hover={{ bg: isDark ? '#1a1a1a' : 'gray.100' }}
                    bg={isDark ? '#121212' : 'white'}
                    >
                    Delete Wave
                    </MenuItem>
                </MenuList>
            </Menu>
        )}
      </Flex>
      
      {/* Title and Content */}
      {wave.title && (
        <Heading size="sm" mb={1} px={1}>
          {wave.title}
        </Heading>
      )}
      {wave.content && (
        <Text 
          mb={2} 
          fontSize="sm"
          px={1}
          noOfLines={compactMode ? 2 : 3}
        >
          {wave.content}
        </Text>
      )}
      
      {/* Media Content - Consistent sizing with proper formatting */}
      <Box 
        width="100%" 
        height={mediaContainerHeight}
        mb={2}
        position="relative"
        overflow="hidden"
        bg={isDark ? 'gray.800' : 'gray.100'}
      >
        {wave.mediaType === 'image' && (
          <Image 
            src={wave.image} 
            alt={wave.title || 'Wave image'}
            width="100%"
            height="100%"
            objectFit="contain"
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            maxWidth="100%"
            maxHeight="100%"
          />
        )}
        
        {wave.mediaType === 'video' && (
          <Box
            as="video"
            src={wave.mediaUrl || wave.image}
            controls
            width="100%"
            height="100%"
            objectFit="contain"
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            maxWidth="100%"
            maxHeight="100%"
          />
        )}
        
        {wave.mediaType === 'audio' && (
          <Flex
            width="100%"
            height="100%"
            align="center"
            justify="center"
            bg={isDark ? 'gray.700' : 'gray.50'}
          >
            <Box width="90%">
              <audio 
                controls 
                src={wave.mediaUrl || wave.image} 
                style={{ width: '100%' }} 
              />
            </Box>
          </Flex>
        )}
      </Box>
      
      {/* Category and Rating */}
      <VStack align="stretch" spacing={2} mb={4}>
        {wave.category && (
            <Tag 
            colorScheme="blue" 
            alignSelf="flex-start"  // Keeps tag at natural width
            width="auto"          // Prevents stretching
            >
            {wave.category}
            </Tag>
        )}
        
        {wave.rating !== null && (
            <Flex 
            width="100%"
            bg={isDark ? "blue.900" : "blue.50"} 
            p={2}
            align="center"
            justify="center"
            borderBottom="1px solid"
            borderColor={isDark ? "blue.800" : "blue.100"}
            >
            <HStack>
                <Icon as={FiStar} color="yellow.400" />
                <Text fontWeight="bold">Wave Rating: {wave.rating.toFixed(1)}/5.0</Text>
            </HStack>
            </Flex>
        )}
        </VStack>
      
      {/* Interaction Buttons */}
      <Flex 
        justify="space-between" 
        align="center"
        px={1}
        pt={1}
        borderTopWidth="1px"
        borderColor={isDark ? 'gray.700' : 'gray.200'}
      >
        <HStack spacing={1}>
          <IconButton
            aria-label="Like"
            icon={<FiHeart />}
            variant="ghost"
            size="sm"
            color={wave.likes > 0 ? 'red.500' : 'gray.500'}
            onClick={handleLike}
          />
          <Text fontSize="sm">{wave.likes}</Text>
          
          <IconButton
            aria-label="Comment"
            icon={<FiMessageSquare />}
            variant="ghost"
            size="sm"
            color={showComments ? 'blue.500' : 'gray.500'}
            onClick={() => setShowComments(!showComments)}
          />
          <Text fontSize="sm">{wave.comments}</Text>
        </HStack>
        
        <HStack spacing={1}>
          <Icon as={FiEye} boxSize={4} />
          <Text fontSize="sm">{wave.views}</Text>
        </HStack>
      </Flex>

      {/* Comments Section */}
      <Collapse in={showComments}>
        <VStack spacing={2} align="stretch" mt={2} px={1}>
          <Flex>
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              size="sm"
              mr={2}
            />
            <IconButton
              icon={<FiSend />}
              onClick={handleComment}
              isDisabled={!newComment.trim()}
              colorScheme="blue"
              size="sm"
            />
          </Flex>
          
          {wave.commentsList?.map(comment => (
            <Flex key={comment.id} align="start">
              <Avatar size="xs" src={comment.profileImage} mr={2} />
              <Box 
                bg={isDark ? 'whiteAlpha.100' : 'gray.50'} 
                p={2} 
                borderRadius="md" 
                flex={1}
              >
                <Text fontWeight="bold" fontSize="xs">{comment.displayName}</Text>
                <Text fontSize="xs">{comment.content}</Text>
              </Box>
            </Flex>
          ))}
        </VStack>
      </Collapse>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        >
        <AlertDialogOverlay>
            <AlertDialogContent bg={isDark ? '#121212' : 'white'}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Wave
            </AlertDialogHeader>
            <AlertDialogBody>
                Are you sure you want to delete this wave? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
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