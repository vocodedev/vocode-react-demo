import "@fontsource/inter";
import "./App.css";

import {
  Box,
  ChakraProvider,
  Flex,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import DarkModeProvider from "./DarkModeProvider";
import Conversation from "./Conversation";

import { isIE, isMobile } from "react-device-detect";
import { WarningIcon } from "@chakra-ui/icons";

const App = () => {
  return (
    <ChakraProvider>
      <DarkModeProvider>
        <Flex height={"100vh"} align={"center"} direction="column">
          <Spacer />
          <Box height={"70vh"}>
            {!(!isIE && !isMobile) ? (
              <Conversation />
            ) : (
              <VStack>
                <WarningIcon boxSize={100} />
                <Text paddingTop={4}>
                  This demo only works with Chrome on computer!
                </Text>
              </VStack>
            )}
          </Box>
        </Flex>
      </DarkModeProvider>
    </ChakraProvider>
  );
};

export default App;
