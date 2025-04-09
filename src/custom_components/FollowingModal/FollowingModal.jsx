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
  
  const FollowingModal = ({ isOpen, onClose, following, profileUsername }) => {
    const { colorMode } = useColorMode();
    const navigate = useNavigate();
    const { getUserById } = useUser();
    const [followingData, setFollowingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
  
    useEffect(() => {
      const fetchFollowingData = async () => {
        setLoading(true);
        try {
          const data = await Promise.all(
            following.map(async (followingId) => {
              const userData = await getUserById(followingId);
              return userData;
            })
          );
          setFollowingData(data.filter(user => user !== null));
        } catch (error) {
          console.error('Error fetching following:', error);
        } finally {
          setLoading(false);
        }
      };
  
      if (isOpen && following?.length > 0) {
        fetchFollowingData();
      }
    }, [isOpen, following, getUserById]);
  
    const handleUserClick = (username) => {
      navigate(`/profile/${username}`);
      onClose();
    };
  
    const filteredFollowing = followingData.filter(user => 
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent bg={colorMode === 'dark' ? '#121212' : 'white'}>
          <ModalHeader borderBottomWidth="1px" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}>
            @{profileUsername} is following
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <InputGroup mb={4}>
              <InputLeftElement pointerEvents='none'>
                <Icon as={FiSearch} color='gray.500' />
              </InputLeftElement>
              <Input
                placeholder='Search following...'
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
            ) : followingData.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {filteredFollowing.map((user) => (
                  <HStack
                    key={user.uid}
                    spacing={3}
                    p={2}
                    borderRadius="md"
                    _hover={{
                      bg: colorMode === 'dark' ? 'gray.700' : 'gray.50',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleUserClick(user.username)}
                  >
                    <Avatar
                      size="md"
                      src={user.profileImage}
                      name={user.displayName}
                    />
                    <Box flex={1}>
                      <Text fontWeight="bold">{user.displayName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        @{user.username}
                      </Text>
                    </Box>
                  </HStack>
                ))}
                {filteredFollowing.length === 0 && (
                  <Text textAlign="center" color="gray.500">
                    No matches found
                  </Text>
                )}
              </VStack>
            ) : (
              <Text textAlign="center" color="gray.500">
                Not following anyone yet
              </Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };
  
  export default FollowingModal;