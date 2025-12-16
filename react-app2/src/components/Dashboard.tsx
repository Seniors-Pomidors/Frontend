// src/components/Dashboard.tsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { ChatList } from "./ChatList";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { CreateChatModal } from "./CreateChatModal";
import { AddParticipantsModal } from "./AddParticipantsModal";

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    chats,
    currentChat,
    messages,
    selectChat,
    error,
    clearError,
    deleteChat,
  } = useChat();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAddParticipantsModal, setShowAddParticipantsModal] =
    useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>ProductivityPal</h1>
        <div style={styles.userInfo}>
          <span style={styles.welcome}>
            Добро пожаловать, {user?.username}!
          </span>
          <button
            onClick={logout}
            style={styles.logoutButton}
            className="dashboard-logout-button"
          >
            Выйти
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={clearError} style={styles.closeError}>
            ×
          </button>
        </div>
      )}

      <div style={styles.content}>
        <div style={styles.chatContainer}>
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h3 style={styles.sidebarTitle}>Чаты</h3>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                style={styles.createButton}
                className="dashboard-create-button"
                title="Создать новый чат"
              >
                +
              </button>
            </div>
            <ChatList
              chats={chats}
              currentChat={currentChat}
              onSelectChat={selectChat}
            />
          </div>

          <div style={styles.chatArea}>
            {currentChat ? (
              <>
                <div style={styles.chatHeader}>
                  <div style={styles.chatHeaderContent}>
                    <div style={styles.chatInfo}>
                      <h3 style={styles.chatTitle}>{currentChat.name}</h3>
                      {currentChat.description && (
                        <p style={styles.chatDescription}>
                          {currentChat.description}
                        </p>
                      )}
                      <div style={styles.participantsInfo}>
                        <span>
                          Участников: {currentChat.participants?.length || 0}
                        </span>
                        {currentChat.is_private && (
                          <span style={styles.privateBadge}>Приватный</span>
                        )}
                      </div>
                    </div>
                    <div style={styles.chatActions}>
                      <button
                        onClick={() => setShowAddParticipantsModal(true)}
                        style={styles.actionButton}
                        className="chat-action-button"
                        title="Добавить участников"
                      >
                        👥 Добавить
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(`Удалить чат "${currentChat.name}"?`)
                          ) {
                            deleteChat(currentChat.id);
                          }
                        }}
                        style={{
                          ...styles.actionButton,
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                        }}
                        className="chat-action-button"
                        title="Удалить чат"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </div>
                </div>
                <div style={styles.messagesContainer}>
                  <MessageList messages={messages} />
                </div>
                <MessageInput />
              </>
            ) : (
              <div style={styles.placeholder}>
                <div style={styles.placeholderContent}>
                  <p style={styles.placeholderText}>
                    Выберите чат для начала общения
                  </p>
                  <p style={styles.placeholderSubtext}>
                    или создайте новый чат
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateChatModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <AddParticipantsModal
        isOpen={showAddParticipantsModal}
        onClose={() => setShowAddParticipantsModal(false)}
        chatId={currentChat?.id}
      />
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#626c79ff",
  },
  header: {
    background: "linear-gradient(to right, #8000207b 0%, #9c4f65ff 100%)",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #800020",
  },
  title: {
    color: "#e4d7deff",
    margin: 0,
    fontSize: "24px",
    fontWeight: "600" as const,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  welcome: {
    color: "#e4d7deff",
    fontSize: "16px",
  },
  logoutButton: {
    backgroundColor: "#800020",
    color: "#e4d7deff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600" as const,
  },
  error: {
    backgroundColor: "#c44569",
    color: "#f8f4e3",
    padding: "12px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
  },
  closeError: {
    background: "none",
    border: "none",
    color: "#f8f4e3",
    fontSize: "20px",
    cursor: "pointer",
    padding: "0",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: "20px",
    height: "calc(100vh - 120px)",
  },
  chatContainer: {
    display: "flex",
    height: "100%",
    background: "linear-gradient(to top, #a1a9c1ff 0%, #D9E1F2 100%)",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  sidebar: {
    width: "350px",
    background: "radial-gradient(circle at center, #ffd0ddff 0%, #d0def2 100%)",
    borderRight: "2px solid #800020",
    display: "flex",
    flexDirection: "column" as const,
  },
  sidebarHeader: {
    padding: "20px",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  sidebarTitle: {
    color: "#800020",
    margin: 0,
    fontSize: "18px",
    fontWeight: "600" as const,
  },
  createButton: {
    backgroundColor: "#800020",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "#f8f4e3",
  },
  chatHeader: {
    padding: "20px",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  chatHeaderContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    margin: "0 0 8px 0",
    color: "#2c2c2c",
    fontSize: "20px",
    fontWeight: "600" as const,
  },
  chatDescription: {
    margin: "0 0 12px 0",
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.4",
  },
  participantsInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    color: "#666",
  },
  privateBadge: {
    backgroundColor: "#800020",
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600" as const,
  },
  chatActions: {
    display: "flex",
    gap: "12px",
  },
  actionButton: {
    padding: "8px 16px",
    border: "1px solid #800020",
    borderRadius: "6px",
    backgroundColor: "transparent",
    color: "#800020",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600" as const,
  },
  messagesContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  },
  placeholder: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f4e3",
  },
  placeholderContent: {
    textAlign: "center" as const,
    padding: "40px",
  },
  placeholderText: {
    color: "#80002060",
    fontSize: "20px",
    marginBottom: "12px",
    fontWeight: "600" as const,
  },
  placeholderSubtext: {
    color: "#80002040",
    fontSize: "16px",
  },
};

// Обновляем hover эффекты
const hoverStyles = `
  .dashboard-logout-button:hover {
    background-color: #c44569 !important;
  }
  
  .dashboard-create-button:hover {
    background-color: #c44569 !important;
    transform: scale(1.05);
  }
  
  .chat-action-button:hover {
    background-color: #800020 !important;
    color: white !important;
  }
  
  .chat-action-button[style*="background-color: #dc3545"]:hover {
    background-color: #c82333 !important;
  }
`;

// Добавляем стили в документ
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = hoverStyles;
  document.head.appendChild(style);
}

export default Dashboard;
