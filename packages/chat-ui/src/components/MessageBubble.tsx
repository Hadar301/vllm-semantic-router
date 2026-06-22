import type { ChatMessage } from "../types/chat";
import { GuardrailAlert } from "./GuardrailAlert";
import { RoutingBadge } from "./RoutingBadge";

interface Props {
  message: ChatMessage;
  isSelected: boolean;
  onSelect: () => void;
}

export function MessageBubble({ message, isSelected, onSelect }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`message ${isUser ? "message-user" : "message-assistant"} ${isSelected ? "message-selected" : ""}`}>
      {!isUser && message.routing && (
        <div className="message-routing-header">
          <RoutingBadge decision={message.routing.selected_decision} onClick={onSelect} />
          {message.routing.selected_model && (
            <span className="message-model">{message.routing.selected_model}</span>
          )}
        </div>
      )}
      {!isUser && message.routing?.selected_decision && (
        <GuardrailAlert decision={message.routing.selected_decision} />
      )}
      <div className="message-content">
        {message.content}
        {message.isStreaming && <span className="cursor-blink">|</span>}
      </div>
    </div>
  );
}
