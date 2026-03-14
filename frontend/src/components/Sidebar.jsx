/**
 * Sidebar — chat session list, new chat button, user info, logout.
 */

import React, { useEffect } from "react";
import Swal from "sweetalert2";
import { Bot, Plus, MessageSquare, Trash2, LogOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { sessions, activeSession, loadingSessions, fetchSessions, createSession, deleteSession, openSession } =
    useChat();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleNewChat = async () => {
    await createSession("New Chat");
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const result = await Swal.fire({
    title: "Delete Chat?",
    text: "This chat will be permanently deleted",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it",
    customClass: {
    popup: "dark-popup",
    title: "dark-title",
    confirmButton: "dark-confirm-btn",
    cancelButton: "dark-cancel-btn"
  }
  });
    if (result.isConfirmed) {
      await deleteSession(id);
    }
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "?";

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Bot size={18} color="#fff" />
          </div>
          <span className="sidebar-logo-text">AI Chat</span>
        </div>
      </div>

      {/* New Chat */}
      <button className="sidebar-new-btn" onClick={handleNewChat} id="new-chat-btn">
        <Plus size={16} />
        New Chat
      </button>

      {/* Session list */}
      <div className="sidebar-chat-list">
        {loadingSessions && (
          <div className="sidebar-empty">
            <div className="spinner" style={{ borderColor: "var(--border-default)", borderTopColor: "var(--accent-primary)", margin: "0 auto 8px" }} />
            Loading...
          </div>
        )}

        {!loadingSessions && sessions.length === 0 && (
          <div className="sidebar-empty">
            No chats yet. Start a new conversation!
          </div>
        )}

        {!loadingSessions && sessions.length > 0 && (
          <>
            <div className="sidebar-section-label">Recent</div>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`sidebar-chat-item ${activeSession?.id === session.id ? "active" : ""}`}
                onClick={() => openSession(session)}
                id={`chat-item-${session.id}`}
              >
                <MessageSquare size={15} className="sidebar-chat-icon" />
                <div className="sidebar-chat-info">
                  <div className="sidebar-chat-title">{session.title}</div>
                  <div className="sidebar-chat-preview">
                    {session.last_message
                      ? session.last_message.content
                      : formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                  </div>
                </div>
                <button
                  className="sidebar-chat-delete"
                  onClick={(e) => handleDelete(e, session.id)}
                  title="Delete chat"
                  aria-label="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer — user info & logout */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <span className="sidebar-username">{user?.username}</span>
          <button
            className="btn-icon"
            onClick={logout}
            title="Log out"
            id="logout-btn"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
