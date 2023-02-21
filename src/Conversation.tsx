import { Box, Button, Spinner, useColorMode, VStack } from "@chakra-ui/react";
import React from "react";
import { ConversationConfig, ConversationStatus } from "./types/conversation";
import { useConversation } from "./hooks/conversation";
import Siriwave from "react-siriwave";
import MicrophoneIcon from "./MicrophoneIcon";

const MAX_AMPLITUDE = 2;
const GRAY = "#718096";

const Conversation = ({
  conversationConfig,
}: {
  conversationConfig: ConversationConfig;
}) => {
  const [status, start, stop, currentAudioBuffer] =
    useConversation(conversationConfig);
  const [waveAmplitude, setWaveAmplitude] = React.useState(0.0);

  React.useEffect(() => {
    const amplitude = Math.min(
      currentAudioBuffer.reduce((acc, val) => {
        return acc + Math.abs(val);
      }, 0) /
        currentAudioBuffer.length /
        50,
      MAX_AMPLITUDE
    );
    setWaveAmplitude(amplitude);
  }, [currentAudioBuffer]);

  return (
    <VStack>
      <Button
        variant="link"
        disabled={[
          ConversationStatus.CONNECTING,
          ConversationStatus.ERROR,
        ].includes(status)}
        onClick={status === ConversationStatus.CONNECTED ? stop : start}
      >
        <Box boxSize={100}>
          <MicrophoneIcon
            color={GRAY}
            muted={status !== ConversationStatus.CONNECTED}
          />
        </Box>
      </Button>
      <Box boxSize={50} />
      {status === ConversationStatus.CONNECTING && (
        <Box padding={5}>
          <Spinner />
        </Box>
      )}
      {status === ConversationStatus.CONNECTED && (
        <Siriwave color={GRAY} amplitude={waveAmplitude} />
      )}
    </VStack>
  );
};

export default Conversation;
