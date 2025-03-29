import React, { useState, useRef } from 'react';
import { Box, VStack, Button, Heading, Flex, useBreakpointValue } from '@chakra-ui/react';
import AccountSettings from '../../custom_components/AccountSettings/AccountSettings';
import { useNavbar } from "../../context/NavbarContext";

const SettingsPage = () => {
    const [activeSection, setActiveSection] = useState('account');
    const sidebarWidth = useBreakpointValue({ base: "100px", md: "200px" });
    const { isNavbarOpen } = useNavbar();

    const accountRef = useRef(null);
    const privacyRef = useRef(null);
    const notificationsRef = useRef(null);
    const appearanceRef = useRef(null);

    const scrollToSection = (sectionRef, section) => {
        setActiveSection(section);
        sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Flex 
            w="100%"
            maxW="100vw"
            minH="100vh"
            overflow="hidden"
            position="relative"
            transition="width 0.2s"
        >
            {/* Sidebar Navigation */}
            <Box 
                w={sidebarWidth} 
                minW={sidebarWidth}
                borderRight="1px solid" 
                borderColor="whiteAlpha.300" 
                flexShrink={0} 
                p={4}
                position="sticky"
                top={0}
                h="100vh"
                zIndex={10}
                overflowY="auto"
                css={{
                    '&::-webkit-scrollbar': { display: 'none' },
                    'scrollbarWidth': 'none',
                    '-ms-overflow-style': 'none',
                }}
            >
                <VStack spacing={4} align="stretch">
                    <Heading size="md" mb={4}>Settings</Heading>
                    {[
                        { label: 'Account', ref: accountRef },
                        { label: 'Privacy', ref: privacyRef },
                        { label: 'Notifications', ref: notificationsRef },
                        { label: 'Appearance', ref: appearanceRef }
                    ].map(({ label, ref }) => (
                        <Button
                            key={label}
                            variant={activeSection === label.toLowerCase() ? "solid" : "ghost"}
                            onClick={() => scrollToSection(ref, label.toLowerCase())}
                            justifyContent="flex-start"
                            w="full"
                            color={activeSection === label.toLowerCase() && "#578bdd"}
                            _hover={{ bg: "whiteAlpha.200" }}
                        >
                            {label}
                        </Button>
                    ))}
                </VStack>
            </Box>

            {/* Content Area */}
            <Box 
                flex={1}
                minH="100vh"
                p={6}
                bg="#333e4b"
                position="relative"
                overflow="hidden"
            >
                <Box
                    borderRadius="lg"
                    w="100%"
                    h="100%"
                    maxW="1200px"
                    mx="auto"
                    boxShadow="lg"
                    p={8}
                    bg="#121212"
                    overflowY="auto"
                    position="relative"
                    css={{
                        '&::-webkit-scrollbar': { display: 'none' },
                        'scrollbarWidth': 'none',
                        '-ms-overflow-style': 'none',
                    }}
                >
                    <VStack spacing={20} align="stretch" pb={10} w="full">
                        <Box ref={accountRef}>
                            <AccountSettings />
                        </Box>

                        <Box ref={privacyRef}>
                            <Heading size="lg" mb={6}>Privacy Settings</Heading>
                            {/* Privacy content here */}
                        </Box>

                        <Box ref={notificationsRef}>
                            <Heading size="lg" mb={6}>Notification Settings</Heading>
                            {/* Notifications content here */}
                        </Box>

                        <Box ref={appearanceRef}>
                            <Heading size="lg" mb={6}>Appearance Settings</Heading>
                            {/* Appearance content here */}
                        </Box>
                    </VStack>
                </Box>
            </Box>
        </Flex>
    );
};

export default SettingsPage;
