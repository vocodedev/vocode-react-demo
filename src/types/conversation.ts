import { AgentConfig } from "./vocode/agent";
import { SynthesizerConfig } from "./vocode/synthesizer";
import { TranscriberConfig } from "./vocode/transcriber";
import { AudioEncoding } from "./vocode/audioEncoding";

export const ConversationStatus = Object.freeze({
  IDLE: Symbol("idle"),
  CONNECTING: Symbol("connecting"),
  CONNECTED: Symbol("connected"),
  ERROR: Symbol("error"),
});

export type ConversationConfig = {
  transcriberConfig: Omit<TranscriberConfig, "samplingRate" | "audioEncoding">;
  agentConfig: AgentConfig;
  synthesizerConfig: Omit<SynthesizerConfig, "samplingRate" | "audioEncoding">;
};

export type AudioMetadata = {
  samplingRate: number;
  audioEncoding: AudioEncoding;
};
