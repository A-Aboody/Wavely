import { Avatar, Box, Flex, Icon, Link, IconButton, VStack, Tooltip, useDisclosure, Image } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiHome, FiMusic, FiSettings, FiMenu, FiX, FiPlusCircle, FiUser, FiUpload, FiLogOut } from "react-icons/fi";
import { useNavbar } from "../../context/NavbarContext";


const Navbar = () => {
  const { isNavbarOpen, setIsNavbarOpen } = useNavbar();

  const onToggle = () => setIsNavbarOpen(!isNavbarOpen);

  const navItems = [
    { icon: FiPlusCircle, label: 'Create', path: '/' },
    { icon: FiUser, label: 'Profile', path: '/profile' },
    { icon: FiUpload, label: 'All Uploads', path: '/uploads' },
    { icon: FiSettings, label: 'Settings', path: '/settings' },
  ];

  return (
    <Box
      height={"100vh"}
      borderRight={"1px solid"}
      borderColor={"whiteAlpha.300"}
      py={8}
      position={"sticky"}
      top={0}
      left={0}
      px={{base: 2, md: 4}}
      width={isNavbarOpen ? "240px" : "90px"}
      transition="width 0.2s"
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
            <Image
              src="/Wavely-Logo.png"
              alt="Logo"
              width="100%"
              height="auto"
              objectFit="contain"
            />
          </Box>
          {isNavbarOpen && (
            <Box
              fontSize="sm"
              color="whiteAlpha.900"
              textAlign="center"
              whiteSpace="nowrap"
            >
              @username
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
                _hover={{ bg: "whiteAlpha.200" }}
              >
                <Icon as={item.icon} boxSize={5} />
                {isNavbarOpen && (
                  <Box ml={3} display={isNavbarOpen ? "block" : "none"}>
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