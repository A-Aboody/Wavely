import { Box, Flex } from "@chakra-ui/react";
import Navbar from "../../custom_components/Navbar/Navbar";
import { useLocation } from "react-router-dom";
import { useNavbar } from "../../context/NavbarContext";

function PageLayout({ children }) {
    const { pathname } = useLocation();
    const { isNavbarOpen } = useNavbar();

    return (
        <Flex>
            {pathname !== "/auth" ? (
                <Box>
                    <Navbar />
                </Box>
            ) : null}

            <Box>
                {children}
            </Box>
        </Flex>
    );
}

export default PageLayout;