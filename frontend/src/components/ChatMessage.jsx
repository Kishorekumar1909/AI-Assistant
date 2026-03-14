/**
 * ChatMessage — renders a single message bubble with Markdown support.
 */

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";
import { format } from "date-fns";

function ThinkingBubble() {
  return (
    <div className="message-wrapper" style={{ alignItems: "flex-start", gap: 12, padding: "12px 0" }}>
      <div className="message-avatar ai-avatar">
        <Bot size={16} color="#8b92a4" />
      </div>
      <div className="message-bubble assistant">
        <div className="thinking-bubble">
          <div className="thinking-dot" />
          <div className="thinking-dot" />
          <div className="thinking-dot" />
        </div>
      </div>
    </div>
  );
}

export { ThinkingBubble };

export default function ChatMessage({ message, username }) {
  const isUser = message.role === "user";
  const initials = username ? username.slice(0, 2).toUpperCase() : "U";
  const time = message.created_at
    ? format(new Date(message.created_at), "h:mm a")
    : "";

  return (
    <div className="message-group">
      <div className={`message-wrapper ${isUser ? "user" : ""}`}>
        {isUser ? (
          <div className="message-avatar user-avatar">{initials}</div>
        ) : (
          <div className="message-avatar ai-avatar">
            <Bot size={16} color="#8b92a4" />
          </div>
        )}

        <div className={`message-bubble ${isUser ? "user" : "assistant"}`}>
          {isUser ? (
            <span style={{ whiteSpace: "pre-wrap" }}>{message.content}</span>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
      <div className={`message-time ${isUser ? "message-wrapper user" : ""}`}>
        {time}
      </div>
    </div>
  );
}
