import "@fontsource/inter";
import "./App.css";

import React from "react";
import { motion, useAnimation } from "framer-motion";
import { Box, Button, ChakraProvider, Spinner, VStack } from "@chakra-ui/react";
import DarkModeProvider from "./DarkModeProvider";
import { PhoneIcon } from "@chakra-ui/icons";
import { MediaRecorder, register } from "extendable-media-recorder";
import { connect } from "extendable-media-recorder-wav-encoder";
import WaveSurfer from "wavesurfer.js";

const CallStatus = {
  IDLE: Symbol("red"),
  CONNECTING: Symbol("green"),
  CONNECTED: Symbol("blue"),
  ERROR: Symbol("error"),
};

function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  });
}

function App() {
  const [audioContext, setAudioContext] = React.useState(null);
  const [audioQueue, setAudioQueue] = React.useState([]);
  const [processing, setProcessing] = React.useState(false);
  const [audioStream, setAudioStream] = React.useState(null);
  const [recorder, setRecorder] = React.useState(null);
  const [socket, setSocket] = React.useState(null);
  const [waveSurfer, setWaveSurfer] = React.useState(null);
  const [audioMetadata, setAudioMetadata] = React.useState(null);
  const [callStatus, setCallStatus] = React.useState(CallStatus.IDLE);
  const prevCallStatus = React.useRef(callStatus);
  const pulse = useAnimation();

  React.useEffect(() => {
    pulse.start({
      rotate: 137,
      transition: { duration: 0 },
    });
  }, []);

  React.useEffect(() => {
    if (callStatus === CallStatus.CONNECTED) {
      pulse.start({
        rotate: 0,
        transition: { duration: 1 },
      });
    }
    if (
      prevCallStatus.current === CallStatus.CONNECTED &&
      [CallStatus.ERROR, CallStatus.IDLE].includes(callStatus)
    ) {
      pulse.start({
        rotate: 137,
        transition: { duration: 1 },
      });
    }
    prevCallStatus.current = callStatus;
  }, [callStatus]);

  React.useEffect(() => {
    setAudioContext(new window.AudioContext());
  }, []);

  React.useEffect(() => {
    console.log("called");
    const registerWav = async () => {
      await register(await connect());
    };
    registerWav().catch(console.error);
  }, []);

  React.useEffect(() => {
    if (!recorder) return;
    recorder.addEventListener("dataavailable", ({ data }) => {
      if (socket.readyState !== WebSocket.OPEN) {
        if (waveSurfer) waveSurfer.loadBlob(data);
        return;
      }
      blobToBase64(data).then((base64Encoded) => {
        socket.send(
          JSON.stringify({
            type: "audio",
            data: base64Encoded,
          })
        );
      });
    });

    recorder.start(10);
  }, [recorder]);

  React.useEffect(() => {
    if (!waveSurfer) return;
    waveSurfer.on("ready", function () {
      let samplingRate = waveSurfer.backend.ac.sampleRate;
      let encoding = waveSurfer.params.backend;
      setAudioMetadata({ samplingRate, encoding });
    });
  }, [waveSurfer]);

  React.useEffect(() => {
    if (!socket) return;
    socket.onopen = () => {
      setCallStatus(CallStatus.CONNECTED);
    };
    socket.onerror = (error) => {
      setCallStatus(CallStatus.ERROR);
    };
    socket.onmessage = (event) => {
      queueAudio(event.data);
    };
  }, [socket]);

  React.useEffect(() => {
    if (!processing && audioQueue.length > 0) {
      setProcessing(true);
      const audio = audioQueue.shift();
      audioContext.decodeAudioData(audio, (buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        source.onended = () => {
          setProcessing(false);
        };
      });
    }
  }, [audioQueue, processing]);

  const queueAudio = (audio) => {
    setAudioQueue((prev) => [...prev, audio]);
  };

  const waveformRef = React.useRef();

  const streamMicrophoneAudioToSocket = async () => {
    let audioStreamToUse;

    if (audioStream === null) {
      try {
        audioStreamToUse = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        setAudioStream(audioStreamToUse);
        console.log("Access to microphone granted");
      } catch (error) {
        throw new Error(`
          MediaDevices.getUserMedia() threw an error. 
          Stream did not open.
          ${error.name} - 
          ${error.message}
        `);
      }
    } else {
      audioStreamToUse = audioStream;
    }
    setRecorder(new MediaRecorder(audioStreamToUse, { mimeType: "audio/wav" }));
  };

  const stopRecording = () => {
    recorder.stop();
    socket.send(
      JSON.stringify({
        type: "stop",
      })
    );
    setAudioQueue([]);
    setCallStatus(CallStatus.IDLE);
  };

  const startConversation = async () => {
    setCallStatus(CallStatus.CONNECTING);

    setWaveSurfer((prev) => {
      if (prev === null) {
        WaveSurfer.create({
          container: waveformRef.current,
        });
      } else {
        return prev;
      }
    });

    const newSocket = new WebSocket(
      "wss://e3f1-136-24-82-111.ngrok.io/websocket"
    );
    newSocket.binaryType = "arraybuffer";
    setSocket(newSocket);

    await streamMicrophoneAudioToSocket();
  };

  return (
    <ChakraProvider>
      <DarkModeProvider>
        <Box height={"100vh"} className="App">
          <VStack>
            <Button
              variant="link"
              disabled={[CallStatus.CONNECTING, CallStatus.ERROR].includes(
                callStatus
              )}
              onClick={
                callStatus === CallStatus.CONNECTED
                  ? stopRecording
                  : startConversation
              }
            >
              <motion.div animate={pulse}>
                <PhoneIcon boxSize={100} />
              </motion.div>
            </Button>
            {callStatus === CallStatus.CONNECTING && <Spinner />}
            <div display="none" ref={waveformRef}></div>
          </VStack>
        </Box>
      </DarkModeProvider>
    </ChakraProvider>
  );
}

export default App;
