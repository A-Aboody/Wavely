import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    VStack,
    Flex,
    Box,
    Avatar,
    Image,
    useColorMode,
    useToast,
  } from '@chakra-ui/react';
  import { useRef, useState, useEffect } from 'react';
  import { FiImage } from 'react-icons/fi';
  
  const EditProfileModal = ({ 
    isOpen, 
    onClose, 
    profileUser, 
    onUpdateProfile, 
    onImageUpload, 
    imageUploading 
  }) => {
    const { colorMode } = useColorMode();
    const toast = useToast();
    const initialFocusRef = useRef();
    const profileImageRef = useRef();
    const bannerImageRef = useRef();
    
    // State for pending changes
    const [pendingProfileImage, setPendingProfileImage] = useState(null);
    const [pendingBannerImage, setPendingBannerImage] = useState(null);
    const [formData, setFormData] = useState({
      username: '',
      displayName: '',
      bio: '',
    });
  
    // Reset form when modal opens
    useEffect(() => {
      if (isOpen && profileUser) {
        setFormData({
          username: profileUser.username || '',
          displayName: profileUser.displayName || '',
          bio: profileUser.bio || '',
        });
        setPendingProfileImage(null);
        setPendingBannerImage(null);
      }
    }, [isOpen, profileUser]);
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
  
    const handleImageSelect = async (file, type) => {
      if (!file) return;
      
      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
  
      // Store pending image
      if (type === 'profile') {
        setPendingProfileImage(file);
      } else {
        setPendingBannerImage(file);
      }
    };
  
    const handleSubmit = async (event) => {
        event.preventDefault(); // Now this will work correctly
        
        try {
          // Validate required fields
          if (!formData.displayName.trim() || !formData.username.trim()) {
            toast({
              title: "Required fields missing",
              description: "Please fill in all required fields",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
            return;
          }
      
          let updatedData = { ...formData };
      
          // Handle profile image upload
          if (pendingProfileImage) {
            const profileImageUrl = await onImageUpload(pendingProfileImage, 'profile');
            if (profileImageUrl) {
              updatedData.profileImage = profileImageUrl;
            }
          }
      
          // Handle banner image upload
          if (pendingBannerImage) {
            const bannerImageUrl = await onImageUpload(pendingBannerImage, 'banner');
            if (bannerImageUrl) {
              updatedData.bannerImage = bannerImageUrl;
            }
          }
      
          // Submit all changes
          const success = await onUpdateProfile(updatedData);
          
          if (success) {
            toast({
              title: "Profile updated",
              description: "Your changes have been saved successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            handleClose();
          }
        } catch (error) {
          console.error("Error updating profile:", error);
          toast({
            title: "Error updating profile",
            description: error.message || "Failed to save changes",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
    };
  
    const handleClose = () => {
      setPendingProfileImage(null);
      setPendingBannerImage(null);
      setFormData({
        username: profileUser?.username || '',
        displayName: profileUser?.displayName || '',
        bio: profileUser?.bio || '',
      });
      onClose();
    };
  
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        size="xl" 
        initialFocusRef={initialFocusRef}
        isCentered={true}
      >
        <ModalOverlay />
        <ModalContent bg={colorMode === 'dark' ? '#121212' : 'white'}>
          <ModalHeader borderBottomWidth="1px" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}>
            Edit Profile
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={6} py={4}>
                <FormControl>
                  <FormLabel>Profile Picture</FormLabel>
                  <input
                    type="file"
                    accept="image/*"
                    ref={profileImageRef}
                    onChange={(e) => e.target.files && handleImageSelect(e.target.files[0], 'profile')}
                    style={{ display: 'none' }}
                  />
                  <Flex align="center" gap={4}>
                    <Avatar
                      size="xl"
                      src={pendingProfileImage ? URL.createObjectURL(pendingProfileImage) : profileUser.profileImage}
                      name={formData.displayName}
                    />
                    <Button
                      onClick={() => profileImageRef.current?.click()}
                      variant="outline"
                      leftIcon={<FiImage />}
                    >
                      Change Photo
                    </Button>
                  </Flex>
                </FormControl>
  
                <FormControl>
                  <FormLabel>Banner Image</FormLabel>
                  <input
                    type="file"
                    accept="image/*"
                    ref={bannerImageRef}
                    onChange={(e) => e.target.files && handleImageSelect(e.target.files[0], 'banner')}
                    style={{ display: 'none' }}
                  />
                  <Box position="relative" height="150px" borderRadius="md" overflow="hidden" borderWidth="1px" bg={colorMode === 'dark' ? 'gray.700' : 'gray.200'}>
                    <Image
                      src={pendingBannerImage ? URL.createObjectURL(pendingBannerImage) : (profileUser.bannerImage || '/default-banner.jpg')}
                      alt="Banner preview"
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      fallbackSrc='/default-banner.jpg'
                    />
                    <Button
                      position="absolute"
                      bottom="4"
                      right="4"
                      size="sm"
                      onClick={() => bannerImageRef.current?.click()}
                      variant="solid"
                      colorScheme="blackAlpha"
                      leftIcon={<FiImage />}
                    >
                      Change Banner
                    </Button>
                  </Box>
                </FormControl>
  
                <FormControl isRequired>
                  <FormLabel>Display Name</FormLabel>
                  <Input
                    ref={initialFocusRef}
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Your display name"
                  />
                </FormControl>
  
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Your unique username"
                  />
                </FormControl>
  
                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter borderTopWidth="1px" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}>
              <Button variant="ghost" mr={3} onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                type="submit" 
                isLoading={imageUploading}
                loadingText="Saving..."
              >
                Save Changes
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    );
  };
  
  export default EditProfileModal;