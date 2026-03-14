/**
 * ChatInput — auto-growing textarea, send on Enter (Shift+Enter for newline).
 */

import React, { useRef, useEffect } from "react";
import { Send } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const value = textareaRef.current?.value?.trim();
    if (!value || disabled) return;
    onSend(value);
    textareaRef.current.value = "";
    textareaRef.current.style.height = "auto";
  };

  return (
    <div className="chat-input-area">
      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          rows={1}
          className="chat-textarea"
          placeholder="Message AI Chat… (Enter to send, Shift+Enter for newline)"
          onInput={autoResize}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label="Message input"
          id="chat-input"
        />
        <button
          className="chat-send-btn"
          onClick={submit}
          disabled={disabled}
          aria-label="Send message"
          id="send-btn"
        >
          {disabled ? (
            <div
              style={{
                width: 16,
                height: 16,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid #fff",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
      <p className="chat-input-hint">
        Powered by Llama 3 via Groq · Messages may be inaccurate
      </p>
    </div>
  );
}
