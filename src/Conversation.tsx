import { Button, Spinner, VStack } from "@chakra-ui/react";
import React from "react";
import {
  IMediaRecorder,
  MediaRecorder,
  register,
} from "extendable-media-recorder";
import { connect } from "extendable-media-recorder-wav-encoder";
import WaveSurfer from "wavesurfer.js";
import { Buffer } from "buffer";
import { PhoneIcon } from "@chakra-ui/icons";
import { motion, useAnimation } from "framer-motion";

const PHONE_CALL_ROTATION_DEGREES = 137;

const blobToBase64 = (blob: Blob) => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result?.toString().split(",")[1]);
    reader.readAsDataURL(blob);
  });
};

const CallStatus = {
  IDLE: Symbol("idle"),
  CONNECTING: Symbol("connecting"),
  CONNECTED: Symbol("connected"),
  ERROR: Symbol("error"),
};

const Conversation = () => {
  const [audioContext, setAudioContext] = React.useState<AudioContext>();
  const [audioQueue, setAudioQueue] = React.useState<Buffer[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [audioStream, setAudioStream] = React.useState<MediaStream>();
  const [recorder, setRecorder] = React.useState<IMediaRecorder>();
  const [socket, setSocket] = React.useState<WebSocket>();
  const [waveSurfer, setWaveSurfer] = React.useState<WaveSurfer>();
  const [audioMetadata, setAudioMetadata] = React.useState<{
    samplingRate: number;
    encoding: string;
  }>();
  const [callStatus, setCallStatus] = React.useState(CallStatus.IDLE);
  const prevCallStatus = React.useRef(callStatus);
  const pulse = useAnimation();
  const waveformRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    pulse.start({
      rotate: PHONE_CALL_ROTATION_DEGREES,
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
        rotate: PHONE_CALL_ROTATION_DEGREES,
        transition: { duration: 1 },
      });
    }
    prevCallStatus.current = callStatus;
  }, [callStatus]);

  React.useEffect(() => {
    setAudioContext(new window.AudioContext());
  }, []);

  React.useEffect(() => {
    const registerWav = async () => {
      await register(await connect());
    };
    registerWav().catch(console.error);
  }, []);

  React.useEffect(() => {
    if (!recorder || !socket) return;
    if (callStatus === CallStatus.CONNECTING) {
      recorder.addEventListener("dataavailable", ({ data }: { data: Blob }) => {
        if (waveSurfer && !audioMetadata) {
          waveSurfer.loadBlob(data);
        }
      });
      recorder.start(10);
    } else if (callStatus === CallStatus.CONNECTED) {
      recorder.addEventListener("dataavailable", ({ data }: { data: Blob }) => {
        if (waveSurfer && !audioMetadata) {
          waveSurfer.loadBlob(data);
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
    }
  }, [recorder, callStatus]);

  React.useEffect(() => {
    if (!waveSurfer) return;
    waveSurfer.on("ready", function () {
      // @ts-ignore
      let samplingRate = waveSurfer.backend.ac.sampleRate;
      let encoding = waveSurfer.params.backend;
      console.log({ samplingRate, encoding });
      setAudioMetadata({ samplingRate, encoding });
    });
  }, [waveSurfer]);

  React.useEffect(() => {
    if (!socket) return;
    socket.onerror = (error) => {
      setCallStatus(CallStatus.ERROR);
    };
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "audio") {
        queueAudio(Buffer.from(message.data, "base64"));
      } else if (message.type === "ready") {
        setCallStatus(CallStatus.CONNECTED);
      }
    };
  }, [socket]);

  React.useEffect(() => {
    const awaitSocketAndSendAudioMetadata = async (socket: WebSocket) => {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            clearInterval(interval);
            resolve(null);
          }
        }, 100);
      });
      socket.send(
        JSON.stringify({
          type: "start",
          data: audioMetadata,
        })
      );
    };
    if (audioMetadata && socket && callStatus === CallStatus.CONNECTING) {
      awaitSocketAndSendAudioMetadata(socket).catch(console.error);
    }
  }, [audioMetadata, callStatus]);

  const playArrayBuffer = (arrayBuffer: ArrayBuffer) => {
    audioContext &&
      audioContext.decodeAudioData(arrayBuffer, (buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        source.onended = () => {
          setProcessing(false);
        };
      });
  };

  React.useEffect(() => {
    if (!processing && audioQueue.length > 0) {
      setProcessing(true);
      const audio = audioQueue.shift();
      audio &&
        fetch(URL.createObjectURL(new Blob([audio])))
          .then((response) => response.arrayBuffer())
          .then(playArrayBuffer);
    }
  }, [audioQueue, processing]);

  const queueAudio = (audio: Buffer) => {
    setAudioQueue((prev) => [...prev, audio]);
  };

  const streamMicrophoneAudioToSocket = async () => {
    let audioStreamToUse;

    if (!audioStream) {
      try {
        audioStreamToUse = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        setAudioStream(audioStreamToUse);
        console.log("Access to microphone granted");
      } catch (error) {
        console.log(error);
      }
    } else {
      audioStreamToUse = audioStream;
    }
    audioStreamToUse &&
      setRecorder(
        new MediaRecorder(audioStreamToUse, { mimeType: "audio/wav" })
      );
  };

  const stopRecording = () => {
    if (!recorder || !socket) return;
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
    if (!audioContext) return;
    setCallStatus(CallStatus.CONNECTING);
    audioContext.resume();

    waveformRef.current &&
      setWaveSurfer(
        WaveSurfer.create({
          container: waveformRef.current,
        })
      );

    const newSocket = new WebSocket("wss://17a02dfcc41b.ngrok.io/websocket");
    setSocket(newSocket);

    await streamMicrophoneAudioToSocket();
  };
  return (
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
      <div className="wavesurfer" ref={waveformRef}></div>
      {callStatus == CallStatus.CONNECTING && <Spinner />}
    </VStack>
  );
};

export default Conversation;
