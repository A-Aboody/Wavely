import {
    Box,
    VStack,
    Heading,
    FormControl,
    FormLabel,
    Switch,
    Text,
    Select,
    Divider,
    useColorMode,
    Stack,
    Radio,
    RadioGroup,
} from '@chakra-ui/react';

const PrivacySettings = () => {
    const { colorMode } = useColorMode();

    return (
        <Box>
            <VStack spacing={8} align="stretch">
                <Heading size="lg" color={colorMode === 'light' ? 'gray.800' : 'white'}>
                    Privacy Settings
                </Heading>

                {/* Account Privacy */}
                <VStack spacing={6} align="stretch">
                    <Heading size="md" color={colorMode === 'light' ? 'gray.800' : 'white'}>
                        Account Privacy
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
                                htmlFor="private-account" 
                                mb="0" 
                                fontSize="lg"
                                color={colorMode === 'light' ? 'gray.700' : 'white'}
                            >
                                Private Account
                            </FormLabel>
                            <Text 
                                fontSize="sm" 
                                color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
                            >
                                Only approved followers can see your content
                            </Text>
                        </Box>
                        <Switch
                            id="private-account"
                            size="lg"
                            colorScheme="blue"
                        />
                    </FormControl>

                    <FormControl
                        bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'}
                        p={4}
                        borderRadius="md"
                    >
                        <FormLabel 
                            color={colorMode === 'light' ? 'gray.700' : 'white'}
                            fontSize="lg"
                        >
                            Who Can Message You
                        </FormLabel>
                        <RadioGroup defaultValue="followers">
                            <Stack spacing={4}>
                                <Radio value="everyone" colorScheme="blue">Everyone</Radio>
                                <Radio value="followers">Followers Only</Radio>
                                <Radio value="nobody">Nobody</Radio>
                            </Stack>
                        </RadioGroup>
                    </FormControl>
                </VStack>

                <Divider />

                {/* Content Visibility */}
                <VStack spacing={6} align="stretch">
                    <Heading size="md" color={colorMode === 'light' ? 'gray.800' : 'white'}>
                        Content Visibility
                    </Heading>
                    
                    <FormControl
                        bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'}
                        p={4}
                        borderRadius="md"
                    >
                        <FormLabel 
                            color={colorMode === 'light' ? 'gray.700' : 'white'}
                            fontSize="lg"
                        >
                            Default Upload Privacy
                        </FormLabel>
                        <Select 
                            size="lg"
                            bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'}
                            borderColor={colorMode === 'light' ? 'gray.200' : 'whiteAlpha.50'}
                        >
                            <option value="public">Public</option>
                            <option value="followers">Followers Only</option>
                            <option value="private">Private</option>
                        </Select>
                    </FormControl>

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
                                htmlFor="show-activity" 
                                mb="0" 
                                fontSize="lg"
                                color={colorMode === 'light' ? 'gray.700' : 'white'}
                            >
                                Activity Status
                            </FormLabel>
                            <Text 
                                fontSize="sm" 
                                color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
                            >
                                Show when you're active on Wavely
                            </Text>
                        </Box>
                        <Switch
                            id="show-activity"
                            size="lg"
                            colorScheme="blue"
                        />
                    </FormControl>
                </VStack>

                <Divider />

                {/* Data Usage */}
                <VStack spacing={6} align="stretch">
                    <Heading size="md" color={colorMode === 'light' ? 'gray.800' : 'white'}>
                        Data Usage
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
                                htmlFor="personalization" 
                                mb="0" 
                                fontSize="lg"
                                color={colorMode === 'light' ? 'gray.700' : 'white'}
                            >
                                Personalization
                            </FormLabel>
                            <Text 
                                fontSize="sm" 
                                color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
                            >
                                Allow data collection for personalized content
                            </Text>
                        </Box>
                        <Switch
                            id="personalization"
                            size="lg"
                            colorScheme="blue"
                        />
                    </FormControl>
                </VStack>
            </VStack>
        </Box>
    );
};

export default PrivacySettings;