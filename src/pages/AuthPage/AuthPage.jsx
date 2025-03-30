import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  IconButton,
  useColorMode,
  Image
} from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import AuthForm from "../../custom_components/AuthForm/AuthForm";
import { motion, useAnimation } from "framer-motion";

const AuthPage = () => {
  const { colorMode, setColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLogin, setIsLogin] = useState(true);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const controls = useAnimation();
  const waveContainerRef = useRef(null);
  
  const textOptions = [
    "Rate your everything",
    "Create your own waves", 
    "Share your experiences"
  ];

  // Wave configuration
  const waveColors = [
    { color: "#f3ebff", height: "80%", speed: "25s", offset: "0%" }, // lightest blue
    { color: "rgba(186, 230, 253, 0.7)", height: "70%", speed: "20s", offset: "5%" }, 
    { color: "rgba(144, 205, 244, 0.8)", height: "60%", speed: "15s", offset: "10%" },
    { color: "rgba(99, 179, 237, 0.9)", height: "50%", speed: "10s", offset: "15%" }, // darkest blue
  ];

  const TEXT_SECTION_HEIGHT = "40vh";
  const WAVE_INITIAL_OFFSET = "-15vh";
  const WAVE_HEIGHT = "100vh";
  const SCROLL_TRANSLATE_FACTOR = 200;

  useEffect(() => {
    const previousColorMode = colorMode;
    setColorMode('light');
    return () => {
      setColorMode(previousColorMode);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollPercentage = Math.min(scrollPosition / (windowHeight * 0.5), 1);
      
      if (waveContainerRef.current) {
        const translateY = -scrollPercentage * SCROLL_TRANSLATE_FACTOR;
        waveContainerRef.current.style.transform = `translateY(${translateY}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const textInterval = setInterval(() => {
      controls.start({ opacity: 0 })
        .then(() => {
          setCurrentTextIndex((prev) => (prev + 1) % textOptions.length);
          controls.start({ opacity: 1 });
        });
    }, 3500);

    return () => clearInterval(textInterval);
  }, [controls]);

  useEffect(() => {
    controls.start({ opacity: 1 });
  }, [controls]);

  const handleAuthClick = (loginMode) => {
    setIsLogin(loginMode);
    onOpen();
  };

  return (
    <Box 
      position="relative" 
      minH="100vh" 
      overflow="hidden"
      bg="white"
      width="100vw"
      maxWidth="100%"
    >
      {/* Navigation Bar */}
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding={{ base: "1rem", md: "1.5rem" }}
        position="sticky"
        top="0"
        zIndex="10"
        bg="white"
        px={{ base: 4, md: 8, lg: 12, xl: 20 }}
        boxShadow="sm"
        width="100%"
      >
        <Flex align="center" mr={5} gap={3}>
          <Image
            src="/Wavely-Logo.png"
            alt="Wavely Logo"
            height={{ base: "40px", md: "50px", lg: "60px" }}
            width="auto"
            objectFit="contain"
          />
          <Text 
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }} 
            fontWeight="bold" 
            color="rgba(99, 179, 237, 0.9)"
            letterSpacing="tight"
          >
            Wavely
          </Text>
        </Flex>

        <Flex>
          <HStack spacing={{ base: 2, md: 4 }}>
            <Button 
              colorScheme="blue" 
              borderRadius="full"
              size={{ base: "sm", md: "md" }}
              onClick={() => handleAuthClick(true)}
            >
              Log in
            </Button>
            <Button 
              variant="outline" 
              borderRadius="full"
              size={{ base: "sm", md: "md" }}
              onClick={() => handleAuthClick(false)}
            >
              Sign up
            </Button>
          </HStack>
        </Flex>
      </Flex>

      {/* Main Content Area */}
      <Box
        w="100%"
        minH="calc(100vh - 100px)"
        position="relative"
        overflow="hidden"
      >
        {/* Text Content - positioned with margin-bottom for gap */}
        <Box 
          w="100%"
          h={TEXT_SECTION_HEIGHT}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          zIndex="2"
          position="relative"
          px={{ base: 4, md: 8 }}
          mb="5vh"
        >
          <Text 
            fontSize={{ base: "2xl", sm: "3xl", md: "5xl", lg: "6xl" }} 
            fontWeight="bold" 
            textAlign="center"
            color="#121212"
            px={2}
            lineHeight="1.1"
          >
            On <Text as="span" color="rgba(99, 179, 237, 0.9)">Wavely</Text>, you can
          </Text>
          <motion.div
            animate={controls}
            initial={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Text 
              fontSize={{ base: "3xl", sm: "4xl", md: "6xl", lg: "7xl" }} 
              fontWeight="bold" 
              textAlign="center"
              color="#3c70bb"
              px={2}
              textShadow="1px 1px 3px rgba(0,0,0,0.1)"
              lineHeight="1.1"
              mt={4}
            >
              {textOptions[currentTextIndex]}
            </Text>
          </motion.div>
        </Box>

        {/* Wave Container - positioned with initial offset */}
        <Box
          ref={waveContainerRef}
          position="absolute"
          left="0"
          width="100%"
          height={WAVE_HEIGHT}
          zIndex="1"
          bottom={WAVE_INITIAL_OFFSET} // Initial position (negative = partially hidden)
          transition="transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)"
          overflow="hidden"
        >
          {/* Wave layers */}
          {waveColors.map((wave, index) => (
            <Box
              key={index}
              position="absolute"
              width="200%"
              height={wave.height}
              bottom={wave.offset}
              left="0"
              bg={wave.color}
              borderRadius="50%"
              transform={`translateX(-25%)`}
              sx={{
                animation: `wave${index} ${wave.speed} ease-in-out infinite`,
                [`@keyframes wave${index}`]: {
                  "0%": {
                    transform: "translateX(-25%) scaleY(1.1)",
                    borderRadius: "50% 50% 40% 60% / 70% 70% 30% 30%"
                  },
                  "50%": {
                    transform: "translateX(-30%) scaleY(0.9)",
                    borderRadius: "50% 50% 60% 40% / 30% 30% 70% 70%"
                  },
                  "100%": {
                    transform: "translateX(-25%) scaleY(1.1)",
                    borderRadius: "50% 50% 40% 60% / 70% 70% 30% 30%"
                  }
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Bottom Content Section */}
      <Box 
        position="relative" 
        bg='white'
        py={{ base: 10, md: 24, lg: 32 }}
        zIndex="5"
        minH={{ md: "100vh" }}
        display="flex"
        alignItems="center"
        w="100%"
        mx={0}
      >
        <Box 
          w="100%" 
          px={{ base: 4, md: 8, lg: 12, xl: 20 }}
        >
          <Flex 
            direction={{ base: "column", lg: "row" }} 
            justify="space-between"
            align="center"
            gap={{ base: 6, md: 10, lg: 20 }}
          >
            <Box flex="1" maxW={{ lg: "60%" }}>
              <Text
                fontSize={{ base: "2xl", sm: "3xl", md: "5xl", lg: "6xl" }}
                fontWeight="bold"
                lineHeight="1.1"
                mb={{ base: 4, md: 6, lg: 8 }}
                textAlign={{ base: "center", lg: "left" }}
                color='black'
              >
                Join Wavely today and discover your vibe
              </Text>
              <Text 
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }} 
                color="black" 
                maxW={{ lg: "800px" }}
                textAlign={{ base: "center", lg: "left" }}
                lineHeight="1.5"
              >
                Connect with like-minded people, share your waves, and ride the trends. Inspiration is just a wave away. Find your community and explore endless possibilities on Wavely.
              </Text>
            </Box>
            
            <Box 
              flex={{ lg: "0 0 auto" }}
              maxW={{ base: "100%", sm: "450px", lg: "480px" }}
              w="full"
              boxShadow="2xl"
              borderRadius="xl"
              overflow="hidden"
              mt={{ base: 6, lg: 0 }}
              mx={{ base: "auto", lg: 0 }}
              bg="white"
            >
              <AuthForm />
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* Auth Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent 
          borderRadius="xl"
          overflow="hidden"
          mx={4}
          my="auto"
          maxH={{ base: "90vh", md: "auto" }}
          position="relative"
        >
          <Box 
            position="absolute"
            top={2}
            right={2}
            zIndex={2}
          >
            <IconButton
              icon={<FiX />}
              onClick={onClose}
              variant="ghost"
              size="sm"
              borderRadius="full"
              aria-label="Close modal"
            />
          </Box>
          <AuthForm initialMode={isLogin} />
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AuthPage;