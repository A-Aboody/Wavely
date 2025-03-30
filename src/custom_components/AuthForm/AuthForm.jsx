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
  
  const AuthForm = ({ initialMode = true }) => {
    const [isLogin, setIsLogin] = useState(initialMode);
    const navigate = useNavigate();
    const { colorMode } = useColorMode();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const initialRef = useRef();
    
    // Update login/signup mode if passed from parent
    useEffect(() => {
      setIsLogin(initialMode);
    }, [initialMode]);
    
    const [inputs, setInputs] = useState({
      email: '',
      password: '',
      confirmPassword: ''
    });
  
    const handleAuth = () => {
      if (!inputs.email || !inputs.password) {
        alert("Please fill out all fields to continue");
        return;
      }
      
      if (!isLogin && inputs.password !== inputs.confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      
      navigate("/");
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
            color="black" // Added this line
        >
            {isLogin ? "Sign in to Wavely" : "Join Wavely"}
        </Heading>
        <Text 
            fontSize="md" 
            color="black" // Changed from gray.500
            textAlign="center" 
            px={4}
        >
            {isLogin 
            ? "Enter your details to access your Wavely account" 
            : "Create an account and start sharing your waves"}
        </Text>
        </VStack>
  
        <VStack spacing={5}>
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
            w="full"
            colorScheme="blue"
            size="lg"
            fontSize="md"
            onClick={handleAuth}
            borderRadius="md"
            mt={2}
            leftIcon={isLogin ? <FiLogIn /> : <FiUserPlus />}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
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