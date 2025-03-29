import {
    Box,
    VStack,
    Heading,
    FormControl,
    FormLabel,
    Switch,
    Text,
    Divider,
    useColorMode,
    Stack,
} from '@chakra-ui/react';

const NotificationSettings = () => {
    const { colorMode } = useColorMode();

    const notificationTypes = [
        {
            title: "Push Notifications",
            description: "Receive notifications even when you're not using the app",
            id: "push"
        },
        {
            title: "Email Notifications",
            description: "Get updates and alerts via email",
            id: "email"
        },
        {
            title: "New Followers",
            description: "When someone follows your profile",
            id: "followers"
        },
        {
            title: "New Comments",
            description: "When someone comments on your uploads",
            id: "comments"
        },
        {
            title: "Mentions",
            description: "When someone mentions you in a comment",
            id: "mentions"
        },
        {
            title: "Direct Messages",
            description: "When you receive a new message",
            id: "messages"
        }
    ];

    return (
        <Box>
            <VStack spacing={8} align="stretch">
                <Heading size="lg" color={colorMode === 'light' ? 'gray.800' : 'white'}>
                    Notification Settings
                </Heading>

                {/* General Notifications */}
                <VStack spacing={6} align="stretch">
                    <Heading size="md" color={colorMode === 'light' ? 'gray.800' : 'white'}>
                        General Notifications
                    </Heading>
                    
                    <Stack spacing={6}>
                        {notificationTypes.map((type) => (
                            <FormControl 
                                key={type.id}
                                display="flex" 
                                alignItems="center"
                                justifyContent="space-between"
                                bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'}
                                p={4}
                                borderRadius="md"
                            >
                                <Box>
                                    <FormLabel 
                                        htmlFor={type.id} 
                                        mb="0" 
                                        fontSize="lg"
                                        color={colorMode === 'light' ? 'gray.700' : 'white'}
                                    >
                                        {type.title}
                                    </FormLabel>
                                    <Text 
                                        fontSize="sm" 
                                        color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
                                    >
                                        {type.description}
                                    </Text>
                                </Box>
                                <Switch
                                    id={type.id}
                                    size="lg"
                                    colorScheme="blue"
                                />
                            </FormControl>
                        ))}
                    </Stack>
                </VStack>

                <Divider />

                {/* Email Preferences */}
                <VStack spacing={6} align="stretch">
                    <Heading size="md" color={colorMode === 'light' ? 'gray.800' : 'white'}>
                        Email Preferences
                    </Heading>
                    <FormControl 
                        display="flex" 
                        alignItems="center"
                        justifyContent="space-between"
                        bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'}
                        p={4}
                        borderRadius="md"
                    >
                        <Box>
                            <FormLabel 
                                htmlFor="marketing" 
                                mb="0" 
                                fontSize="lg"
                                color={colorMode === 'light' ? 'gray.700' : 'white'}
                            >
                                Marketing Emails
                            </FormLabel>
                            <Text 
                                fontSize="sm" 
                                color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
                            >
                                Receive updates about new features and promotions
                            </Text>
                        </Box>
                        <Switch
                            id="marketing"
                            size="lg"
                            colorScheme="blue"
                        />
                    </FormControl>
                </VStack>
            </VStack>
        </Box>
    );
};

export default NotificationSettings;