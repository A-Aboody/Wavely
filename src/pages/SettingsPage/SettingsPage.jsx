import React, { useState, useRef, useEffect } from 'react';
import { Box, VStack, Button, Heading, Flex, useBreakpointValue, IconButton, HStack, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, useDisclosure } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import AccountSettings from '../../custom_components/AccountSettings/AccountSettings';
import { useNavbar } from "../../context/NavbarContext";
import AppearanceSettings from '../../custom_components/AppearanceSettings/AppearanceSettings';
import NotificationSettings from '../../custom_components/NotificationSettings/NotificationSettings';
import PrivacySettings from '../../custom_components/PrivacySettings/PrivacySettings';
import { useColorMode } from '@chakra-ui/react';

const SettingsPage = () => {
    const [activeSection, setActiveSection] = useState('account');
    const { isNavbarOpen } = useNavbar();
    const { colorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const accountRef = useRef(null);
    const privacyRef = useRef(null);
    const notificationsRef = useRef(null);
    const appearanceRef = useRef(null);

    // Check if we're on mobile size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scrollToSection = (sectionRef, section) => {
        setActiveSection(section);
        sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (isMobile && isOpen) {
            onClose();
        }
    };

    const settingsSections = [
        { label: 'Account', ref: accountRef },
        { label: 'Privacy', ref: privacyRef },
        { label: 'Notifications', ref: notificationsRef },
        { label: 'Appearance', ref: appearanceRef }
    ];

    // Render setting section buttons
    const SettingButtons = () => (
        <VStack spacing={4} align="stretch">
            <Heading size="md" mb={4}>Settings</Heading>
            {settingsSections.map(({ label, ref }) => (
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
    );

    return (
        <Flex 
            w={{ base: "100%", md: isNavbarOpen ? "calc(100vw - 240px)" : "calc(100vw - 90px)" }}
            overflow="hidden"
            position="relative"
            transition="width 0.2s"
            bg={colorMode === 'dark' ? '#121212' : 'white'}
            // Add bottom padding on mobile for the bottom navbar
            pb={isMobile ? "70px" : "0"}
        >
            {/* Mobile Settings Drawer */}
            {isMobile && (
                <>
                    <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                        <DrawerOverlay />
                        <DrawerContent bg={colorMode === 'dark' ? '#121212' : 'white'}>
                            <DrawerHeader borderBottomWidth="1px">Settings Navigation</DrawerHeader>
                            <DrawerBody>
                                <SettingButtons />
                            </DrawerBody>
                        </DrawerContent>
                    </Drawer>
                </>
            )}

            {/* Desktop Sidebar Navigation */}
            {!isMobile && (
                <Box 
                    w={"250px"} 
                    borderRight="1px solid" 
                    borderColor="whiteAlpha.300" 
                    bg={colorMode === 'dark' ? '#121212' : 'white'}
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
                    <SettingButtons />
                </Box>
            )}

            {/* Content Area */}
            <Box 
                flex={1}
                h="100vh"
                p={{ base: 3, md: 6 }}
                bg={colorMode === 'dark' ? "#333e4b" : "gray.100"}
                position="relative"
                overflow="hidden"
            >
                {/* Mobile settings menu button */}
                {isMobile && (
                    <Box mb={4}>
                        <IconButton
                            icon={<FiMenu />}
                            onClick={onOpen}
                            aria-label="Open Settings Menu"
                            size="md"
                            variant="outline"
                            borderColor={colorMode === 'dark' ? "whiteAlpha.400" : "gray.300"}
                        />
                        <Heading size="md" ml={4} display="inline-block" verticalAlign="middle">
                            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                        </Heading>
                    </Box>
                )}

                <Box
                    borderRadius="lg"
                    w="100%"
                    h={isMobile ? "calc(100% - 60px)" : "100%"}
                    boxShadow="lg"
                    p={{ base: 4, md: 8 }}
                    bg={colorMode === 'dark' ? "#121212" : "white"}
                    overflowY="auto"
                    position="relative"
                    css={{
                        '&::-webkit-scrollbar': { display: 'none' },
                        'scrollbarWidth': 'none',
                        '-ms-overflow-style': 'none',
                    }}
                >
                    {/* Mobile section tabs at the top */}
                    {isMobile && (
                        <HStack
                            spacing={2}
                            overflowX="auto"
                            pb={4}
                            mb={4}
                            borderBottom="1px solid"
                            borderColor={colorMode === 'dark' ? "whiteAlpha.200" : "gray.200"}
                            css={{
                                '&::-webkit-scrollbar': { display: 'none' },
                                'scrollbarWidth': 'none',
                            }}
                        >
                            {settingsSections.map(({ label, ref }) => (
                                <Button
                                    key={label}
                                    variant={activeSection === label.toLowerCase() ? "solid" : "outline"}
                                    onClick={() => scrollToSection(ref, label.toLowerCase())}
                                    size="sm"
                                    flexShrink={0}
                                    colorScheme={activeSection === label.toLowerCase() ? "blue" : "gray"}
                                >
                                    {label}
                                </Button>
                            ))}
                        </HStack>
                    )}

                    <VStack spacing={20} align="stretch" pb={10} w="full">
                        <Box ref={accountRef}>
                            <AccountSettings />
                        </Box>

                        <Box ref={privacyRef}>
                            <PrivacySettings />
                        </Box>

                        <Box ref={notificationsRef}>
                            <NotificationSettings />
                        </Box>

                        <Box ref={appearanceRef}>
                            <AppearanceSettings />
                        </Box>
                    </VStack>
                </Box>
            </Box>
        </Flex>
    );
};

export default SettingsPage;