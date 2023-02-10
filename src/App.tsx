import "@fontsource/inter";
import "./App.css";

import { Box, ChakraProvider, Flex, Spacer } from "@chakra-ui/react";
import DarkModeProvider from "./DarkModeProvider";
import Conversation from "./Conversation";

const App = () => {
  return (
    <ChakraProvider>
      <DarkModeProvider>
        <Flex height={"100vh"} align={"center"} direction="column">
          <Spacer />
          <Box height={"70vh"}>
            <Conversation />
          </Box>
        </Flex>
      </DarkModeProvider>
    </ChakraProvider>
  );
};

export default App;
