// src/components/ErrorBoundary.tsx
import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={errorStyles.container}>
          <div style={errorStyles.card}>
            <h2 style={errorStyles.title}>Что-то пошло не так</h2>
            <p style={errorStyles.message}>
              {this.state.error?.message || "Произошла непредвиденная ошибка"}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={errorStyles.button}
            >
              🔄 Перезагрузить приложение
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const errorStyles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at center, #7791d9ff 0%, #d0def2 100%)",
    padding: "20px",
  },
  card: {
    backgroundColor: "#7f4153ff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    textAlign: "center" as const,
    maxWidth: "400px",
    width: "100%",
  },
  title: {
    color: "#f8f4e3",
    marginBottom: "20px",
    fontSize: "24px",
  },
  message: {
    color: "#f8f4e3",
    marginBottom: "30px",
    fontSize: "16px",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#800020",
    color: "#f8f4e3",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
