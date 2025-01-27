import { Box, Container, Flex, Image, VStack } from "@chakra-ui/react"

const AuthPage = () => {
  return (
    <Flex minH={"100vh"} justifyContent={"center"} alignItems={"center"} px={4}>
      <Container maxW = {"container.md"} padding={0}>

        {/* Left hand side*/}
        <Box display = {{base:"none",md:"block"}}>
          <Image src="" h={0} alt="Image Id"/>
        </Box>

        {/* Right hand side*/}
        <VStack>
          
        </VStack>
      </Container>
    </Flex>
  )
}

export default AuthPage