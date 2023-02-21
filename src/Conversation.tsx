import "./Conversation.css";

import { Box, Button, Spinner, useColorMode, VStack } from "@chakra-ui/react";
import React from "react";
import { PhoneIcon } from "@chakra-ui/icons";
import { motion, useAnimation, useMotionValue, animate } from "framer-motion";
import { ConversationConfig, ConversationStatus } from "./types/conversation";
import { useConversation } from "./hooks/conversation";
import { FaMicrophone } from "react-icons/fa";
import { Icon } from "@chakra-ui/react";

const PHONE_CALL_ROTATION_DEGREES = 137;

const Conversation = ({
  conversationConfig,
}: {
  conversationConfig: ConversationConfig;
}) => {
  const [status, start, stop, currentAudioBuffer] =
    useConversation(conversationConfig);

  const prevStatus = React.useRef(status);
  const [micColor, setMicColor] = React.useState("gray.400");

  React.useEffect(() => {
    if (status === ConversationStatus.CONNECTED) {
      setMicColor("blue.400");
    }
    if (
      prevStatus.current === ConversationStatus.CONNECTED &&
      [ConversationStatus.ERROR, ConversationStatus.IDLE].includes(status)
    ) {
      setMicColor("gray.400");
    }
    prevStatus.current = status;
  }, [status]);

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
        <Box padding={4}>
          <Icon color={micColor} as={FaMicrophone} boxSize={100} />
        </Box>
      </Button>
      {status === ConversationStatus.CONNECTING && <Spinner />}
    </VStack>
  );
};

export default Conversation;
