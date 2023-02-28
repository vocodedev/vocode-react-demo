import { Box, Button, Select, Spinner, VStack } from "@chakra-ui/react";
import React from "react";
import {
  AudioDeviceConfig,
  ConversationComponentProps,
} from "../types/conversation";
import { useConversation } from "../hooks/conversation";
import MicrophoneIcon from "./MicrophoneIcon";
import AudioVisualization from "./AudioVisualization";

const Conversation = (props: ConversationComponentProps) => {
  const [audioDeviceConfig, setAudioDeviceConfig] =
    React.useState<AudioDeviceConfig>({
      inputDeviceId: "default",
      outputDeviceId: "default",
      outputSamplingRate: undefined,
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
          <MicrophoneIcon color={"#ddfafa"} muted={status !== "connected"} />
        </Box>
      </Button>
      <Box boxSize={50} />
      {status === "connecting" && (
        <Box position={"absolute"} top="55%" left="48%" padding={5}>
          <Spinner color="#FFFFFF" />
        </Box>
      )}
      <VStack position="absolute" top={"42%"} left="2%" paddingBottom={5}>
        {inputAudioDevices.length + outputAudioDevices.length > 0 && (
          <>
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
          </>
        )}
        <Select
          color={"#FFFFFF"}
          disabled={["connecting", "connected"].includes(status)}
          onChange={(event) =>
            setAudioDeviceConfig({
              ...audioDeviceConfig,
              outputSamplingRate: parseInt(event.target.value),
            })
          }
          placeholder="Set output sampling rate"
          value={audioDeviceConfig.outputSamplingRate}
        >
          {[8000, 16000, 24000, 44100, 48000].map((rate, i) => {
            return (
              <option key={i} value={rate}>
                {rate} Hz
              </option>
            );
          })}
        </Select>
      </VStack>
    </>
  );
};

export default Conversation;
