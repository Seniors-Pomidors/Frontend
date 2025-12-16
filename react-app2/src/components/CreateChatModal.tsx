// src/components/CreateChatModal.tsx
import React, { useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateChatModal: React.FC<CreateChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [chatName, setChatName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [chatType, setChatType] = useState("group");
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { createChat, isLoading } = useChat();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!chatName.trim()) {
      setError("Введите название чата");
      return;
    }

    if (selectedUsernames.length === 0) {
      setError("Добавьте хотя бы одного участника");
      return;
    }

    // ⚠️ ВАЖНО: Автоматически определяем тип чата
    // Если 1 участник - личная переписка, если больше - групповой
    const finalChatType = selectedUsernames.length === 1 ? "private" : chatType;

    // Для личных переписок название можно автоматически генерировать
    const finalChatName =
      selectedUsernames.length === 1
        ? `Чат с ${selectedUsernames[0]}`
        : chatName.trim();

    try {
      await createChat({
        name: finalChatName,
        description: description.trim(),
        is_private: isPrivate,
        participant_ids: [],
        participant_usernames: selectedUsernames, // 👈 Только другие пользователи
        type: finalChatType, // 👈 Используем автоматически определенный тип
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Ошибка создания чата:", error);
      setError(error instanceof Error ? error.message : "Ошибка создания чата");
    }
  };

  const resetForm = () => {
    setChatName("");
    setDescription("");
    setIsPrivate(false);
    setChatType("group");
    setSelectedUsernames([]);
    setUsernameInput("");
    setError("");
  };

  const handleAddUsername = () => {
    const trimmedUsername = usernameInput.trim();

    if (!trimmedUsername) {
      setError("Введите никнейм");
      return;
    }

    // ⚠️ Проверяем, не пытается ли пользователь добавить самого себя
    if (user?.username && trimmedUsername === user.username) {
      setError("Нельзя добавить самого себя");
      return;
    }

    if (selectedUsernames.includes(trimmedUsername)) {
      setError("Этот пользователь уже добавлен");
      return;
    }

    setSelectedUsernames((prev) => [...prev, trimmedUsername]);
    setUsernameInput("");
    setError("");
  };

  const handleRemoveUsername = (username: string) => {
    setSelectedUsernames((prev) => prev.filter((u) => u !== username));
    setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUsername();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Создать новый чат</h3>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Название чата *</label>
            <input
              type="text"
              value={chatName}
              onChange={(e) => {
                setChatName(e.target.value);
                setError("");
              }}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Описание</label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError("");
              }}
              style={styles.textarea}
              rows={3}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Тип чата</label>
            <select
              value={chatType}
              onChange={(e) => {
                setChatType(e.target.value);
                setError("");
              }}
              style={styles.select}
            >
              <option value="group">Групповой чат</option>
              <option value="private">Личная переписка</option>
              <option value="channel">Канал</option>
            </select>
          </div>

          <div style={styles.participantsSection}>
            <label style={styles.label}>
              Добавить участников по никнейму *
            </label>

            <div style={styles.usernameInputContainer}>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="Введите никнейм пользователя..."
                style={styles.usernameInput}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleAddUsername}
                disabled={isLoading}
                style={styles.addUsernameButton}
              >
                Добавить
              </button>
            </div>

            <div style={styles.usernameHint}>
              Введите никнейм пользователя и нажмите "Добавить"
            </div>

            {selectedUsernames.length > 0 && (
              <div style={styles.selectedUsernames}>
                <h4 style={styles.subtitle}>Выбранные участники:</h4>
                {selectedUsernames.map((username) => (
                  <div key={username} style={styles.selectedUsername}>
                    <span>@{username}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUsername(username)}
                      style={styles.removeButton}
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div style={styles.usernamesCount}>
                  Всего участников: {selectedUsernames.length}
                </div>
              </div>
            )}
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => {
                  setIsPrivate(e.target.checked);
                  setError("");
                }}
                style={styles.checkbox}
                disabled={isLoading}
              />
              Приватный чат
            </label>
          </div>

          <div style={styles.buttons}>
            <button
              type="button"
              onClick={handleClose}
              style={styles.cancelButton}
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={
                !chatName.trim() || selectedUsernames.length === 0 || isLoading
              }
              style={styles.submitButton}
            >
              {isLoading ? "Создание..." : "Создать чат"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "80vh",
    overflowY: "auto" as const,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  },
  title: {
    marginBottom: "20px",
    color: "#2c2c2c",
    textAlign: "center" as const,
    fontSize: "20px",
    fontWeight: "600" as const,
  },
  errorMessage: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "20px",
    fontSize: "14px",
    textAlign: "center" as const,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
  },
  label: {
    marginBottom: "8px",
    color: "#2c2c2c",
    fontWeight: "600" as const,
    fontSize: "14px",
  },
  input: {
    padding: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
  },
  textarea: {
    padding: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical" as const,
    fontFamily: "inherit",
    outline: "none",
  },
  select: {
    padding: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    outline: "none",
  },
  participantsSection: {
    marginBottom: "20px",
  },
  usernameInputContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },
  usernameInput: {
    flex: 1,
    padding: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
  },
  addUsernameButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#800020",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600" as const,
  },
  usernameHint: {
    fontSize: "12px",
    color: "#666",
    marginBottom: "15px",
    fontStyle: "italic" as const,
  },
  selectedUsernames: {
    marginTop: "15px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },
  subtitle: {
    marginBottom: "10px",
    color: "#2c2c2c",
    fontSize: "16px",
    fontWeight: "600" as const,
  },
  selectedUsername: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "white",
    borderRadius: "6px",
    marginBottom: "8px",
    border: "1px solid #e0e0e0",
  },
  removeButton: {
    background: "none",
    border: "none",
    color: "#c44569",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold" as const,
    padding: "0 8px",
  },
  usernamesCount: {
    fontSize: "12px",
    color: "#666",
    marginTop: "10px",
    textAlign: "center" as const,
  },
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    color: "#2c2c2c",
    cursor: "pointer",
    fontSize: "14px",
  },
  checkbox: {
    marginRight: "8px",
    width: "16px",
    height: "16px",
  },
  buttons: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "10px",
  },
  cancelButton: {
    padding: "12px 24px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    backgroundColor: "white",
    color: "#2c2c2c",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600" as const,
  },
  submitButton: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#800020",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600" as const,
  },
};

export default CreateChatModal;
