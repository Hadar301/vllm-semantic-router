export interface RoutingMetadata {
  selected_model: string | null;
  selected_decision: string | null;
  selected_confidence: number | null;
  signal_confidences: Record<string, number> | null;
  matched_signals: Record<string, string[]> | null;
  recommended_models: string[] | null;
  routing_decision: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  routing?: RoutingMetadata;
  isStreaming?: boolean;
}

export interface RoutingEvent {
  type: "routing";
  metadata: RoutingMetadata;
}

export interface DeltaEvent {
  type: "delta";
  content: string;
}

export interface ErrorEvent {
  type: "error";
  message: string;
}

export interface DoneEvent {
  type: "done";
}

export type StreamEvent = RoutingEvent | DeltaEvent | ErrorEvent | DoneEvent;
