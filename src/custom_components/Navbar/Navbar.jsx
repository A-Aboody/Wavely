import { Avatar, Box, Flex, Icon, Link, IconButton, VStack, Tooltip, useDisclosure, Image, Modal, ModalOverlay, ModalContent, ModalBody, Button, Center } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiHome, FiMusic, FiSettings, FiMenu, FiX, FiPlusCircle, FiUser, FiUpload, FiLogOut, FiFile } from "react-icons/fi";
import { useNavbar } from "../../context/NavbarContext";
import { useColorMode } from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 

const Navbar = () => {
  const { isNavbarOpen, setIsNavbarOpen } = useNavbar();
  const { colorMode } = useColorMode();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [profileData, setProfileData] = useState(() => {
    const savedData = localStorage.getItem('profileData');
    return savedData ? JSON.parse(savedData) : {
      username: 'aa.a021',
      displayName: 'adubla',
      profileImage: '/api/placeholder/200/200'
    };
  });

  // Reordered navigation items
  const navItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiFile, label: 'Uploads', path: '/uploads' },
    { icon: FiPlusCircle, label: 'Create', path: '/create' },
    { icon: FiUser, label: 'Profile', path: '/profile' },
    { icon: FiSettings, label: 'Settings', path: '/settings', mobileAction: onOpen },
  ];

  const onToggle = () => setIsNavbarOpen(!isNavbarOpen);

  // Listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-close the navbar when switching to mobile
      if (mobile && isNavbarOpen) {
        setIsNavbarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isNavbarOpen, setIsNavbarOpen]);

  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  // Mobile settings modal
  const MobileSettingsModal = () => (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent width="80%" maxWidth="300px" borderRadius="xl">
        <ModalBody py={6}>
          <VStack spacing={4}>
            <Button 
              as={RouterLink} 
              to="/settings" 
              width="100%" 
              leftIcon={<FiSettings />}
              onClick={onClose}
            >
              Settings
            </Button>
            <Button 
              as={RouterLink} 
              to="/auth" 
              width="100%" 
              leftIcon={<FiLogOut />}
              variant="outline"
              onClick={onClose}
            >
              Logout
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  // Render different navbar based on screen size
  if (isMobile) {
    return (
      <>
        <Box
          className="navbar-mobile"
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          height="70px"
          borderTop="1px solid"
          borderColor={colorMode === 'light' ? "blackAlpha.200" : "whiteAlpha.300"}
          bg={colorMode === 'light' ? "white" : "gray.900"}
          zIndex={10}
        >
          <Flex 
            justifyContent="space-around" 
            alignItems="center" 
            height="100%" 
            px={2}
          >
            {navItems.map((item) => (
              <Box 
                key={item.path}
                as={item.mobileAction && item.label === 'Settings' ? 'button' : RouterLink}
                to={!item.mobileAction ? item.path : undefined}
                onClick={item.mobileAction || undefined}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                width="20%"
              >
                <Icon 
                  as={item.icon} 
                  boxSize={6}
                  color={isLinkActive(item.path) ? "#578bdd" : "inherit"} 
                  mb={1}
                />
                <Box 
                  fontSize="xs" 
                  fontWeight={isLinkActive(item.path) ? "medium" : "normal"}
                  color={isLinkActive(item.path) ? "#578bdd" : "inherit"}
                >
                  {item.label}
                </Box>
              </Box>
            ))}
          </Flex>
        </Box>
        <MobileSettingsModal />
        {/* Add padding to the bottom of your page content to account for the navbar */}
        <Box height="70px" width="100%" />
      </>
    );
  }

  // Desktop sidebar layout
  return (
    <Box
      className="navbar-desktop"
      height="100vh"
      borderRight="1px solid"
      borderColor={colorMode === 'light' ? "blackAlpha.200" : "whiteAlpha.300"}
      boxShadow={colorMode === 'light' ? "1px 0 2px rgba(0, 0, 0, 0.05)" : "none"}
      py={8}
      position="sticky"
      top={0}
      left={0}
      px={{base: 2, md: 4}}
      width={isNavbarOpen ? "240px" : "90px"}
      transition="width 0.2s"
      bg={colorMode === 'light' ? "white" : "transparent"}
    >
      <Flex direction="column" gap={10} w="full" height="full">
        {/* Toggle Button*/}
        <IconButton
          aria-label="Toggle Navigation"
          icon={isNavbarOpen ? <FiX /> : <FiMenu />}
          onClick={onToggle}
          variant="ghost"
          size="md"
          position="relative"
          left={isNavbarOpen ? "auto" : "0"}
          alignSelf="center"
        />

        {/* Logo and Username Section */}
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box 
            display="flex" 
            justifyContent="center"
            width="60px"
            minWidth="60px"
            mx="auto"
          >
          <Avatar
            src={profileData.profileImage}
            name={profileData.displayName}
            size="lg"
            border="3px solid"
            borderColor={colorMode === 'light' ? "gray.200" : "whiteAlpha.300"}
          />
          </Box>
          {isNavbarOpen && (
            <Box
              fontSize="md"
              fontWeight="medium"
              color={colorMode === 'light' ? "gray.800" : "whiteAlpha.900"}
              textAlign="center"
              whiteSpace="nowrap"
            >
              @{profileData.username}
            </Box>
          )}
        </Box>

        {/* Spacer */}
        <Box flex="1" />

        {/* Navigation Links */}
        <VStack spacing={6} align="stretch">
          {navItems.map((item) => (
            <Tooltip
              key={item.path}
              label={!isNavbarOpen ? item.label : ""}
              placement="right"
              hasArrow
            >
              <Link
                as={RouterLink}
                to={item.path}
                display="flex"
                alignItems="center"
                px={3}
                py={2}
                borderRadius="md"
                bg={isLinkActive(item.path) ? "whiteAlpha.200" : "transparent"}
                color={isLinkActive(item.path) ? "#578bdd" : "inherit"}
                _hover={{ bg: "whiteAlpha.200" }}
              >
              <Icon 
                as={item.icon} 
                boxSize={5}
                color={isLinkActive(item.path) ? "#578bdd" : "inherit"} 
              />
                {isNavbarOpen && (
                  <Box 
                    ml={3} 
                    display={isNavbarOpen ? "block" : "none"}
                    fontWeight={isLinkActive(item.path) ? "medium" : "normal"}
                  >
                    {item.label}
                  </Box>
                )}
              </Link>
            </Tooltip>
          ))}
        </VStack>

        {/* Spacer */}
        <Box flex="1" />

        {/* Logout Button - Fixed at Bottom */}
        <Tooltip
          label={!isNavbarOpen ? "Logout" : ""}
          placement="right"
          hasArrow
        >
          <Link
            as={RouterLink}
            to="/auth"
            display="flex"
            alignItems="center"
            px={3}
            py={2}
            borderRadius="md"
            _hover={{ bg: "whiteAlpha.200" }}
            mt="auto"
          >
            <Icon as={FiLogOut} boxSize={5} />
            {isNavbarOpen && (
              <Box ml={3} display={isNavbarOpen ? "block" : "none"}>
                Logout
              </Box>
            )}
          </Link>
        </Tooltip>
      </Flex>
    </Box>
  );
};

export default Navbar;