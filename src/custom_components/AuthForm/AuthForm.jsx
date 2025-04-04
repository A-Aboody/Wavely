import {
  Box,
  Button,
  Flex,
  Image,
  Input,
  Text,
  VStack,
  Heading,
  useColorMode,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Icon,
  Divider,
  HStack,
  Avatar
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiUserPlus } from "react-icons/fi";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../Firebase/firebase";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

const AuthForm = ({ initialMode = true }) => {
  const [isLogin, setIsLogin] = useState(initialMode);
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const initialRef = useRef();

  const [inputs, setInputs] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '' // Added username field
  });
  
  // Update login/signup mode if passed from parent
  useEffect(() => {
    setIsLogin(initialMode);
  }, [initialMode]);
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!inputs.email || !inputs.password) {
      setError("Please fill out all fields to continue");
      setLoading(false);
      return;
    }
    
    if (!isLogin && inputs.password !== inputs.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    try {
      if (isLogin) {
        // Handle login
        await signInWithEmailAndPassword(auth, inputs.email, inputs.password);
      } else {
        // Handle registration
        const userCredential = await createUserWithEmailAndPassword(auth, inputs.email, inputs.password);
        const user = userCredential.user;
        
        // Create user document in Firestore with added bannerImage field
        await setDoc(doc(db, "users", user.uid), {
          email: inputs.email,
          username: inputs.username || inputs.email.split('@')[0],
          displayName: inputs.username || inputs.email.split('@')[0],
          profileImage: '', // Default empty
          bannerImage: '', // Default empty
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          uid: user.uid
        });
        
        // Store basic user data in localStorage
        localStorage.setItem('profileData', JSON.stringify({
          username: inputs.username || inputs.email.split('@')[0],
          displayName: inputs.username || inputs.email.split('@')[0],
          profileImage: '',
          uid: user.uid
        }));
      }
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      w="100%" 
      bg={colorMode === 'dark' ? "#333e4b" : 'white'}
      p={8}
      pb={6}
    >
      <VStack spacing={6} mb={8} align="center">
        <Avatar src='/Wavely-Logo.png' size="2xl" background="transparent" />
        <Heading 
            size="lg" 
            textAlign="center" 
            fontWeight="bold" 
            letterSpacing="tight"
            color="black"
        >
            {isLogin ? "Sign in to Wavely" : "Join Wavely"}
        </Heading>
        <Text 
            fontSize="md" 
            color="black"
            textAlign="center" 
            px={4}
        >
            {isLogin 
            ? "Enter your details to access your Wavely account" 
            : "Create an account and start sharing your waves"}
        </Text>
      </VStack>

      <form onSubmit={handleRegister}>
        <VStack spacing={5}>
          {error && (
            <Text color="red.500" fontSize="sm" w="full" textAlign="center">
              {error}
            </Text>
          )}
          
          {!isLogin && (
            <FormControl>
              <FormLabel fontWeight="medium" fontSize="sm">Username</FormLabel>
              <InputGroup>
                <Input
                  placeholder="Choose a username"
                  value={inputs.username}
                  onChange={(e) => setInputs({...inputs, username: e.target.value})}
                  type="text"
                  borderRadius="md"
                  bg="gray.50"
                  fontSize="md"
                  size="lg"
                  autoComplete="off"
                />
              </InputGroup>
            </FormControl>
          )}
          
          <FormControl>
            <FormLabel fontWeight="medium" fontSize="sm">Email</FormLabel>
            <InputGroup>
              <Input
                ref={initialRef}
                placeholder="you@example.com"
                value={inputs.email}
                onChange={(e) => setInputs({...inputs, email: e.target.value})}
                type="email"
                borderRadius="md"
                bg="gray.50"
                fontSize="md"
                size="lg"
                autoComplete="off"
                pl={10}
              />
              <InputRightElement pointerEvents="none" height="full" ml={1} mr={1}>
                <Icon as={FiMail} color="gray.500" />
              </InputRightElement>
            </InputGroup>
          </FormControl>
  
          <FormControl>
            <FormLabel fontWeight="medium" fontSize="sm">Password</FormLabel>
            <InputGroup>
              <Input
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={inputs.password}
                onChange={(e) => setInputs({...inputs, password: e.target.value})}
                borderRadius="md"
                bg={colorMode === 'dark' ? "gray.700" : "gray.50"}
                fontSize="md"
                size="lg"
                pl={10}
              />
              <InputRightElement width="4.5rem" height="full">
                <Button
                  h="1.75rem"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon as={showPassword ? FiEyeOff : FiEye} color="gray.500" />
                </Button>
              </InputRightElement>
              <InputRightElement pointerEvents="none" height="full" ml={1} mr={12}>
                <Icon as={FiLock} color="gray.500" />
              </InputRightElement>
            </InputGroup>
          </FormControl>
  
          {!isLogin && (
            <FormControl>
              <FormLabel fontWeight="medium" fontSize="sm">Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  placeholder="••••••••"
                  type={showConfirmPassword ? "text" : "password"}
                  value={inputs.confirmPassword}
                  onChange={(e) => setInputs({...inputs, confirmPassword: e.target.value})}
                  borderRadius="md"
                  bg={colorMode === 'dark' ? "gray.700" : "gray.50"}
                  fontSize="md"
                  size="lg"
                  pl={10}
                />
                <InputRightElement width="4.5rem" height="full">
                  <Button
                    h="1.75rem"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon as={showConfirmPassword ? FiEyeOff : FiEye} color="gray.500" />
                  </Button>
                </InputRightElement>
                <InputRightElement pointerEvents="none" height="full" ml={1} mr={12}>
                  <Icon as={FiLock} color="gray.500" />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          )}
  
          {isLogin && (
            <Flex w="100%" justify="flex-end">
              <Text fontSize="sm" color="blue.400" cursor="pointer" fontWeight="medium">
                Forgot password?
              </Text>
            </Flex>
          )}
  
          <Button
            type="submit"
            w="full"
            colorScheme="blue"
            size="lg"
            fontSize="md"
            borderRadius="md"
            mt={2}
            leftIcon={isLogin ? <FiLogIn /> : <FiUserPlus />}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
            isLoading={loading}
            loadingText={isLogin ? "Signing in..." : "Creating account..."}
          >
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
  
          <HStack my={4} w="full">
            <Divider borderColor={colorMode === 'dark' ? "gray.600" : "gray.300"} />
            <Text fontSize="sm" fontWeight="medium" color="gray.500" px={2}>
              OR
            </Text>
            <Divider borderColor={colorMode === 'dark' ? "gray.600" : "gray.300"} />
          </HStack>
  
          <Button
            w="full"
            variant="outline"
            borderRadius="md"
            size="lg"
            leftIcon={<Image src="/google.png" w={5} h={5} alt="Google" />}
            borderColor={colorMode === 'dark' ? "gray.600" : "gray.300"}
            _hover={{
              bg: colorMode === 'dark' ? "whiteAlpha.100" : "gray.50",
              borderColor: colorMode === 'dark' ? "gray.500" : "gray.400"
            }}
          >
            Continue with Google
          </Button>
        </VStack>
      </form>
      
      <Flex
        mt={4}
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="sm" color={colorMode === 'dark' ? "gray.400" : "gray.600"}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </Text>
        <Button
          variant="link"
          ml={2}
          colorScheme="blue"
          fontWeight="semibold"
          fontSize="sm"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Sign Up" : "Sign In"}
        </Button>
      </Flex>
    </Box>
  );
};

export default AuthForm;