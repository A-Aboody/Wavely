import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    VStack,
    HStack,
    Avatar,
    Text,
    Box,
    useColorMode,
    Spinner,
    InputGroup,
    InputLeftElement,
    Input,
    Icon,
  } from '@chakra-ui/react';
  import { useNavigate } from 'react-router-dom';
  import { useState, useEffect } from 'react';
  import { useUser } from '../../context/UserContext';
  import { FiSearch } from 'react-icons/fi';
  
  const FollowersModal = ({ isOpen, onClose, followers, profileUsername }) => {
    const { colorMode } = useColorMode();
    const navigate = useNavigate();
    const { getUserById } = useUser();
    const [followersData, setFollowersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
  
    useEffect(() => {
      const fetchFollowersData = async () => {
        setLoading(true);
        try {
          const data = await Promise.all(
            followers.map(async (followerId) => {
              const userData = await getUserById(followerId);
              return userData;
            })
          );
          setFollowersData(data.filter(user => user !== null));
        } catch (error) {
          console.error('Error fetching followers:', error);
        } finally {
          setLoading(false);
        }
      };
  
      if (isOpen && followers?.length > 0) {
        fetchFollowersData();
      }
    }, [isOpen, followers, getUserById]);
  
    const handleUserClick = (username) => {
      navigate(`/profile/${username}`);
      onClose();
    };
  
    const filteredFollowers = followersData.filter(follower => 
      follower.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      follower.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent bg={colorMode === 'dark' ? '#121212' : 'white'}>
          <ModalHeader borderBottomWidth="1px" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}>
            Followers of @{profileUsername}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <InputGroup mb={4}>
              <InputLeftElement pointerEvents='none'>
                <Icon as={FiSearch} color='gray.500' />
              </InputLeftElement>
              <Input
                placeholder='Search followers...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={colorMode === 'dark' ? 'gray.800' : 'white'}
                borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
              />
            </InputGroup>
  
            {loading ? (
              <Box textAlign="center" py={4}>
                <Spinner size="lg" />
              </Box>
            ) : followersData.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {filteredFollowers.map((follower) => (
                  <HStack
                    key={follower.uid}
                    spacing={3}
                    p={2}
                    borderRadius="md"
                    _hover={{
                      bg: colorMode === 'dark' ? 'gray.700' : 'gray.50',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleUserClick(follower.username)}
                  >
                    <Avatar
                      size="md"
                      src={follower.profileImage}
                      name={follower.displayName}
                    />
                    <Box flex={1}>
                      <Text fontWeight="bold">{follower.displayName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        @{follower.username}
                      </Text>
                    </Box>
                  </HStack>
                ))}
                {filteredFollowers.length === 0 && (
                  <Text textAlign="center" color="gray.500">
                    No matches found
                  </Text>
                )}
              </VStack>
            ) : (
              <Text textAlign="center" color="gray.500">
                No followers yet
              </Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };
  
  export default FollowersModal;