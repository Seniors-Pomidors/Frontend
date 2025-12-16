// src/components/AddParticipantsModal.tsx
import React, { useState } from "react";
import { useChat } from "../context/ChatContext";

interface AddParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId?: number;
}

export const AddParticipantsModal: React.FC<AddParticipantsModalProps> = ({
  isOpen,
  onClose,
  chatId,
}) => {
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { addParticipantsToChat } = useChat();

  const handleAddUsername = () => {
    const trimmedUsername = usernameInput.trim();
    if (trimmedUsername && !selectedUsernames.includes(trimmedUsername)) {
      setSelectedUsernames((prev) => [...prev, trimmedUsername]);
      setUsernameInput("");
      setError("");
    }
  };

  const handleRemoveUsername = (username: string) => {
    setSelectedUsernames((prev) => prev.filter((u) => u !== username));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUsername();
    }
  };

  const handleSubmit = async () => {
    if (!chatId || selectedUsernames.length === 0) return;

    setIsLoading(true);
    setError("");

    try {
      await addParticipantsToChat(chatId, selectedUsernames);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Ошибка добавления участников:", error);
      setError("Ошибка при добавлении участников. Проверьте никнеймы.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUsernameInput("");
    setSelectedUsernames([]);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Добавить участников в чат</h3>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.inputSection}>
          <label style={styles.label}>Добавить участника по никнейму:</label>
          <div style={styles.usernameInputContainer}>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите никнейм пользователя..."
              style={styles.usernameInput}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleAddUsername}
              disabled={!usernameInput.trim() || isLoading}
              style={styles.addUsernameButton}
            >
              Добавить
            </button>
          </div>

          <div style={styles.usernameHint}>
            Введите никнейм пользователя и нажмите "Добавить"
          </div>
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
              Всего участников для добавления: {selectedUsernames.length}
            </div>
          </div>
        )}

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
            type="button"
            onClick={handleSubmit}
            disabled={selectedUsernames.length === 0 || isLoading}
            style={{
              ...styles.submitButton,
              opacity: selectedUsernames.length === 0 ? 0.5 : 1,
            }}
          >
            {isLoading ? "Добавление..." : "Добавить участников"}
          </button>
        </div>
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
    zIndex: 1001,
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
  error: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  inputSection: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#2c2c2c",
    fontWeight: "600" as const,
    fontSize: "14px",
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
    fontStyle: "italic" as const,
  },
  selectedUsernames: {
    marginBottom: "20px",
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
  buttons: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
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

export default AddParticipantsModal;
