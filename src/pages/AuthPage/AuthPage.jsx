import { Box, Container, Flex, Image, VStack } from "@chakra-ui/react";
import AuthForm from "../../custom_components/AuthForm/AuthForm";

const AuthPage = () => {
  return (
    <Flex minH={"100vh"} justifyContent={"center"} alignItems={"center"} px={4}>
      <Container maxW = {"container.md"} padding={0}>
        <Flex justifyContent={"center"} alignItems={"center"} gap={10}>
          {/* Left hand side*/}
          {/* <Box display = {{base:"none",md:"block"}}>
            <Image src="" h={0} alt="Image Id"/>
          </Box> */}

          {/* Right hand side*/}
          <VStack spacing={4} align={"stretch"}>
            <AuthForm />
            <Box textAlign={"center"}>
              Get The App!
            </Box>
            <Flex gap={5} justifyContent={"center"}>
              <Image h={10} alt="Image Id"/>
              <Image h={10} alt="Image Id"/>
            </Flex>
          </VStack>
        </Flex>
      </Container>
    </Flex>
  )
}

export default AuthPage