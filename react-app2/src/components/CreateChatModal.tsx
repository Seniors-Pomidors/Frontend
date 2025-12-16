// src/components/CreateChatModal.tsx
import React, { useState } from "react";
import { useChat } from "../context/ChatContext";
import { AddParticipantsModal } from "./AddParticipantsModal";

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
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    []
  );
  const { createChat, isLoading } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatName.trim()) return;

    try {
      await createChat({
        name: chatName.trim(),
        description: description.trim(),
        is_private: isPrivate,
        participant_ids: selectedParticipants,
        type: chatType,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Ошибка создания чата:", error);
    }
  };

  const resetForm = () => {
    setChatName("");
    setDescription("");
    setIsPrivate(false);
    setChatType("group");
    setSelectedParticipants([]);
  };

  const handleAddParticipants = (userIds: number[]) => {
    setSelectedParticipants(userIds);
    setShowParticipantsModal(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h3 style={styles.title}>Создать новый чат</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Название чата *</label>
              <input
                type="text"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Описание</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.textarea}
                rows={3}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Тип чата</label>
              <select
                value={chatType}
                onChange={(e) => setChatType(e.target.value)}
                style={styles.select}
              >
                <option value="group">Групповой чат</option>
                <option value="private">Личная переписка</option>
                <option value="channel">Канал</option>
              </select>
            </div>

            <div style={styles.participantsSection}>
              <label style={styles.label}>Участники</label>
              <div style={styles.participantsInfo}>
                <span>
                  Выбрано: {selectedParticipants.length} пользователей
                </span>
                <button
                  type="button"
                  onClick={() => setShowParticipantsModal(true)}
                  style={styles.addParticipantsButton}
                >
                  {selectedParticipants.length > 0 ? "Изменить" : "Добавить"}{" "}
                  участников
                </button>
              </div>
            </div>

            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  style={styles.checkbox}
                />
                Приватный чат
              </label>
            </div>

            <div style={styles.buttons}>
              <button
                type="button"
                onClick={onClose}
                style={styles.cancelButton}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={!chatName.trim() || isLoading}
                style={styles.submitButton}
              >
                {isLoading ? "Создание..." : "Создать"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <AddParticipantsModal
        isOpen={showParticipantsModal}
        onClose={() => setShowParticipantsModal(false)}
        onAddParticipants={handleAddParticipants}
        existingParticipants={[]}
      />
    </>
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
    maxWidth: "450px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  },
  title: {
    marginBottom: "20px",
    color: "#2c2c2c",
    textAlign: "center" as const,
    fontSize: "20px",
    fontWeight: "600" as const,
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
    transition: "border-color 0.3s ease",
  },
  textarea: {
    padding: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical" as const,
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  select: {
    padding: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  participantsSection: {
    marginBottom: "20px",
  },
  participantsInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    fontSize: "14px",
  },
  addParticipantsButton: {
    padding: "8px 16px",
    border: "1px solid #800020",
    borderRadius: "6px",
    backgroundColor: "transparent",
    color: "#800020",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600" as const,
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
    transition: "background-color 0.3s ease",
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
    transition: "background-color 0.3s ease",
  },
};

// Добавляем hover эффекты
const hoverStyles = `
  .create-chat-input:focus,
  .create-chat-textarea:focus,
  .create-chat-select:focus {
    border-color: #800020 !important;
  }
  
  .create-chat-cancel:hover {
    background-color: #f5f5f5 !important;
  }
  
  .create-chat-submit:hover:not(:disabled) {
    background-color: #c44569 !important;
  }
  
  .add-participants-btn:hover {
    background-color: #800020 !important;
    color: white !important;
  }
`;

// Добавляем стили в документ
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = hoverStyles;
  document.head.appendChild(style);
}

export default CreateChatModal;
