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
import Conversation from "./components/Conversation";

import { isIE, isMobile } from "react-device-detect";
import { WarningIcon } from "@chakra-ui/icons";
import { DeepgramTranscriberConfig } from "./types/vocode/transcriber";
import { EchoAgentConfig, LLMAgentConfig } from "./types/vocode/agent";
import { AzureSynthesizerConfig } from "./types/vocode/synthesizer";
import { AudioDeviceConfig } from "./types/conversation";

const App = () => {
  const audioDeviceConfig: AudioDeviceConfig = {
    inputDeviceId: "default",
    outputDeviceId: "default",
  };
  const transcriberConfig: Omit<
    DeepgramTranscriberConfig,
    "samplingRate" | "audioEncoding"
  > = {
    type: "deepgram",
    model: "conversationalai",
    chunkSize: 2048,
  };
  const agentConfig: LLMAgentConfig = {
    type: "llm",
    initialMessage: "Hello!",
    promptPreamble:
      "Vocode is an SDK that allows developers to create voice bots like this one in less than 10 lines of code. The AI is explaining to the human what Vocode is.",
  };
  const synthesizerConfig: Omit<
    AzureSynthesizerConfig,
    "samplingRate" | "audioEncoding"
  > = {
    type: "azure",
    shouldEncodeAsWav: true,
  };

  return (
    <ChakraProvider>
      <DarkModeProvider>
        <Flex height={"100vh"} align={"center"} direction="column">
          <Spacer />
          <Box height={"70vh"}>
            {!isIE && !isMobile ? (
              <Conversation
                config={{
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
