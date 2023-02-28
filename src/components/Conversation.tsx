import { Box, Button, Select, Spinner, Text, VStack } from "@chakra-ui/react";
import React from "react";
import {
  useConversation,
  AudioDeviceConfig,
  ConversationConfig,
} from "../vocode";
import MicrophoneIcon from "./MicrophoneIcon";
import AudioVisualization from "./AudioVisualization";

const Conversation = ({
  config,
}: {
  config: Omit<ConversationConfig, "audioDeviceConfig">;
}) => {
  const [audioDeviceConfig, setAudioDeviceConfig] =
    React.useState<AudioDeviceConfig>({});
  const [inputDevice, setInputDevice] = React.useState<MediaDeviceInfo>();
  const [outputDevice, setOutputDevice] = React.useState<MediaDeviceInfo>();
  const prevDevices = React.useRef<MediaDeviceInfo[]>([]);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const { status, start, stop, analyserNode } = useConversation(
    Object.assign(config, { audioDeviceConfig }),
    // config,
    audioRef
  );

  React.useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setInputDevice(
          devices.find(
            (device) =>
              device.deviceId === "default" && device.kind === "audioinput"
          )
        );
        setOutputDevice(
          devices.find(
            (device) =>
              device.deviceId === "default" && device.kind === "audiooutput"
          )
        );
      })
      .catch((err) => {
        console.error(err);
      });
  });

  return (
    <>
      {analyserNode && <AudioVisualization analyser={analyserNode} />}
      <Button
        variant="link"
        disabled={["connecting", "error"].includes(status)}
        onClick={status === "connected" ? stop : start}
        position={"absolute"}
        top={"42%"}
        left="47.6%"
      >
        <Box boxSize={75}>
          <MicrophoneIcon color={"#ddfafa"} muted={status !== "connected"} />
          <audio ref={audioRef} />
        </Box>
      </Button>
      <Box boxSize={50} />
      {status === "connecting" && (
        <Box position={"absolute"} top="55%" left="48%" padding={5}>
          <Spinner color="#FFFFFF" />
        </Box>
      )}
      <VStack position="absolute" top={"42%"} left="2%" paddingBottom={5}>
        {inputDevice && (
          <Box>
            <Text color="#FFFFFF">{inputDevice.label}</Text>
          </Box>
        )}
        {outputDevice && (
          <Box>
            <Text color="#FFFFFF">{outputDevice.label}</Text>
          </Box>
        )}
        {/* {inputAudioDevices.length + outputAudioDevices.length > 0 && (
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
        )} */}
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
