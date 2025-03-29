import { Avatar, Box, Flex, Icon, Link, IconButton, VStack, Tooltip, useDisclosure, Image } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiHome, FiMusic, FiSettings, FiMenu, FiX, FiPlusCircle, FiUser, FiUpload, FiLogOut, FiFile } from "react-icons/fi";
import { useNavbar } from "../../context/NavbarContext";
import { useColorMode } from "@chakra-ui/react";
import { useState } from 'react';
import { useLocation } from 'react-router-dom'; 

const Navbar = () => {
  const { isNavbarOpen, setIsNavbarOpen } = useNavbar();
  const { colorMode } = useColorMode();
  const location = useLocation();

  const [profileData, setProfileData] = useState(() => {
    const savedData = localStorage.getItem('profileData');
    return savedData ? JSON.parse(savedData) : {
      username: 'aa.a021',
      displayName: 'adubla',
      profileImage: '/api/placeholder/200/200'
    };
  });

  const onToggle = () => setIsNavbarOpen(!isNavbarOpen);

  const navItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiPlusCircle, label: 'Create', path: '/create' },
    { icon: FiUser, label: 'Profile', path: '/profile' },
    { icon: FiFile, label: 'All Uploads', path: '/uploads' },
    { icon: FiSettings, label: 'Settings', path: '/settings' },
  ];

  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Box
      className="navbar"
      height={"100vh"}
      borderRight={"1px solid"}
      borderColor={colorMode === 'light' ? "blackAlpha.200" : "whiteAlpha.300"}
      boxShadow={colorMode === 'light' ? "1px 0 2px rgba(0, 0, 0, 0.05)" : "none"}
      py={8}
      position={"sticky"}
      top={0}
      left={0}
      px={{base: 2, md: 4}}
      width={isNavbarOpen ? "240px" : "90px"}
      transition="width 0.2s"
      bg={colorMode === 'light' ? "white" : "transparent"}
    >
      <Flex direction={"column"} gap={10} w={"full"} height={"full"}>
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