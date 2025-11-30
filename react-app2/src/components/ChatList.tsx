// src/components/ChatList.tsx
import React from "react";
import { Chat } from "../types/chat";

interface ChatListProps {
  chats: Chat[];
  currentChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  currentChat,
  onSelectChat,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Функция для получения отображаемого последнего сообщения
  const getLastMessagePreview = (chat: Chat) => {
    // Проверяем наличие сообщений в чате
    const hasMessages = chat.last_message && chat.last_message.content;

    if (!hasMessages) {
      return "Нет сообщений";
    }

    return truncateText(chat.last_message!.content, 35);
  };

  // Функция для проверки, есть ли вообще сообщения в чате
  const hasAnyMessages = (chat: Chat) => {
    return (
      chat.last_message &&
      chat.last_message.content &&
      chat.last_message.content.trim() !== ""
    );
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Чаты</h3>
      <div style={styles.chatList}>
        {chats.map((chat) => (
          <div
            key={chat.id}
            style={{
              ...styles.chatItem,
              ...(currentChat?.id === chat.id ? styles.activeChat : {}),
            }}
            onClick={() => onSelectChat(chat)}
          >
            <div style={styles.chatHeader}>
              <span style={styles.chatName}>{chat.name}</span>
              {hasAnyMessages(chat) && chat.last_message && (
                <span style={styles.time}>
                  {formatTime(chat.last_message.created_at)}
                </span>
              )}
            </div>
            <div style={styles.lastMessage}>{getLastMessagePreview(chat)}</div>
            {chat.unread_count && chat.unread_count > 0 && (
              <div style={styles.unreadBadge}>{chat.unread_count}</div>
            )}
          </div>
        ))}
        {chats.length === 0 && (
          <div style={styles.emptyState}>
            <p>Нет чатов</p>
            <p style={styles.emptySubtext}>Создайте первый чат!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
  },
  title: {
    color: "#800020",
    marginBottom: "20px",
    padding: "0 10px",
  },
  chatList: {
    flex: 1,
    overflowY: "auto" as const,
  },
  chatItem: {
    padding: "15px 10px",
    borderBottom: "1px solid #e0e0e0",
    cursor: "pointer",
    position: "relative" as const,
    transition: "background-color 0.2s ease",
    backgroundColor: "#f8f4e3",
  },
  activeChat: {
    backgroundColor: "#e8d4da",
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5px",
  },
  chatName: {
    fontWeight: "600" as const,
    color: "#2c2c2c",
    fontSize: "14px",
  },
  time: {
    fontSize: "11px",
    color: "#666",
  },
  lastMessage: {
    fontSize: "12px",
    color: "#666",
    lineHeight: "1.4",
    minHeight: "16px",
    fontStyle: "italic" as const,
  },
  unreadBadge: {
    position: "absolute" as const,
    top: "10px",
    right: "10px",
    backgroundColor: "#800020",
    color: "white",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
};

export default ChatList;
