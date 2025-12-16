// src/components/MessageList.tsx
import React, { useEffect, useRef, useState } from "react";
import { Message } from "../types/chat";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const { user } = useAuth();
  const { deleteMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<Message | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuOpen(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOwnMessage = (message: Message) => {
    return message.user_id === user?.id;
  };

  const handleMenuToggle = (e: React.MouseEvent, messageId: number) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === messageId ? null : messageId);
  };

  const handleDeleteClick = (message: Message) => {
    setDeleteModal(message);
    setMenuOpen(null);
  };

  const handleDeleteMessage = async () => {
    if (!deleteModal) return;

    try {
      await deleteMessage(deleteModal.id);
      setDeleteModal(null);
    } catch (error) {
      console.error("Ошибка удаления сообщения:", error);
    }
  };

  return (
    <div style={styles.container}>
      {messages.length === 0 ? (
        <div style={styles.emptyState}>
          <p>Нет сообщений</p>
          <p style={styles.emptySubtext}>Начните общение!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            style={{
              ...styles.messageWrapper,
              justifyContent: isOwnMessage(message) ? "flex-end" : "flex-start",
            }}
          >
            <div style={styles.messageContent}>
              {!isOwnMessage(message) && message.user && (
                <div style={styles.userInfo}>{message.user.username}</div>
              )}

              <div style={styles.bubbleContainer}>
                <div
                  style={{
                    ...styles.messageBubble,
                    ...(isOwnMessage(message)
                      ? styles.ownMessage
                      : styles.otherMessage),
                  }}
                >
                  <div style={styles.messageText}>
                    {message.content.split("\n").map((line, index) => (
                      <div key={index}>
                        {line}
                        {index < message.content.split("\n").length - 1 && (
                          <br />
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={styles.messageTime}>
                    {formatTime(message.created_at)}
                  </div>
                </div>

                {/* Кнопка меню для своих сообщений */}
                {isOwnMessage(message) && (
                  <div style={styles.menuContainer}>
                    <button
                      onClick={(e) => handleMenuToggle(e, message.id)}
                      style={styles.menuButton}
                      className="message-menu-button"
                    >
                      ⋮
                    </button>

                    {/* Выпадающее меню */}
                    {menuOpen === message.id && (
                      <div
                        style={styles.dropdownMenu}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleDeleteClick(message)}
                          style={styles.deleteMenuItem}
                          className="delete-menu-item"
                        >
                          🗑️ Удалить
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />

      {/* Модальное окно подтверждения удаления */}
      <DeleteConfirmationModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDeleteMessage}
        title="Удаление сообщения"
        message="Вы уверены, что хотите удалить это сообщение? Это действие нельзя отменить."
      />
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "20px",
    backgroundColor: "#f8f4e3",
    display: "flex",
    flexDirection: "column" as const,
  },
  messageWrapper: {
    marginBottom: "15px",
    display: "flex",
    width: "100%",
  },
  messageContent: {
    display: "flex",
    flexDirection: "column" as const,
    maxWidth: "65%", // Уменьшена максимальная ширина
  },
  bubbleContainer: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  },
  messageBubble: {
    padding: "10px 14px",
    borderRadius: "18px",
    wordWrap: "break-word" as const,
    wordBreak: "break-word" as const,
    overflowWrap: "break-word" as const,
    maxWidth: "100%",
    minWidth: "60px",
    position: "relative" as const,
  },
  ownMessage: {
    backgroundColor: "#800020",
    color: "white",
    borderBottomRightRadius: "5px",
  },
  otherMessage: {
    backgroundColor: "white",
    color: "#2c2c2c",
    border: "1px solid #e0e0e0",
    borderBottomLeftRadius: "5px",
  },
  messageText: {
    whiteSpace: "pre-wrap" as const,
    wordWrap: "break-word" as const,
    lineHeight: "1.4",
    fontSize: "14px",
    maxWidth: "400px", // Ограничение ширины текста
  },
  userInfo: {
    fontSize: "12px",
    fontWeight: "600" as const,
    marginBottom: "4px",
    color: "#800020",
    paddingLeft: "12px",
  },
  messageTime: {
    fontSize: "11px",
    opacity: 0.8,
    marginTop: "6px",
    textAlign: "right" as const,
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "40px 20px",
    color: "#666",
  },
  emptySubtext: {
    fontSize: "14px",
    marginTop: "10px",
  },
  menuContainer: {
    position: "relative" as const,
    flexShrink: 0,
  },
  menuButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: "#666",
    padding: "5px 8px",
    borderRadius: "4px",
    transition: "background-color 0.2s ease",
    opacity: 0.7,
  },
  dropdownMenu: {
    position: "absolute" as const,
    top: "100%",
    right: 0,
    backgroundColor: "white",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    zIndex: 100,
    minWidth: "120px",
  },
  deleteMenuItem: {
    width: "100%",
    padding: "8px 12px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "left" as const,
    color: "#dc3545",
    transition: "background-color 0.2s ease",
  },
};

// Добавляем hover эффекты
const hoverStyles = `
  .message-menu-button:hover {
    background-color: rgba(0, 0, 0, 0.1) !important;
    opacity: 1 !important;
  }
  
  .delete-menu-item:hover {
    background-color: #f8f9fa !important;
  }
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = hoverStyles;
  document.head.appendChild(style);
}

export default MessageList;
