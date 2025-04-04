import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Icon,
  Text,
  useColorMode,
  Select,
  Flex,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  HStack,
  Image,
  Switch,
  RadioGroup,
  Radio,
  Stack,
  Divider,
  Spinner
} from '@chakra-ui/react';
import { FiUpload, FiX, FiImage, FiVideo, FiMusic, FiStar } from 'react-icons/fi';
import { useNavbar } from "../../context/NavbarContext";
import { useWaves } from '../../context/WaveContext';
import { useUser } from '../../context/UserContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../../Firebase/firebase';

const CreatePage = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [mediaType, setMediaType] = useState("image");
  const [enableRating, setEnableRating] = useState(false);
  const [ratingScale, setRatingScale] = useState("5");
  const [ratingValue, setRatingValue] = useState("0");
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const fileInputRef = useRef(null);
  const { isNavbarOpen } = useNavbar();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { addWave } = useWaves();
  const { currentUser } = useUser();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getAcceptedFileTypes = () => {
    switch (mediaType) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      case "audio":
        return "audio/*";
      default:
        return "";
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const isValid = files.every(file => {
        if (mediaType === "image" && file.type.startsWith('image/')) return true;
        if (mediaType === "video" && file.type.startsWith('video/')) return true;
        if (mediaType === "audio" && file.type.startsWith('audio/')) return true;
        return false;
      });

      if (isValid) {
        setSelectedFiles([...selectedFiles, ...files]);
        
        // Create preview URLs for the files
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviewUrls]);
      } else {
        toast({
          title: "Invalid file type",
          description: `Please upload ${mediaType} files only`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    
    if (files.length > 0) {
      const isValid = files.every(file => {
        if (mediaType === "image" && file.type.startsWith('image/')) return true;
        if (mediaType === "video" && file.type.startsWith('video/')) return true;
        if (mediaType === "audio" && file.type.startsWith('audio/')) return true;
        return false;
      });

      if (isValid) {
        setSelectedFiles([...selectedFiles, ...files]);
        
        // Create preview URLs for the files
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviewUrls]);
      } else {
        toast({
          title: "Invalid file type",
          description: `Please upload ${mediaType} files only`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    const newPreviewUrls = [...previewUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const formatTimestamp = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date(date);
    const dayName = days[d.getDay()];
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'p.m.' : 'a.m.';
    const formattedHours = hours % 12 || 12;
    
    return `${dayName} ${formattedHours}:${minutes} ${period}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category') || formData.get('genre');

    if (!selectedFiles.length) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true); // Use setIsLoading instead of setLoading
      
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to post a wave");
      }

      // Upload files to Firebase Storage and get URLs
      const uploadPromises = selectedFiles.map(async (file) => {
        const storageRef = ref(storage, `waves/${user.uid}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const mediaUrls = await Promise.all(uploadPromises);

      // Create the wave data object
      const waveData = {
        userId: user.uid,
        username: user.displayName || currentUser?.username || user.email.split('@')[0],
        displayName: user.displayName || currentUser?.displayName || user.email.split('@')[0],
        profileImage: user.photoURL || currentUser?.profileImage || '',
        content: description,
        mediaUrls,
        mediaType,
        title,
        category,
        rating: enableRating ? parseFloat(ratingValue) : null,
        ratingScale: enableRating ? parseInt(ratingScale) : null,
        likes: 0,
        comments: 0,
        views: 0,
        timestamp: formatTimestamp(new Date())
      };

      // Add to Firestore through context
      await addWave(waveData);
      
      // Show success message
      toast({
        title: "Wave created!",
        description: "Your post has been shared with the community",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form after submission
      setSelectedFiles([]);
      setPreviewUrls([]);
      setMediaType('image');
      setEnableRating(false);
      setRatingValue('0');
      event.target.reset();
      
    } catch (error) {
      console.error("Error uploading wave:", error);
      toast({
        title: "Error creating wave",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false); // Use setIsLoading instead of setLoading
    }
  };

  const changeMediaType = (type) => {
    if (selectedFiles.length > 0) {
      // Clean up existing previews
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
    setMediaType(type);
  };

  const handleRatingScaleChange = (value) => {
    setRatingScale(value);
    if (ratingValue !== "0") {
      if (value === "10" && ratingScale === "5") {
        setRatingValue((parseFloat(ratingValue) * 2).toString());
      } else if (value === "5" && ratingScale === "10") {
        setRatingValue((parseFloat(ratingValue) / 2).toString());
      }
    } else {
      setRatingValue("0");
    }
  };

  const renderRatingStars = (scale) => {
    if (scale === "5") {
      const stars = [];
      const ratingNum = parseFloat(ratingValue);
      
      for (let i = 1; i <= 5; i++) {
        const fullStar = i <= Math.floor(ratingNum);
        const halfStar = !fullStar && i - 0.5 <= ratingNum;
        
        stars.push(
          <Box 
            key={i}
            as="button"
            type="button"
            color={fullStar ? "yellow.400" : halfStar ? "yellow.300" : "gray.300"}
            fontSize="40px"
            onClick={(e) => {
              e.preventDefault();
              setRatingValue(i.toString());
            }}
            mx={2}
            position="relative"
            _hover={{ transform: 'scale(1.3)' }}
            transition="transform 0.2s"
          >
            {fullStar ? "★" : "☆"}
            {halfStar && (
              <Box
                as="span"
                position="absolute"
                left="0"
                top="0"
                color="yellow.400"
                overflow="hidden"
                width="50%"
              >
                ★
              </Box>
            )}
          </Box>
        );
        
        if (i < 5) {
          stars.push(
            <Box
              key={`${i}-half`}
              as="button"
              type="button"
              fontSize="16px"
              color={i + 0.5 <= ratingNum ? "yellow.400" : "gray.300"}
              onClick={(e) => {
                e.preventDefault();
                setRatingValue((i + 0.5).toString());
              }}
              alignSelf="center"
              mx={1}
              _hover={{ transform: 'scale(1.1)' }}
              transition="transform 0.2s"
            >
              ½
            </Box>
          );
        }
      }
      
      return (
        <HStack spacing={2} mt={4} align="center" py={4}>
          {stars}
          <Text ml={4} fontSize="xl">({ratingValue}/5)</Text>
        </HStack>
      );
    } else {
      return (
        <FormControl mt={4}>
          <Flex align="center" py={4}>
            <Input
              type="number"
              value={ratingValue}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (isNaN(val)) {
                  setRatingValue("0");
                } else if (val < 0) {
                  setRatingValue("0");
                } else if (val > 10) {
                  setRatingValue("10");
                } else {
                  setRatingValue(val.toString());
                }
              }}
              max={10}
              min={0}
              step={0.1}
              width="100px"
              height="60px"
              fontSize="xl"
              mr={3}
            />
            <Text fontSize="xl">/10</Text>
          </Flex>
        </FormControl>
      );
    }
  };

  const renderPreview = () => {
    if (selectedFiles.length === 0) return null;

    return (
      <Grid templateColumns={{ base: "1fr", md: "repeat(auto-fill, minmax(200px, 1fr))" }} gap={4} width="100%">
        {selectedFiles.map((file, index) => (
          <Box key={index} position="relative">
            {mediaType === "image" && (
              <Image 
                src={previewUrls[index]} 
                alt={file.name}
                objectFit="cover"
                width="100%"
                height="200px"
                borderRadius="md"
              />
            )}
            {mediaType === "video" && (
              <video 
                src={previewUrls[index]} 
                controls 
                style={{ width: '100%', height: '200px', borderRadius: '8px' }} 
              />
            )}
            {mediaType === "audio" && (
              <Box p={4} bg={colorMode === 'light' ? 'gray.100' : 'gray.700'} borderRadius="md">
                <Text mb={2} noOfLines={1}>{file.name}</Text>
                <audio controls src={previewUrls[index]} style={{ width: '100%' }} />
              </Box>
            )}
            <Button
              position="absolute"
              top="5px"
              right="5px"
              onClick={() => removeFile(index)}
              colorScheme="red"
              size="sm"
              borderRadius="full"
            >
              <Icon as={FiX} />
            </Button>
          </Box>
        ))}
      </Grid>
    );
  };

  const renderRatingSection = () => {
    return (
      <Box mt={6} mb={4}>
        <Divider mb={6} />
        
        <FormControl display="flex" alignItems="center" mb={4}>
          <FormLabel htmlFor="enable-rating" mb="0">
            Enable content rating
          </FormLabel>
          <Switch 
            id="enable-rating" 
            isChecked={enableRating}
            onChange={(e) => setEnableRating(e.target.checked)}
            colorScheme="blue"
          />
        </FormControl>
        
        {enableRating && (
          <VStack align="start" spacing={4} pl={4} pt={2}>
            <FormControl as="fieldset">
              <FormLabel as="legend">Rating Scale</FormLabel>
              <RadioGroup onChange={handleRatingScaleChange} value={ratingScale}>
                <Stack direction="row" spacing={5}>
                  <Radio value="5">5-Star Scale</Radio>
                  <Radio value="10">10-Point Scale</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            
            <FormControl>
              <FormLabel>Your Rating</FormLabel>
              {renderRatingStars(ratingScale)}
            </FormControl>
          </VStack>
        )}
      </Box>
    );
  };

  return (
    <Box
      width="100vw"
      ml={isMobile ? 0 : isNavbarOpen ? "-240px" : "-90px"}
      pl={isMobile ? 0 : isNavbarOpen ? "240px" : "90px"}
      transition="all 0.2s"
      overflowX="hidden"
    >
      <Flex
        w="100%"
        p={8}
        pb={isMobile ? "80px" : 8} // Add bottom padding on mobile for navbar
      >
        <Box
          w="100%"
          maxW="1200px"
          mx="auto"
          bg={colorMode === 'dark' ? '#121212' : 'white'}
          borderRadius="lg"
          p={8}
          boxShadow="lg"
        >
          <VStack spacing={8} align="stretch">
            <Heading size="lg" color={colorMode === 'light' ? 'gray.800' : 'white'}>
              Post A Wave!
            </Heading>

            <Tabs isFitted variant="enclosed" onChange={index => changeMediaType(["image", "video", "audio"][index])}>
              <TabList mb="1em">
                <Tab _selected={{ color: "white", bg: "blue.500" }}>
                  <HStack>
                    <Icon as={FiImage} />
                    <Text>Images</Text>
                  </HStack>
                </Tab>
                <Tab _selected={{ color: "white", bg: "blue.500" }}>
                  <HStack>
                    <Icon as={FiVideo} />
                    <Text>Videos</Text>
                  </HStack>
                </Tab>
                <Tab _selected={{ color: "white", bg: "blue.500" }}>
                  <HStack>
                    <Icon as={FiMusic} />
                    <Text>Audio</Text>
                  </HStack>
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel p={0}>
                  <form onSubmit={handleSubmit}>
                    <VStack spacing={6} align="stretch">
                      <Box
                        border="2px dashed"
                        borderColor={colorMode === 'light' ? 'gray.300' : 'whiteAlpha.300'}
                        borderRadius="lg"
                        p={8}
                        textAlign="center"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept={getAcceptedFileTypes()}
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          multiple
                        />

                        <VStack spacing={4}>
                          <Icon as={FiUpload} boxSize={10} color={colorMode === 'light' ? 'gray.500' : 'whiteAlpha.500'} />
                          <Text color={colorMode === 'light' ? 'gray.500' : 'whiteAlpha.500'}>
                            Drag and drop your images here or
                          </Text>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            colorScheme="blue"
                            size="lg"
                          >
                            Browse Files
                          </Button>
                          <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'whiteAlpha.500'}>
                            Supported formats: JPG, PNG, GIF, WebP
                          </Text>
                        </VStack>
                      </Box>

                      {renderPreview()}

                      <FormControl>
                        <FormLabel color={colorMode === 'light' ? 'gray.700' : 'white'}>Title</FormLabel>
                        <Input
                          name="title"
                          placeholder={`Enter a title for your ${mediaType}`}
                          size="lg"
                          bg={colorMode === 'light' ? 'white' : 'whiteAlpha.50'}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color={colorMode === 'light' ? 'gray.700' : 'white'}>Description</FormLabel>
                        <Textarea
                          name="description"
                          placeholder="Enter a description"
                          size="lg"
                          bg={colorMode === 'light' ? 'white' : 'whiteAlpha.50'}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color={colorMode === 'light' ? 'gray.700' : 'white'}>
                          {mediaType === 'audio' ? 'Genre' : 'Category'}
                        </FormLabel>
                        <Select
                          name={mediaType === 'audio' ? 'genre' : 'category'}
                          placeholder={`Select ${mediaType === 'audio' ? 'genre' : 'category'}`}
                          size="lg"
                          bg={colorMode === 'light' ? 'white' : 'whiteAlpha.50'}
                        >
                          <option value="art">Art</option>
                          <option value="photography">Photography</option>
                          <option value="nature">Nature</option>
                          <option value="people">People</option>
                          <option value="food">Food</option>
                          <option value="travel">Travel</option>
                        </Select>
                      </FormControl>

                      {renderRatingSection()}

                      <Button
                        type="submit"
                        colorScheme="blue"
                        size="lg"
                        isDisabled={selectedFiles.length === 0 || isLoading}
                        isLoading={isLoading}
                        loadingText={isLoading ? "Uploading..." : null}
                      >
                        {isLoading ? <Spinner size="sm" /> : "Upload Images"}
                      </Button>
                    </VStack>
                  </form>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default CreatePage;