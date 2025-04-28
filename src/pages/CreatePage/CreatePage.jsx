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
 Spinner,
 Alert,
 AlertIcon,
 SimpleGrid,
 Card,
 CardBody,
 CardFooter,
 Badge,
 IconButton
} from '@chakra-ui/react';
import { FiUpload, FiX, FiImage, FiVideo, FiMusic, FiStar, FiUser, FiUsers, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { useNavbar } from "../../context/NavbarContext";
import { useWaves } from '../../context/WaveContext';
import { useUser } from '../../context/UserContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../../Firebase/firebase';
import { searchAnime } from '../../utils/apiRoutes';

const CreatePage = () => {
 const [selectedFiles, setSelectedFiles] = useState([]);
 const [previewUrls, setPreviewUrls] = useState([]);
 const [mediaType, setMediaType] = useState("image");
 const [waveType, setWaveType] = useState("personal");
 const [enableRating, setEnableRating] = useState(false);
 const [ratingScale, setRatingScale] = useState("5");
 const [communityRatingScale, setCommunityRatingScale] = useState("5");
 const [ratingValue, setRatingValue] = useState("0");
 const [isLoading, setIsLoading] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [searchResults, setSearchResults] = useState([]);
 const [isSearching, setIsSearching] = useState(false);
 const [selectedAnime, setSelectedAnime] = useState(null);
 const [viewMode, setViewMode] = useState('create'); 
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

 useEffect(() => {
  return () => {
   previewUrls.forEach(url => URL.revokeObjectURL(url));
  };
 }, [previewUrls]);

 const handleSearchSubmit = async (e) => {
  e.preventDefault();
  if (!searchQuery.trim()) return;

  setIsSearching(true);
  setSearchResults([]); 
  try {
   const results = await searchAnime(searchQuery);
   setSearchResults(results);
  } catch (error) {
   toast({
    title: "Search failed",
    description: "Could not fetch anime data",
    status: "error",
    duration: 3000,
    isClosable: true,
   });
  } finally {
   setIsSearching(false);
  }
 };

 const selectAnime = (anime) => {
  setSelectedAnime(anime);
  previewUrls.forEach(url => URL.revokeObjectURL(url));
  setSelectedFiles([]);
  setPreviewUrls([]);
  setViewMode('create'); 
  setSearchQuery("");    
  setSearchResults([]);
 };

 const clearSelectedAnime = () => {
  setSelectedAnime(null);
 };

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
   if (selectedAnime) {
     clearSelectedAnime();
   }

   const isValid = files.every(file => {
    if (mediaType === "image" && file.type.startsWith('image/')) return true;
    if (mediaType === "video" && file.type.startsWith('video/')) return true;
    if (mediaType === "audio" && file.type.startsWith('audio/')) return true;
    return false;
   });

   if (isValid) {
    setSelectedFiles([...selectedFiles, ...files]);
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
   if (fileInputRef.current) {
    fileInputRef.current.value = "";
   }
 };

 const handleDragOver = (event) => {
  event.preventDefault();
 };

 const handleDrop = (event) => {
  event.preventDefault();
  const files = Array.from(event.dataTransfer.files);

  if (files.length > 0) {
   if (selectedAnime) {
     clearSelectedAnime();
   }

   const isValid = files.every(file => {
    if (mediaType === "image" && file.type.startsWith('image/')) return true;
    if (mediaType === "video" && file.type.startsWith('video/')) return true;
    if (mediaType === "audio" && file.type.startsWith('audio/')) return true;
    return false;
   });

   if (isValid) {
    setSelectedFiles([...selectedFiles, ...files]);
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
  const title = formData.get('title') || selectedAnime?.title.romaji || selectedAnime?.title.english || `Untitled ${mediaType}`;
  const description = formData.get('description');
  const category = formData.get('category') || formData.get('genre') || (selectedAnime?.genres ? selectedAnime.genres[0].toLowerCase() : null);

  if (!selectedFiles.length && !selectedAnime) {
   toast({
    title: "No content selected",
    description: `Please select at least one ${mediaType} file or an anime to upload`,
    status: "error",
    duration: 3000,
    isClosable: true,
   });
   return;
  }

  try {
   setIsLoading(true);

   const user = auth.currentUser;
   if (!user) {
    throw new Error("You must be logged in to post a wave");
   }

   let mediaUrls = [];
   if (selectedFiles.length > 0) {
    const uploadPromises = selectedFiles.map(async (file) => {
     const storageRef = ref(storage, `waves/${user.uid}/${Date.now()}-${file.name}`);
     await uploadBytes(storageRef, file);
     return getDownloadURL(storageRef);
    });

    mediaUrls = await Promise.all(uploadPromises);
   }

   const waveData = {
    userId: user.uid,
    username: user.displayName || currentUser?.username || user.email.split('@')[0],
    displayName: user.displayName || currentUser?.displayName || user.email.split('@')[0],
    profileImage: user.photoURL || currentUser?.profileImage || '',
    content: description,
    mediaUrls,
    mediaType: selectedAnime ? "anime" : mediaType,
    title,
    category: selectedAnime ? category || selectedAnime.format?.toLowerCase() || 'anime' : category || mediaType,
    animeData: selectedAnime ? {
     id: selectedAnime.id,
     title: selectedAnime.title,
     coverImage: selectedAnime.coverImage.large,
     averageScore: selectedAnime.averageScore,
     format: selectedAnime.format,
     episodes: selectedAnime.episodes,
     genres: selectedAnime.genres
    } : null,
    waveType,
    rating: waveType === 'personal' && enableRating ? parseFloat(ratingValue) : null,
    ratingScale: waveType === 'personal' && enableRating ? parseInt(ratingScale) : null,
    communityRatingScale: waveType === 'community' ? parseInt(communityRatingScale) : null,
    communityRatings: waveType === 'community' ? [] : null,
    averageRating: null,
    likes: 0,
    comments: 0,
    views: 0,
    timestamp: formatTimestamp(new Date())
   };

   await addWave(waveData);

   toast({
    title: "Wave created!",
    description: `Your ${waveType === 'personal' ? 'personal' : 'community'} wave has been shared`,
    status: "success",
    duration: 3000,
    isClosable: true,
   });

   setSelectedFiles([]);
   setPreviewUrls([]);
   setSelectedAnime(null);
   setEnableRating(false);
   setRatingValue('0');
   setWaveType('personal');
   setRatingScale('5');
   setCommunityRatingScale('5');
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
   setIsLoading(false);
  }
 };

 const changeMediaType = (type) => {
  if (selectedAnime) {
   toast({
    title: "Anime Selected",
    description: "Clear the selected anime to upload different media types.",
    status: "info",
    duration: 3000,
    isClosable: true,
   });
   return; 
  }
  if (selectedFiles.length > 0) {
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

 const handleCommunityRatingScaleChange = (value) => {
  setCommunityRatingScale(value);
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
      mx={1} 
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
       mx={0} 
       p={0}
       minW="10px"
       height="30px"
       _hover={{ transform: 'scale(1.1)' }}
       transition="transform 0.2s"
      >
       ½
      </Box>
     );
    }
   }

   return (
    <HStack spacing={1} mt={4} align="center" py={4}>
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
         setRatingValue(e.target.value); 
        }
       }}
       onBlur={(e) => { 
           const val = parseFloat(e.target.value);
           if (isNaN(val) || val < 0) setRatingValue("0");
           else if (val > 10) setRatingValue("10");
           else setRatingValue(val.toString());
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
  if (selectedFiles.length === 0 && !selectedAnime) return null;

  return (
   <Grid templateColumns={{ base: "1fr", md: "repeat(auto-fill, minmax(200px, 1fr))" }} gap={4} width="100%" mt={6}>
    {selectedAnime && (
     <Box position="relative" overflow="hidden" borderRadius="md" boxShadow="md">
      <Image
       src={selectedAnime.coverImage.large}
       alt={selectedAnime.title.romaji || selectedAnime.title.english}
       objectFit="cover"
       width="100%"
       height="200px"
      />
      <Box position="absolute" bottom="0" left="0" right="0" bg="blackAlpha.700" p={2}>
       <Text color="white" fontSize="sm" fontWeight="bold" noOfLines={1}>
        {selectedAnime.title.romaji || selectedAnime.title.english}
       </Text>
       <Text color="white" fontSize="xs">
        {selectedAnime.averageScore ? `Avg Score: ${selectedAnime.averageScore}/100` : 'No score'} | {selectedAnime.format} {selectedAnime.episodes ? `| ${selectedAnime.episodes} ep` : ''}
       </Text>
      </Box>
      <IconButton
       position="absolute"
       top="5px"
       right="5px"
       onClick={clearSelectedAnime}
       colorScheme="red"
       aria-label='Clear selected anime'
       size="sm"
       isRound={true}
       icon={<Icon as={FiX} />}
      />
     </Box>
    )}

    {selectedFiles.map((file, index) => (
     <Box key={index} position="relative" overflow="hidden" borderRadius="md" boxShadow="md">
      {mediaType === "image" && (
       <Image
        src={previewUrls[index]}
        alt={file.name}
        objectFit="cover"
        width="100%"
        height="200px"
       />
      )}
      {mediaType === "video" && (
       <video
        src={previewUrls[index]}
        controls
        style={{ width: '100%', height: '200px', display: 'block' }}
       />
      )}
      {mediaType === "audio" && (
       <Box p={4} bg={colorMode === 'light' ? 'gray.100' : 'gray.700'} height="200px" display="flex" flexDirection="column" justifyContent="center">
        <Icon as={FiMusic} boxSize={8} mx="auto" mb={2} />
        <Text mb={2} noOfLines={2} textAlign="center" fontSize="sm">{file.name}</Text>
        <audio controls src={previewUrls[index]} style={{ width: '100%' }} />
       </Box>
      )}
      <IconButton
       position="absolute"
       top="5px"
       right="5px"
       onClick={() => removeFile(index)}
       colorScheme="red"
       aria-label='Remove file'
       size="sm"
       isRound={true}
       icon={<Icon as={FiX} />}
      />
     </Box>
    ))}
   </Grid>
  );
 };

 const renderWaveTypeSelector = () => (
  <FormControl as="fieldset" mb={6}>
   <FormLabel as="legend">Wave Type</FormLabel>
   <RadioGroup onChange={setWaveType} value={waveType}>
    <Stack direction={{ base: "column", sm: "row" }} spacing={5}>
     <Radio value="personal">
      <HStack>
       <Icon as={FiUser} />
       <Text>Personal Wave</Text>
      </HStack>
     </Radio>
     <Radio value="community">
      <HStack>
       <Icon as={FiUsers} />
       <Text>Community Wave</Text>
      </HStack>
     </Radio>
    </Stack>
   </RadioGroup>
   <Text mt={2} fontSize="sm" color="gray.500">
    {waveType === 'personal'
     ? "You'll rate your own content (optional)"
     : "The community will rate your content"}
   </Text>
  </FormControl>
 );

 const renderRatingSection = () => {
  if (waveType === 'community') {
   return (
    <Box mt={6} mb={4}>
     <Divider mb={6} />
     <Text fontSize="lg" fontWeight="bold" display="flex" alignItems="center">
      <Icon as={FiUsers} mr={2} />
      Community Rating Settings
     </Text>

     <Alert status="info" mt={4} mb={4} borderRadius="md">
      <AlertIcon />
      Community members will be able to rate this content using the scale you select.
     </Alert>

     <FormControl as="fieldset" mt={4}>
      <FormLabel as="legend">Community Rating Scale</FormLabel>
      <RadioGroup onChange={handleCommunityRatingScaleChange} value={communityRatingScale}>
       <Stack direction="row" spacing={5}>
        <Radio value="5">5-Star Scale</Radio>
        <Radio value="10">10-Point Scale</Radio>
       </Stack>
      </RadioGroup>
     </FormControl>

     <Text mt={4} color="gray.500">
      The community will use the {communityRatingScale === "5" ? "5-star" : "10-point"} scale. You won't rate community waves yourself.
     </Text>
    </Box>
   );
  }

  // Personal Wave Rating Section
  return (
   <Box mt={6} mb={4}>
    <Divider mb={6} />

    <FormControl display="flex" alignItems="center" mb={4}>
     <FormLabel htmlFor="enable-rating" mb="0" display="flex" alignItems="center">
       <Icon as={FiStar} mr={2} /> Enable Rating
     </FormLabel>
     <Switch
      id="enable-rating"
      isChecked={enableRating}
      onChange={(e) => setEnableRating(e.target.checked)}
      colorScheme="blue"
     />
    </FormControl>

    {enableRating && (
     <VStack align="start" spacing={4} pl={4} pt={2} borderLeft="2px" borderColor="blue.200">
      <FormControl as="fieldset">
       <FormLabel as="legend">Your Rating Scale</FormLabel>
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

 const getCategoryOptions = () => {
  if (selectedAnime) {
   const genres = selectedAnime.genres?.map(g => g.toLowerCase()) || [];
   const uniqueGenres = [...new Set([selectedAnime.format?.toLowerCase(), ...genres].filter(Boolean))];
   return (
    <>
     {uniqueGenres.map(genre => (
      <option key={genre} value={genre}>{genre.charAt(0).toUpperCase() + genre.slice(1)}</option>
     ))}
    </>
   );
  }

  switch (mediaType) {
   case "image":
    return (
     <>
      <option value="art">Art</option>
      <option value="photography">Photography</option>
      <option value="nature">Nature</option>
      <option value="people">People</option>
      <option value="food">Food</option>
      <option value="travel">Travel</option>
      <option value="wallpaper">Wallpaper</option>
      <option value="meme">Meme</option>
     </>
    );
   case "video":
    return (
     <>
      <option value="short-film">Short Film</option>
      <option value="vlog">Vlog</option>
      <option value="tutorial">Tutorial</option>
      <option value="comedy">Comedy</option>
      <option value="documentary">Documentary</option>
      <option value="animation">Animation</option>
      <option value="music-video">Music Video</option>
      <option value="gameplay">Gameplay</option>
     </>
    );
   case "audio":
    return (
     <>
      <option value="music">Music</option>
      <option value="podcast">Podcast</option>
      <option value="audiobook">Audiobook</option>
      <option value="sound-effects">Sound Effects</option>
      <option value="voice-over">Voice Over</option>
      <option value="instrumental">Instrumental</option>
      <option value="mix">Mix/DJ Set</option>
     </>
    );
   default:
    return null;
  }
 };

 const renderDropZone = () => (
  <Box
   border="2px dashed"
   borderColor={colorMode === 'light' ? 'gray.300' : 'whiteAlpha.300'}
   borderRadius="lg"
   p={8}
   textAlign="center"
   onDragOver={handleDragOver}
   onDrop={handleDrop}
   opacity={selectedAnime ? 0.5 : 1}
   pointerEvents={selectedAnime ? 'none' : 'auto'}
  >
   <input
    type="file"
    accept={getAcceptedFileTypes()}
    onChange={handleFileChange}
    ref={fileInputRef}
    style={{ display: 'none' }}
    multiple
    disabled={!!selectedAnime}
   />

   <VStack spacing={4}>
    <Icon as={FiUpload} boxSize={10} color={colorMode === 'light' ? 'gray.500' : 'whiteAlpha.500'} />
    <Text color={colorMode === 'light' ? 'gray.500' : 'whiteAlpha.500'}>
     {selectedAnime
       ? "Clear selected anime to upload files"
       : `Drag and drop your ${mediaType}s here or`}
    </Text>
    <Button
     onClick={() => fileInputRef.current?.click()}
     colorScheme="blue"
     size="lg"
     isDisabled={!!selectedAnime}
    >
     Browse Files
    </Button>
    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'whiteAlpha.500'}>
     {mediaType === "image" && "Supported: JPG, PNG, GIF, WebP"}
     {mediaType === "video" && "Supported: MP4, WebM, MOV, AVI"}
     {mediaType === "audio" && "Supported: MP3, WAV, OGG, FLAC"}
    </Text>
   </VStack>
  </Box>
 );


 const renderCreateView = () => (
  <VStack spacing={8} align="stretch">
   <Tabs isFitted variant="enclosed" index={["image", "video", "audio"].indexOf(mediaType)} onChange={index => changeMediaType(["image", "video", "audio"][index])} isDisabled={!!selectedAnime}>
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
   </Tabs>

   <form onSubmit={handleSubmit}>
    <VStack spacing={6} align="stretch">
     {renderWaveTypeSelector()}

     {!selectedAnime && renderDropZone()}

     {renderPreview()}

     {(selectedFiles.length > 0 || selectedAnime) && (
      <>
       <FormControl isRequired={!selectedAnime}>
        <FormLabel color={colorMode === 'light' ? 'gray.700' : 'white'}>Title</FormLabel>
        <Input
         name="title"
         placeholder={selectedAnime ? '' : `Enter a title for your ${mediaType}`}
         size="lg"
         bg={colorMode === 'light' ? 'white' : 'whiteAlpha.50'}
         defaultValue={selectedAnime ? selectedAnime.title.romaji || selectedAnime.title.english : ''}
         key={selectedAnime ? selectedAnime.id : 'file-title'} 
        />
       </FormControl>

       <FormControl>
        <FormLabel color={colorMode === 'light' ? 'gray.700' : 'white'}>Description</FormLabel>
        <Textarea
         name="description"
         placeholder="Enter a description (optional)"
         size="lg"
         bg={colorMode === 'light' ? 'white' : 'whiteAlpha.50'}
        />
       </FormControl>

       <FormControl>
        <FormLabel color={colorMode === 'light' ? 'gray.700' : 'white'}>
         {selectedAnime ? 'Primary Genre/Format' : (mediaType === 'audio' ? 'Genre' : 'Category')}
        </FormLabel>
        <Select
         name={selectedAnime ? 'category' : (mediaType === 'audio' ? 'genre' : 'category')}
         placeholder={`Select ${selectedAnime ? 'genre/format' : (mediaType === 'audio' ? 'genre' : 'category')} (optional)`}
         size="lg"
         bg={colorMode === 'light' ? 'white' : 'whiteAlpha.50'}
         key={selectedAnime ? `anime-cat-${selectedAnime.id}` : `file-cat-${mediaType}`} // Ensure options update
         defaultValue={selectedAnime ? (selectedAnime.genres?.[0]?.toLowerCase() || selectedAnime.format?.toLowerCase()) : ""}
        >
         {getCategoryOptions()}
        </Select>
       </FormControl>

       {renderRatingSection()}

       <Button
        type="submit"
        colorScheme="blue"
        size="lg"
        isDisabled={(selectedFiles.length === 0 && !selectedAnime) || isLoading}
        isLoading={isLoading}
        loadingText={isLoading ? "Uploading..." : null}
        leftIcon={isLoading ? <Spinner size="sm" /> : null}
       >
        {isLoading ? "Uploading..." : `Create Wave`}
       </Button>
      </>
     )}

    </VStack>
   </form>
  </VStack>
 );

 const renderSearchView = () => (
  <VStack spacing={6} align="stretch">
   <Flex justify="space-between" align="center">
       <Button onClick={() => setViewMode('create')} variant="ghost" leftIcon={<FiArrowLeft />}>
           Back to Create
       </Button>
       <Heading size="md" textAlign="center">Search Anime</Heading>
       <Box w="100px" /> 
   </Flex>

   <form onSubmit={handleSearchSubmit}>
    <Flex gap={2}>
     <FormControl>
      <Input
       placeholder="Search for anime title..."
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       size="lg"
      />
     </FormControl>
     <Button
      colorScheme="purple"
      type="submit"
      isLoading={isSearching}
      loadingText="Searching..."
      size="lg"
      px={8}
      leftIcon={<FiSearch />}
     >
      Search
     </Button>
    </Flex>
   </form>

   {isSearching && <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" emptyColor="gray.200" mx="auto" my={10} />}

   {searchResults.length > 0 && (
    <Box mt={6}>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>Select an Anime:</Text>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
         {searchResults.map((anime) => (
          <Card
           key={anime.id}
           cursor="pointer"
           onClick={() => selectAnime(anime)}
           _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
           transition="all 0.2s ease-out"
           overflow="hidden"
           bg={colorMode === 'dark' ? 'gray.700' : 'white'}
          >
           <Image
            src={anime.coverImage.large}
            alt={anime.title.romaji || anime.title.english}
            height="250px"
            width="100%"
            objectFit="cover"
           />
           <CardBody py={3} px={4}>
            <Text fontWeight="bold" noOfLines={1} fontSize="md">
             {anime.title.romaji || anime.title.english}
            </Text>
            <Text fontSize="sm" color="gray.500" noOfLines={1}>
             {anime.title.english && anime.title.english !== anime.title.romaji ? anime.title.english : (anime.title.native || '')}
            </Text>
           </CardBody>
           <CardFooter pt={0} pb={3} px={4}>
            <HStack spacing={2} wrap="wrap">
             <Badge colorScheme="blue" variant="subtle">{anime.format || 'N/A'}</Badge>
             {anime.averageScore && (
              <Badge colorScheme="green" variant="subtle">
               <Icon as={FiStar} mr="1" verticalAlign="middle"/> {anime.averageScore / 10}
              </Badge>
             )}
             {anime.episodes && <Badge variant="outline">{anime.episodes} ep</Badge>}
            </HStack>
           </CardFooter>
          </Card>
         ))}
        </SimpleGrid>
    </Box>
   )}

    {!isSearching && searchResults.length === 0 && searchQuery && (
         <Text mt={6} textAlign="center" color="gray.500">No results found for "{searchQuery}". Try a different search term.</Text>
     )}

  </VStack>
 );

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
    p={{ base: 4, md: 8 }}
    pb={isMobile ? "80px" : 8}
   >
    <Box
     w="100%"
     maxW="1200px"
     mx="auto"
     bg={colorMode === 'dark' ? '#1A202C' : 'white'} 
     borderRadius="lg"
     p={{ base: 4, md: 8 }}
     boxShadow="lg"
    >
     {viewMode === 'create' && (
       <Flex justify="space-between" align="center" mb={8}>
        <Heading size="lg" color={colorMode === 'light' ? 'gray.800' : 'white'}>
         Post A Wave!
        </Heading>
        <Button
         onClick={() => setViewMode('search')}
         colorScheme="purple"
         leftIcon={<FiSearch />}
         display={{ base: 'none', md: 'inline-flex' }} 
        >
         Search Anime
        </Button>
        <IconButton
            onClick={() => setViewMode('search')}
            colorScheme="purple"
            aria-label="Search Anime"
            icon={<FiSearch />}
            display={{ base: 'inline-flex', md: 'none' }} 
        />
       </Flex>
     )}

     {viewMode === 'create' ? renderCreateView() : renderSearchView()}

    </Box>
   </Flex>
  </Box>
 );
};

export default CreatePage;