// src/components/MessageInput.tsx
import React, { useState } from "react";
import { useChat } from "../context/ChatContext";

export const MessageInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const { sendMessage, isLoading, currentChat } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentChat) return;

    try {
      await sendMessage(message.trim());
      setMessage("");
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение... (Shift+Enter для новой строки)"
          style={styles.textarea}
          disabled={isLoading || !currentChat}
          rows={1}
          onInput={(e) => {
            // Автоматическое изменение высоты textarea
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = Math.min(target.scrollHeight, 120) + "px";
          }}
        />
        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: !message.trim() || isLoading || !currentChat ? 0.5 : 1,
          }}
          disabled={!message.trim() || isLoading || !currentChat}
        >
          📤
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    borderTop: "1px solid #e0e0e0",
    backgroundColor: "white",
  },
  form: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "12px 16px",
    border: "1px solid #e0e0e0",
    borderRadius: "25px",
    outline: "none",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "none" as const,
    minHeight: "44px",
    maxHeight: "120px",
    lineHeight: "1.4",
    overflowY: "auto" as const,
  },
  button: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "25px",
    backgroundColor: "#800020",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    height: "44px",
    flexShrink: 0,
  },
};

export default MessageInput;
