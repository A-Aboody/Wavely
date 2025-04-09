import { 
  Avatar, 
  Box, 
  Flex, 
  Icon, 
  Link, 
  IconButton, 
  VStack, 
  Tooltip, 
  useDisclosure, 
  Image, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalBody, 
  Button, 
  useToast 
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { 
  FiHome, 
  FiMusic, 
  FiSettings, 
  FiMenu, 
  FiX, 
  FiPlusCircle, 
  FiUser, 
  FiUpload, 
  FiLogOut, 
  FiFile, 
  FiInbox, 
  FiMoreHorizontal 
} from "react-icons/fi";
import { useNavbar } from "../../context/NavbarContext";
import { useColorMode } from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import { useUser } from '../../context/UserContext';

const Navbar = () => {
  const { isNavbarOpen, setIsNavbarOpen } = useNavbar();
  const { colorMode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { currentUser, logout } = useUser();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate('/auth');
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const navItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiFile, label: 'Uploads', path: '/uploads' },
    { icon: FiPlusCircle, label: 'Create', path: '/create', isFeatured: true },
    { icon: FiUser, label: 'Profile', path: `/profile/${currentUser?.username}` },
    { icon: FiInbox, label: 'Inbox', path: '/inbox' },
  ];

  const mobileNavItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiFile, label: 'Uploads', path: '/uploads' },
    { icon: FiPlusCircle, label: 'Create', path: '/create', isFeatured: true },
    { icon: FiUser, label: 'Profile', path: `/profile/${currentUser?.username}` },
    { icon: FiMoreHorizontal, label: 'More', path: '#', mobileAction: onOpen },
  ];

  const onToggle = () => setIsNavbarOpen(!isNavbarOpen);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && isNavbarOpen) {
        setIsNavbarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isNavbarOpen, setIsNavbarOpen]);

  const isLinkActive = (path) => {
    return location.pathname === path || 
           (path.includes('/profile') && location.pathname.includes('/profile'));
  };

  const MobileSettingsModal = () => (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent width="80%" maxWidth="300px" borderRadius="xl">
        <ModalBody py={6}>
          <VStack spacing={4}>
            <Button 
              as={RouterLink} 
              to="/inbox" 
              width="100%" 
              leftIcon={<FiInbox />}
              onClick={onClose}
            >
              Inbox
            </Button>
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
              width="100%" 
              leftIcon={<FiLogOut />}
              variant="outline"
              onClick={() => {
                onClose();
                handleLogout();
              }}
              colorScheme="red"
            >
              Sign Out
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

if (isMobile) {
  return (
    <>
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        height="60px"
        borderTop="1px solid"
        borderColor={colorMode === 'light' ? "blackAlpha.200" : "whiteAlpha.300"}
        bg={colorMode === 'light' ? "white" : "gray.900"}
        zIndex={10}
      >
        <Flex justifyContent="space-around" alignItems="center" height="100%" px={2}>
          {mobileNavItems.map((item) => (
            <Box 
              key={item.label}
              as={item.mobileAction ? 'button' : RouterLink}
              to={!item.mobileAction ? item.path : undefined}
              onClick={item.mobileAction || undefined}
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="20%"
              position="relative"
            >
              {item.isFeatured ? (
                <Box
                  borderRadius="full"
                  bg="#578bdd"
                  p={3}
                  boxShadow="0 2px 10px rgba(0,0,0,0.2)"
                >
                  <Icon 
                    as={item.icon} 
                    boxSize={6}
                    color="white"
                  />
                </Box>
              ) : (
                <Icon 
                  as={item.icon} 
                  boxSize={6}
                  color={isLinkActive(item.path) ? "#578bdd" : "inherit"}
                />
              )}
            </Box>
          ))}
        </Flex>
      </Box>
      <MobileSettingsModal />
      <Box height="60px" width="100%" />
    </>
  );
}

  return (
    <Box
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

        {/* User Profile Section */}
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box width="60px" minWidth="60px" mx="auto">
            <Avatar
              src={currentUser?.profileImage}
              name={currentUser?.displayName}
              size="lg"
              border="3px solid"
              borderColor={colorMode === 'light' ? "gray.200" : "whiteAlpha.300"}
            />
          </Box>
          {isNavbarOpen && currentUser && (
            <Box
              fontSize="md"
              fontWeight="medium"
              color={colorMode === 'light' ? "gray.800" : "whiteAlpha.900"}
              textAlign="center"
              whiteSpace="nowrap"
            >
              @{currentUser.username}
            </Box>
          )}
        </Box>

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
          
          <Tooltip label={!isNavbarOpen ? "Settings" : ""} placement="right" hasArrow>
            <Link
              as={RouterLink}
              to="/settings"
              display="flex"
              alignItems="center"
              px={3}
              py={2}
              borderRadius="md"
              bg={isLinkActive("/settings") ? "whiteAlpha.200" : "transparent"}
              color={isLinkActive("/settings") ? "#578bdd" : "inherit"}
              _hover={{ bg: "whiteAlpha.200" }}
            >
              <Icon 
                as={FiSettings} 
                boxSize={5}
                color={isLinkActive("/settings") ? "#578bdd" : "inherit"} 
              />
              {isNavbarOpen && (
                <Box 
                  ml={3} 
                  display={isNavbarOpen ? "block" : "none"}
                  fontWeight={isLinkActive("/settings") ? "medium" : "normal"}
                >
                  Settings
                </Box>
              )}
            </Link>
          </Tooltip>
        </VStack>

        <Box flex="1" />

        {/* Logout Button */}
        <Tooltip label={!isNavbarOpen ? "Logout" : ""} placement="right" hasArrow>
          <Box
            as="button"
            display="flex"
            alignItems="center"
            px={3}
            py={2}
            borderRadius="md"
            color="red.500"
            _hover={{ bg: "red.100", color: "red.600" }}
            onClick={handleLogout}
            mt="auto"
            width="100%"
          >
            <Icon as={FiLogOut} boxSize={5} />
            {isNavbarOpen && (
              <Box ml={3} display={isNavbarOpen ? "block" : "none"}>
                Sign Out
              </Box>
            )}
          </Box>
        </Tooltip>
      </Flex>
    </Box>
  );
};

export default Navbar;