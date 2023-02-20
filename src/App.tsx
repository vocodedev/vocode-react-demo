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
import { DeepgramTranscriberConfig } from "./types/vocode/transcriber";
import { LLMAgentConfig } from "./types/vocode/agent";
import {
  AzureSynthesizerConfig,
  SynthesizerConfig,
} from "./types/vocode/synthesizer";

const App = () => {
  const transcriberConfig: Omit<
    DeepgramTranscriberConfig,
    "samplingRate" | "audioEncoding"
  > = {
    type: "deepgram",
    chunkSize: 2048,
  };
  const agentConfig: LLMAgentConfig = {
    type: "llm",
    promptPreamble: "The AI is having a pleasant conversation about life.",
  };
  const synthesizerConfig: Omit<
    AzureSynthesizerConfig,
    "samplingRate" | "audioEncoding"
  > = {
    type: "azure",
  };

  return (
    <ChakraProvider>
      <DarkModeProvider>
        <Flex height={"100vh"} align={"center"} direction="column">
          <Spacer />
          <Box height={"70vh"}>
            {!isIE && !isMobile ? (
              <Conversation
                conversationConfig={{
                  transcriberConfig,
                  agentConfig,
                  synthesizerConfig,
                }}
              />
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
