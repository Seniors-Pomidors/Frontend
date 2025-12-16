// src/components/AddParticipantsModal.tsx
import React, { useState, useEffect } from "react";
import { UserSearchResult } from "../types/user";
import { useUsers } from "../context/UserContext";

interface AddParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParticipants: (userIds: number[]) => void;
  existingParticipants: number[];
  chatId?: number;
}

export const AddParticipantsModal: React.FC<AddParticipantsModalProps> = ({
  isOpen,
  onClose,
  onAddParticipants,
  existingParticipants,
  chatId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchUsers, allUsers } = useUsers();

  useEffect(() => {
    const performSearch = async () => {
      if (!isOpen) return;

      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);

        // Фильтруем уже выбранных пользователей и существующих участников
        const filteredResults = results.filter(
          (user) =>
            !selectedUsers.some((selected) => selected.id === user.id) &&
            !existingParticipants.includes(user.id)
        );

        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Ошибка поиска пользователей:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedUsers, existingParticipants, isOpen, searchUsers]);

  const handleAddUser = (user: UserSearchResult) => {
    setSelectedUsers((prev) => [...prev, user]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const handleSubmit = () => {
    const userIds = selectedUsers.map((user) => user.id);
    onAddParticipants(userIds);
    setSelectedUsers([]);
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>
          {chatId ? "Добавить участников" : "Выберите участников"}
        </h3>

        {/* Выбранные пользователи */}
        {selectedUsers.length > 0 && (
          <div style={styles.selectedUsers}>
            <h4 style={styles.subtitle}>Выбранные пользователи:</h4>
            {selectedUsers.map((user) => (
              <div key={user.id} style={styles.selectedUser}>
                <span>
                  {user.username} ({user.email})
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveUser(user.id)}
                  style={styles.removeButton}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Поиск пользователей */}
        <div style={styles.searchSection}>
          <label style={styles.label}>Поиск пользователей:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введите имя пользователя или email..."
            style={styles.searchInput}
          />

          {/* Результаты поиска */}
          {isSearching && <div style={styles.loading}>Поиск...</div>}

          {searchResults.length > 0 && (
            <div style={styles.searchResults}>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  style={styles.searchResult}
                  onClick={() => handleAddUser(user)}
                >
                  <div style={styles.userInfo}>
                    <strong>{user.username}</strong>
                    <span style={styles.userEmail}>{user.email}</span>
                  </div>
                  <button type="button" style={styles.addButton}>
                    +
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQuery && !isSearching && searchResults.length === 0 && (
            <div style={styles.noResults}>
              {allUsers.length === 0
                ? "Не удалось загрузить пользователей"
                : "Пользователи не найдены"}
            </div>
          )}

          {!searchQuery && !isSearching && (
            <div style={styles.hint}>
              Начните вводить имя или email для поиска
              {allUsers.length > 0 && (
                <div style={styles.usersCount}>
                  Всего пользователей в системе: {allUsers.length}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={styles.buttons}>
          <button
            type="button"
            onClick={handleClose}
            style={styles.cancelButton}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0}
            style={{
              ...styles.submitButton,
              opacity: selectedUsers.length === 0 ? 0.5 : 1,
            }}
          >
            {chatId ? "Добавить" : "Продолжить"}
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
  subtitle: {
    marginBottom: "10px",
    color: "#2c2c2c",
    fontSize: "16px",
    fontWeight: "600" as const,
  },
  selectedUsers: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },
  selectedUser: {
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
  searchSection: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#2c2c2c",
    fontWeight: "600" as const,
    fontSize: "14px",
  },
  searchInput: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    marginBottom: "10px",
  },
  searchResults: {
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    maxHeight: "200px",
    overflowY: "auto" as const,
  },
  searchResult: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    borderBottom: "1px solid #f0f0f0",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column" as const,
  },
  userEmail: {
    fontSize: "12px",
    color: "#666",
    marginTop: "2px",
  },
  addButton: {
    background: "none",
    border: "none",
    color: "#800020",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold" as const,
    padding: "0 8px",
  },
  loading: {
    padding: "12px",
    textAlign: "center" as const,
    color: "#666",
    fontStyle: "italic" as const,
  },
  noResults: {
    padding: "12px",
    textAlign: "center" as const,
    color: "#666",
  },
  hint: {
    padding: "12px",
    textAlign: "center" as const,
    color: "#666",
    fontStyle: "italic" as const,
  },
  usersCount: {
    fontSize: "12px",
    marginTop: "5px",
    color: "#999",
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

// Добавляем hover эффекты
const hoverStyles = `
  .search-result:hover {
    background-color: #f5f5f5 !important;
  }
  
  .add-button:hover {
    background-color: #800020 !important;
    color: white !important;
    border-radius: 50% !important;
  }
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = hoverStyles;
  document.head.appendChild(style);
}

export default AddParticipantsModal;
