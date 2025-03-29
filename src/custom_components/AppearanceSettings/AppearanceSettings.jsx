import {
    Box,
    VStack,
    Heading,
    Button,
    Text,
    useColorMode,
    HStack,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

const AppearanceSettings = () => {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Box>
            <VStack spacing={8} align="stretch">
                <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                    Appearance Settings
                </Heading>

                <VStack spacing={6} align="stretch">
                    <Heading size="md" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                        Theme Settings
                    </Heading>
                    <Box>
                        <HStack spacing={4}>
                            <Button
                                size="lg"
                                h="60px"
                                w="200px"
                                variant={colorMode === 'light' ? 'solid' : 'outline'}
                                onClick={colorMode === 'dark' ? toggleColorMode : undefined}
                                leftIcon={<SunIcon />}
                                colorScheme={colorMode === 'dark' ? 'gray' : 'yellow'}
                                bg={colorMode === 'light' ? 'yellow.400' : 'transparent'}
                                color={colorMode === 'dark' ? 'white' : 'gray.800'}
                                _hover={{
                                    bg: colorMode === 'light' ? 'yellow.500' : 'whiteAlpha.200'
                                }}
                            >
                                Light Mode
                            </Button>
                            <Button
                                size="lg"
                                h="60px"
                                w="200px"
                                variant={colorMode === 'dark' ? 'solid' : 'outline'}
                                onClick={colorMode === 'light' ? toggleColorMode : undefined}
                                leftIcon={<MoonIcon />}
                                colorScheme={colorMode === 'dark' ? 'blue' : 'gray'}
                                bg={colorMode === 'dark' ? 'blue.400' : 'transparent'}
                                color={colorMode === 'light' ? 'gray.800' : 'white'}
                                _hover={{
                                    bg: colorMode === 'dark' ? 'blue.500' : 'blackAlpha.200'
                                }}
                            >
                                Dark Mode
                            </Button>
                        </HStack>
                    </Box>
                    <Text 
                        color={colorMode === 'dark' ? 'gray.400' : 'gray.600'} 
                        fontSize="sm"
                    >
                        {colorMode === 'dark' 
                            ? 'Currently using dark mode for a darker interface'
                            : 'Currently using light mode for a brighter interface'}
                    </Text>
                </VStack>
            </VStack>
        </Box>
    );
};

export default AppearanceSettings;