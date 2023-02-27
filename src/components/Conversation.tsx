import {
  Box,
  Button,
  HStack,
  Select,
  Spinner,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { ConversationComponentProps } from "../types/conversation";
import { useConversation } from "../hooks/conversation";
import Siriwave from "react-siriwave";
import MicrophoneIcon from "./MicrophoneIcon";

const MAX_AMPLITUDE = 2.1;
const GRAY = "#A0AEC0";

const Conversation = (props: ConversationComponentProps) => {
  const [audioDeviceConfig, setAudioDeviceConfig] = React.useState({
    inputDeviceId: "default",
    outputDeviceId: "default",
  });
  const [inputAudioDevices, setInputAudioDevices] = React.useState<
    MediaDeviceInfo[]
  >([]);
  const [outputAudioDevices, setOutputAudioDevices] = React.useState<
    MediaDeviceInfo[]
  >([]);
  const { status, start, stop, currentAudioBuffer } = useConversation(
    Object.assign(props.config, { audioDeviceConfig })
  );
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

  React.useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setInputAudioDevices(
          devices.filter(
            (device) =>
              device.kind === "audioinput" && device.deviceId !== "default"
          )
        );
        setOutputAudioDevices(
          devices.filter(
            (device) =>
              device.kind === "audiooutput" && device.deviceId !== "default"
          )
        );
      })
      .catch((err) => {
        console.error(err);
      });
  });

  return (
    <VStack>
      <HStack paddingBottom={5}>
        <Select
          disabled={["connecting", "connected"].includes(status)}
          onChange={(event) =>
            setAudioDeviceConfig({
              ...audioDeviceConfig,
              inputDeviceId: event.target.value,
            })
          }
          value={audioDeviceConfig.inputDeviceId}
        >
          {inputAudioDevices.map((device, i) => {
            return (
              <option key={i} value={device.deviceId}>
                {device.label}
              </option>
            );
          })}
        </Select>
        <Select
          disabled={["connecting", "connected"].includes(status)}
          onChange={(event) =>
            setAudioDeviceConfig({
              ...audioDeviceConfig,
              outputDeviceId: event.target.value,
            })
          }
          value={audioDeviceConfig.outputDeviceId}
        >
          {outputAudioDevices.map((device, i) => {
            return (
              <option key={i} value={device.deviceId}>
                {device.label}
              </option>
            );
          })}
        </Select>
      </HStack>
      <Button
        variant="link"
        disabled={["connecting", "error"].includes(status)}
        onClick={status === "connected" ? stop : start}
      >
        <Box boxSize={100}>
          <MicrophoneIcon color={GRAY} muted={status !== "connected"} />
        </Box>
      </Button>
      <Box boxSize={50} />
      {status === "connecting" && (
        <Box padding={5}>
          <Spinner />
        </Box>
      )}
      {status === "connected" && (
        <Siriwave color={GRAY} amplitude={waveAmplitude} />
      )}
    </VStack>
  );
};

export default Conversation;
