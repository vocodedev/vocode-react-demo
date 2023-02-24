import {
  IMediaRecorder,
  MediaRecorder,
  register,
} from "extendable-media-recorder";
import { connect } from "extendable-media-recorder-wav-encoder";
import { Buffer } from "buffer";
import React from "react";
import {
  AudioMetadata,
  ConversationConfig,
  ConversationStatus,
} from "../types/conversation";
import { blobToBase64, stringify } from "../utils";
import { AudioEncoding } from "../types/vocode/audioEncoding";
import {
  AudioMessage,
  StartMessage,
  StopMessage,
} from "../types/vocode/websocket";

export const useConversation = (
  config: ConversationConfig
): [symbol, () => void, () => void, Buffer] => {
  const [audioContext, setAudioContext] = React.useState<AudioContext>();
  const [audioQueue, setAudioQueue] = React.useState<Buffer[]>([]);
  const [currentAudioBuffer, setCurrentAudioBuffer] = React.useState<Buffer>(
    Buffer.from([0])
  );
  const [processing, setProcessing] = React.useState(false);
  const [audioStream, setAudioStream] = React.useState<MediaStream>();
  const [recorder, setRecorder] = React.useState<IMediaRecorder>();
  const [socket, setSocket] = React.useState<WebSocket>();
  const [audioMetadata, setAudioMetadata] = React.useState<AudioMetadata>();
  const [status, setStatus] = React.useState(ConversationStatus.IDLE);

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
    if (status === ConversationStatus.CONNECTING) {
      recorder.start(10);
    } else if (status === ConversationStatus.CONNECTED) {
      recorder.addEventListener("dataavailable", ({ data }: { data: Blob }) => {
        blobToBase64(data).then((base64Encoded: string | null) => {
          if (!base64Encoded) return;
          const audioMessage: AudioMessage = {
            type: "audio",
            data: base64Encoded,
          };
          socket.readyState === WebSocket.OPEN &&
            socket.send(stringify(audioMessage));
        });
      });
    }
  }, [recorder, status]);

  React.useEffect(() => {
    if (!audioContext) return;
    let samplingRate = audioContext.sampleRate;
    let audioEncoding = "linear16" as AudioEncoding;
    console.log({ samplingRate, audioEncoding });
    setAudioMetadata({ samplingRate, audioEncoding });
  }, [audioContext]);

  React.useEffect(() => {
    if (!socket) return;
    socket.onerror = (error) => {
      setStatus(ConversationStatus.ERROR);
    };
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "audio") {
        queueAudio(Buffer.from(message.data, "base64"));
      } else if (message.type === "ready") {
        setStatus(ConversationStatus.CONNECTED);
      }
    };
    socket.onclose = () => {
      stopConversation();
    };
  }, [socket]);

  React.useEffect(() => {
    const awaitSocketAndSendAudioMetadata = async (
      socket: WebSocket,
      audioMetadata: AudioMetadata
    ) => {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            clearInterval(interval);
            resolve(null);
          }
        }, 100);
      });
      const startMessage: StartMessage = {
        type: "start",
        transcriberConfig: Object.assign(
          config.transcriberConfig,
          audioMetadata
        ),
        agentConfig: config.agentConfig,
        synthesizerConfig: Object.assign(
          config.synthesizerConfig,
          audioMetadata
        ),
      };
      socket.send(stringify(startMessage));
    };
    if (audioMetadata && socket && status === ConversationStatus.CONNECTING) {
      awaitSocketAndSendAudioMetadata(socket, audioMetadata).catch(
        console.error
      );
    }
  }, [socket, audioMetadata, status]);

  React.useEffect(() => {
    const playArrayBuffer = (arrayBuffer: ArrayBuffer) => {
      audioContext &&
        audioContext.decodeAudioData(arrayBuffer, (buffer) => {
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start(0);
          source.onended = () => {
            setCurrentAudioBuffer(Buffer.from([0]));
            setProcessing(false);
          };
        });
    };
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
    setCurrentAudioBuffer(audio);
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

  const stopConversation = () => {
    setAudioQueue([]);
    setStatus(ConversationStatus.IDLE);
    if (!recorder || !socket) return;
    recorder.stop();
    const stopMessage: StopMessage = {
      type: "stop",
    };
    socket.send(stringify(stopMessage));
    ![WebSocket.CLOSING, WebSocket.CLOSED].includes(socket.readyState) &&
      socket.close();
  };

  const startConversation = async () => {
    if (!audioContext) return;
    setStatus(ConversationStatus.CONNECTING);
    audioContext.resume();

    const resp = await fetch(
      `https://${process.env.REACT_APP_BACKEND_URL}/auth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_VOCODE_API_KEY}`,
        },
      }
    );
    const data = await resp.json();
    const token = data.token;

    const newSocket = new WebSocket(
      `wss://${process.env.REACT_APP_BACKEND_URL}/conversation?key=${token}`
    );
    setSocket(newSocket);

    await streamMicrophoneAudioToSocket();
  };

  return [status, startConversation, stopConversation, currentAudioBuffer];
};
