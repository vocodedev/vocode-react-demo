import { Button, Spinner, VStack } from "@chakra-ui/react";
import React from "react";
import { PhoneIcon } from "@chakra-ui/icons";
import { motion, useAnimation } from "framer-motion";
import { ConversationConfig, ConversationStatus } from "./types/conversation";
import { useConversation } from "./hooks/conversation";

const PHONE_CALL_ROTATION_DEGREES = 137;

const Conversation = ({
  conversationConfig,
}: {
  conversationConfig: ConversationConfig;
}) => {
  const pulse = useAnimation();
  const [status, start, stop] = useConversation(conversationConfig);
  const prevStatus = React.useRef(status);

  React.useEffect(() => {
    pulse.start({
      rotate: PHONE_CALL_ROTATION_DEGREES,
      transition: { duration: 0 },
    });
  }, []);

  React.useEffect(() => {
    if (status === ConversationStatus.CONNECTED) {
      pulse.start({
        rotate: 0,
        transition: { duration: 1 },
      });
    }
    if (
      prevStatus.current === ConversationStatus.CONNECTED &&
      [ConversationStatus.ERROR, ConversationStatus.IDLE].includes(status)
    ) {
      pulse.start({
        rotate: PHONE_CALL_ROTATION_DEGREES,
        transition: { duration: 1 },
      });
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
        <motion.div animate={pulse}>
          <PhoneIcon boxSize={100} />
        </motion.div>
      </Button>
      {status == ConversationStatus.CONNECTING && <Spinner />}
    </VStack>
  );
};

export default Conversation;
