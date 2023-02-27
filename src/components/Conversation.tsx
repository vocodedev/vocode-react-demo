import { Box, Button, Select, Spinner, VStack } from "@chakra-ui/react";
import React from "react";
import { ConversationComponentProps } from "../types/conversation";
import { useConversation } from "../hooks/conversation";
import MicrophoneIcon from "./MicrophoneIcon";
import AudioVisualization from "./AudioVisualization";

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
  const { status, start, stop, analyserNode } = useConversation(
    Object.assign(props.config, { audioDeviceConfig })
  );

  React.useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setInputAudioDevices(
          devices.filter(
            (device) => device.deviceId && device.kind === "audioinput"
          )
        );
        setOutputAudioDevices(
          devices.filter(
            (device) => device.deviceId && device.kind === "audiooutput"
          )
        );
      })
      .catch((err) => {
        console.error(err);
      });
  });

  return (
    <>
      <Button
        variant="link"
        disabled={["connecting", "error"].includes(status)}
        onClick={status === "connected" ? stop : start}
      >
        {analyserNode && <AudioVisualization analyser={analyserNode} />}
        <Box position={"absolute"} top={"42%"} left="47.6%" boxSize={75}>
          <MicrophoneIcon color={"#FFFFFF"} muted={status !== "connected"} />
        </Box>
      </Button>
      <Box boxSize={50} />
      {status === "connecting" && (
        <Box position={"absolute"} top="55%" left="48%" padding={5}>
          <Spinner color="#FFFFFF" />
        </Box>
      )}
      {inputAudioDevices.length + outputAudioDevices.length > 0 && (
        <VStack position="absolute" top={"42%"} left="2%" paddingBottom={5}>
          <Select
            color={"#FFFFFF"}
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
            color={"#FFFFFF"}
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
        </VStack>
      )}
    </>
  );
};

export default Conversation;
