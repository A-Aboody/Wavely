import { 
    Box, 
    VStack, 
    FormControl, 
    FormLabel, 
    Input, 
    Button, 
    Heading, 
    Select,
    Divider,
    Text,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import { useNavbar } from "../../context/NavbarContext";
import { useRef } from 'react';
import { useColorMode } from "@chakra-ui/react";

const AccountSettings = () => {
    const { isNavbarOpen } = useNavbar();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
    const { colorMode } = useColorMode();

    return (
        <Box>
            <Box>
                <VStack spacing={8} align="stretch">
                    <Heading size="lg">Account Settings</Heading>
                    
                    {/* Personal Information Section */}
                    <VStack spacing={6} align="stretch">
                        <Heading size="md">Personal Information</Heading>
                        <FormControl>
                            <FormLabel fontSize="lg">Email</FormLabel>
                            <Input 
                                type="email" 
                                placeholder="Current email" 
                                bg="whiteAlpha.50"
                                size="lg"
                                height="60px"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="lg">Password</FormLabel>
                            <Input 
                                type="password" 
                                placeholder="********" 
                                bg="whiteAlpha.50"
                                size="lg"
                                height="60px"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="lg">Birth Date</FormLabel>
                            <Input 
                                type="date" 
                                bg="whiteAlpha.50"
                                size="lg"
                                height="60px"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="lg">Gender</FormLabel>
                            <Select 
                                placeholder="Select gender"
                                bg="whiteAlpha.50"
                                size="lg"
                                height="60px"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer-not">Prefer not to say</option>
                            </Select>
                        </FormControl>
                    </VStack>

                    {/* Regional Settings Section */}
                    <VStack spacing={6} align="stretch">
                        <Heading size="md">Regional Settings</Heading>
                        <FormControl>
                            <FormLabel fontSize="lg">Country/Region</FormLabel>
                            <Select 
                                placeholder="Select country"
                                bg="whiteAlpha.50"
                                size="lg"
                                height="60px"
                            >
                                <option value="us">United States</option>
                                <option value="uk">United Kingdom</option>
                                <option value="ca">Canada</option>
                                {/* Add more countries as needed */}
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="lg">Language</FormLabel>
                            <Select 
                                placeholder="Select language"
                                bg="whiteAlpha.50"
                                size="lg"
                                height="60px"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                {/* Add more languages as needed */}
                            </Select>
                        </FormControl>
                    </VStack>

                    <Button 
                        colorScheme="blue" 
                        size="lg" 
                        w="200px"
                        h="60px"
                        alignSelf="center"
                    >
                        Save Changes
                    </Button>

                    <Divider my={6} />

                    {/* Account Management Section */}
                    <VStack spacing={6} align="stretch">
                        <Heading size="md" color="red.400">Account Management</Heading>
                        <Text color="gray.400">
                            These actions cannot be undone. Please proceed with caution.
                        </Text>
                        <Box>
                            <Button 
                                colorScheme="orange" 
                                variant="outline"
                                size="lg"
                                h="60px"
                                mr={4}
                            >
                                Deactivate Account
                            </Button>
                            <Button 
                                colorScheme="red" 
                                variant="outline"
                                size="lg"
                                h="60px"
                                onClick={onOpen}
                            >
                                Delete Account
                            </Button>
                        </Box>
                    </VStack>
                </VStack>
            </Box>

            {/* Delete Account Confirmation Dialog */}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg={colorMode === 'light' ? 'white' : "#121212"}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold" color={colorMode === 'light' ? 'gray.800' : 'white'}>
                            Delete Account
                        </AlertDialogHeader>

                        <AlertDialogBody color={colorMode === 'light' ? 'gray.600' : 'gray.200'}>
                            Are you sure? This action cannot be undone. All your data will be permanently removed.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={onClose} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default AccountSettings;