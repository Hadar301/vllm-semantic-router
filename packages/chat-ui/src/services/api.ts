import type { StreamEvent } from "../types/chat";

const API_BASE = import.meta.env.VITE_API_URL || "";

export async function* streamChat(message: string): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${API_BASE}/api/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    yield { type: "error", message: `API error: ${response.status}` };
    yield { type: "done" };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield { type: "error", message: "No response stream" };
    yield { type: "done" };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const payload = trimmed.slice(6);
      try {
        yield JSON.parse(payload) as StreamEvent;
      } catch {
        // skip malformed lines
      }
    }
  }

  if (buffer.trim().startsWith("data: ")) {
    try {
      yield JSON.parse(buffer.trim().slice(6)) as StreamEvent;
    } catch {
      // skip
    }
  }
}
