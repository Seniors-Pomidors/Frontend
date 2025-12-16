// src/components/AuthForm.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const {
    user,
    login,
    register,
    isLoading,
    apiStatus,
    registrationSuccess,
    resetRegistrationSuccess,
  } = useAuth();

  useEffect(() => {
    console.log("AuthForm - обновление состояния:");
    console.log("user:", user);
    console.log("apiStatus:", apiStatus);
    console.log("isLoading:", isLoading);
    console.log("error:", error);
    console.log("registrationSuccess:", registrationSuccess);
  }, [user, apiStatus, isLoading, error, registrationSuccess]);

  // Редирект при успешной аутентификации (только после логина)
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Обработка успешной регистрации - переключаем на форму входа
  useEffect(() => {
    if (registrationSuccess) {
      console.log("Регистрация успешна, переключаем на форму входа");
      setIsLogin(true); // Переключаем на форму входа
      resetRegistrationSuccess(); // Сбрасываем флаг
      setError(""); // Очищаем ошибки
      // Можно также показать сообщение об успехе
      //setError("Регистрация успешна! Теперь вы можете войти в систему.");
      // Очищаем форму
      setFormData({
        email: formData.email, // Оставляем email для удобства
        username: "",
        password: "",
      });
    }
  }, [registrationSuccess, resetRegistrationSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Начало процесса авторизации...");
      console.log("Данные формы:", formData);
      console.log("Статус API:", apiStatus);

      if (isLogin) {
        console.log("Вызов login...");
        await login({ email: formData.email, password: formData.password });
        console.log("Login завершен");
      } else {
        console.log("Вызов register...");
        await register(formData);
        console.log("Register завершен");
      }

      console.log("Авторизация успешна, должен произойти редирект");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      console.error("Ошибка авторизации:", err);
      setError(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Функция для переключения между логином и регистрацией
  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setError(""); // Очищаем ошибки при переключении
    // Сбрасываем форму при переключении
    setFormData({
      email: formData.email, // Оставляем email для удобства
      username: "",
      password: "",
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Статус подключения к API */}
        <div style={styles.apiStatus}>
          {apiStatus === "checking" && (
            <span style={styles.statusChecking}> Проверка соединения...</span>
          )}
          {apiStatus === "success" && (
            <span style={styles.statusSuccess}> </span> /*Бэкэнд доступен*/
          )}
          {apiStatus === "error" && (
            <span style={styles.statusError}> Бэкенд недоступен...</span>
          )}
        </div>

        <h2 style={styles.title}>{isLogin ? "Вход ProdPal" : "Регистрация"}</h2>

        {error && (
          <div
            style={{
              ...styles.error,
              backgroundColor: error.includes("успешна")
                ? "#4CAF50"
                : "#c44569",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {!isLogin && (
            <div style={styles.inputGroup}>
              <input
                type="text"
                name="username"
                placeholder="Имя пользователя"
                value={formData.username}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: apiStatus !== "success" ? 0.6 : 1,
              cursor: apiStatus !== "success" ? "not-allowed" : "pointer",
            }}
            disabled={isLoading || apiStatus !== "success"}
          >
            {isLoading
              ? "Загрузка..."
              : isLogin
              ? "Войти"
              : "Зарегистрироваться"}
          </button>
        </form>

        <div style={styles.switch}>
          <span style={styles.switchText}>
            {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
          </span>
          <button
            type="button"
            onClick={handleSwitchMode}
            style={styles.switchButton}
          >
            {isLogin ? "Зарегистрироваться" : "Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}; //стили те же - без изменений

const styles = {
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
    width: "100%",
    maxWidth: "400px",
  },
  apiStatus: {
    marginBottom: "20px",
    textAlign: "center" as const,
  },
  statusChecking: {
    color: "#f8f4e3",
  },
  statusSuccess: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  statusError: {
    color: "#ff6b6b",
    fontWeight: "600",
  },
  title: {
    color: "#f8f4e3",
    textAlign: "center" as const,
    marginBottom: "30px",
    fontSize: "24px",
    fontWeight: "600",
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
  input: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "2px solid #800020",
    backgroundColor: "#f8f4e3",
    color: "#2c2c2c",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#800020",
    color: "#f8f4e3",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  switch: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "20px",
    paddingTop: "20px",
    /*borderTop: "1px solid #8b4513",*/
  },
  switchText: {
    color: "#f8f4e3",
  },
  switchButton: {
    background: "none",
    border: "none",
    color: "#c44569",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "14px",
  },
  error: {
    backgroundColor: "#c44569",
    color: "#f8f4e3",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center" as const,
  },
};
