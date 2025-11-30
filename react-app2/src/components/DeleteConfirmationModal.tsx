// src/components/DeleteConfirmationModal.tsx
import React from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttons}>
          <button onClick={onClose} style={styles.cancelButton}>
            Отмена
          </button>
          <button onClick={onConfirm} style={styles.deleteButton}>
            Удалить
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
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    textAlign: "center" as const,
  },
  title: {
    marginBottom: "15px",
    color: "#2c2c2c",
    fontSize: "18px",
    fontWeight: "600" as const,
  },
  message: {
    marginBottom: "25px",
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  buttons: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
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
  deleteButton: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#dc3545",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600" as const,
  },
};

export default DeleteConfirmationModal;
