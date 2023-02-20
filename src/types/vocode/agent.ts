export type AgentType = "llm" | "echo";

export interface AgentConfig {
  type: string;
}

export interface LLMAgentConfig extends AgentConfig {
  type: "llm";
  promptPreamble: string;
}

export interface EchoAgentConfig extends AgentConfig {
  type: "echo";
}
