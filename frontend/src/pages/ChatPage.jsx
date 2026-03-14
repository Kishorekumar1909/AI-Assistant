/**
 * ChatPage — main layout composing Sidebar + chat area.
 */

import React, { useEffect, useRef } from "react";
import { Bot, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import Sidebar from "../components/Sidebar";
import ChatMessage, { ThinkingBubble } from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";

export default function ChatPage() {
  const { user } = useAuth();
  const { activeSession, messages, loadingMessages, sending, createSession, sendMessage } =
    useChat();

  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async (content) => {
    if (!activeSession) {
      // Create a new session on first message
      await createSession(content.slice(0, 60));
    }
    await sendMessage(content);
  };

  return (
    <div className="chat-layout">
      <Sidebar />

      <main className="chat-main">
        {/* Header */}
        <header className="chat-header">
          <div className="chat-header-title">
            {activeSession ? activeSession.title : "AI Assistant"}
          </div>
          {activeSession && (
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                background: "rgba(79,142,247,0.08)",
                border: "1px solid rgba(79,142,247,0.2)",
                borderRadius: 20,
                padding: "2px 10px",
              }}
            >
              Llama 3 · Groq
            </span>
          )}
        </header>

        {/* Messages area */}
        <div className="chat-messages" id="messages-container">
          {!activeSession && (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">
                <Bot size={32} color="#fff" />
              </div>
              <h2>How can I help you today?</h2>
              <p>
                Start a new conversation by typing below, or select a previous chat from the sidebar.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => createSession("New Chat")}
                id="welcome-new-chat-btn"
              >
                <Plus size={16} />
                New Chat
              </button>
            </div>
          )}

          {activeSession && loadingMessages && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                gap: 12,
                color: "var(--text-muted)",
                fontSize: "0.875rem",
              }}
            >
              <div
                className="spinner"
                style={{
                  borderColor: "var(--border-default)",
                  borderTopColor: "var(--accent-primary)",
                  width: 28,
                  height: 28,
                  borderWidth: 3,
                }}
              />
              Loading messages...
            </div>
          )}

          {activeSession && !loadingMessages && messages.length === 0 && (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">
                <Bot size={32} color="#fff" />
              </div>
              <h2>New conversation</h2>
              <p>Send your first message to get started.</p>
            </div>
          )}

          {activeSession &&
            !loadingMessages &&
            messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} username={user?.username} />
            ))}

          {sending && <ThinkingBubble />}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {(activeSession) && (
          <ChatInput onSend={handleSend} disabled={sending || loadingMessages} />
        )}
      </main>
    </div>
  );
}
