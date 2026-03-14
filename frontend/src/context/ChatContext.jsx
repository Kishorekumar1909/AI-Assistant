/**
 * Chat context — manages sessions, active chat, and messages.
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { chatApi } from "../api/client";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await chatApi.listSessions();
      // Handle paginated or plain list response
      const results = res.data.results ?? res.data;
      setSessions(results);
    } catch {
      toast.error("Failed to load chat sessions.");
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const createSession = useCallback(async (title = "New Chat") => {
    const res = await chatApi.createSession(title);
    const session = res.data;
    setSessions((prev) => [session, ...prev]);
    setActiveSession(session);
    setMessages([]);
    return session;
  }, []);

  const deleteSession = useCallback(async (id) => {
    await chatApi.deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSession?.id === id) {
      setActiveSession(null);
      setMessages([]);
    }
    toast.success("Chat deleted.");
  }, [activeSession]);

  const openSession = useCallback(async (session) => {
    setActiveSession(session);
    setLoadingMessages(true);
    try {
      const res = await chatApi.getMessages(session.id);
      const results = res.data.results ?? res.data;
      setMessages(results);
    } catch {
      toast.error("Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content) => {
      if (!activeSession) return;
      setSending(true);

      // Optimistic user message
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg = {
        id: tempId,
        role: "user",
        content,
        created_at: new Date().toISOString(),
        _optimistic: true,
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const res = await chatApi.sendMessage(activeSession.id, content);
        const { user_message, assistant_message, session_title } = res.data;

        // Replace optimistic message with real one and append assistant reply
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== tempId)
            .concat([user_message, assistant_message])
        );

        // Update session title if auto-titled
        if (session_title !== activeSession.title) {
          setActiveSession((prev) => ({ ...prev, title: session_title }));
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSession.id ? { ...s, title: session_title } : s
            )
          );
        }

        // Bump session to top of list
        setSessions((prev) => {
          const updated = prev.filter((s) => s.id !== activeSession.id);
          const current = prev.find((s) => s.id === activeSession.id) ?? activeSession;
          return [{ ...current, updated_at: new Date().toISOString() }, ...updated];
        });
      } catch (err) {
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        const detail = err.response?.data?.detail || "Failed to send message.";
        toast.error(detail);
      } finally {
        setSending(false);
      }
    },
    [activeSession]
  );

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSession,
        messages,
        loadingSessions,
        loadingMessages,
        sending,
        fetchSessions,
        createSession,
        deleteSession,
        openSession,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
