// src/components/Dashboard.tsx
import React from "react";
import { useAuth } from "../context/AuthContext";

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>ProductivityPal</h1>
        <div style={styles.userInfo}>
          <span style={styles.welcome}>
            Добро пожаловать, {user?.username}!
          </span>
          <button onClick={logout} style={styles.logoutButton}>
            Выйти
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.chatContainer}>
          <div style={styles.sidebar}>
            <h3 style={styles.sidebarTitle}>Чаты</h3>
            <div style={styles.placeholder}>
              <p style={styles.placeholderText}>Список чатов появится здесь</p>
            </div>
          </div>

          <div style={styles.chatArea}>
            <div style={styles.placeholder}>
              <p style={styles.placeholderText}>
                Выберите чат для начала общения
              </p>
            </div>
          </div>
        </div>
      </div>
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
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  welcome: {
    color: "#e4d7deff",
  },
  logoutButton: {
    backgroundColor: "#800020",
    color: "#e4d7deff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  content: {
    padding: "20px",
  },
  chatContainer: {
    display: "flex",
    height: "calc(100vh - 120px)",
    background: "linear-gradient(to top, #a1a9c1ff 0%, #D9E1F2 100%)",
    borderRadius: "12px",
    overflow: "hidden",
  },
  sidebar: {
    width: "300px",
    background: "radial-gradient(circle at center, #ffd0ddff 0%, #d0def2 100%)",
    padding: "20px",
    borderRight: "2px solid #800020",
  },
  sidebarTitle: {
    color: "#8000209f",
    marginBottom: "20px",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    textAlign: "center" as const,
  },
  placeholderText: {
    color: "#80002060",
    fontSize: "18px",
  },
};
