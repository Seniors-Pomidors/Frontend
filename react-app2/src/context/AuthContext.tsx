// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, LoginData, RegisterData } from "../types/auth";
import { authAPI } from "../services/api";

interface AuthContextType {
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  apiStatus: string;
  testApiConnection: () => Promise<boolean>;
  registrationSuccess: boolean;
  resetRegistrationSuccess: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<string>("checking");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const testApiConnection = async (): Promise<boolean> => {
    try {
      console.log("Проверка соединения с бэкендом...");
      setApiStatus("checking");
      await authAPI.testConnection();
      setApiStatus("success");
      console.log("Бэкенд доступен");
      return true;
    } catch (err) {
      setApiStatus("error");
      console.error("Бэкенд недоступен:", err);
      return false;
    }
  };

  const resetRegistrationSuccess = () => {
    setRegistrationSuccess(false);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Начало инициализации auth...");

        // Сначала проверяем соединение с API
        const connectionSuccess = await testApiConnection();

        // Только если API доступен, восстанавливаем пользователя
        if (connectionSuccess) {
          // ИСПРАВЛЕНИЕ: проверяем, есть ли уже сессия в sessionStorage
          const hasExistingSession = sessionStorage.getItem("auth_initialized");

          if (!hasExistingSession) {
            // Это новая сессия - очищаем старые данные и устанавливаем флаг
            console.log("Новая сессия - очищаем данные авторизации");
            sessionStorage.removeItem("auth_token");
            sessionStorage.removeItem("user_data");
            sessionStorage.setItem("auth_initialized", "true");
          } else {
            // Это существующая сессия - восстанавливаем пользователя
            const token = sessionStorage.getItem("auth_token");
            const userData = sessionStorage.getItem("user_data");

            console.log("Данные из sessionStorage:");
            console.log("Token:", token);
            console.log("UserData:", userData);

            if (token && userData) {
              try {
                const parsedUser = JSON.parse(userData);
                console.log("Пользователь восстановлен:", parsedUser);
                setUser(parsedUser);
              } catch (parseError) {
                console.error("Ошибка парсинга user_data:", parseError);
                sessionStorage.removeItem("auth_token");
                sessionStorage.removeItem("user_data");
              }
            } else {
              console.log("Нет сохраненных данных пользователя");
            }
          }
        }
      } catch (error) {
        console.error("Ошибка инициализации auth:", error);
      } finally {
        setIsLoading(false);
        console.log("Инициализация auth завершена");
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    if (apiStatus !== "success") {
      const connected = await testApiConnection();
      if (!connected) {
        throw new Error("Бэкенд недоступен");
      }
    }

    setIsLoading(true);
    try {
      console.log("Попытка входа:", data.email);
      console.log("Отправка запроса к API...");

      const response = await authAPI.login(data);

      console.log("Успешный вход:", response.user);
      console.log("Получен токен:", response.token ? "да" : "нет");

      setUser(response.user);

      // Сохраняем в sessionStorage
      sessionStorage.setItem("auth_token", response.token);
      sessionStorage.setItem("user_data", JSON.stringify(response.user));
      // Устанавливаем флаг, что сессия инициализирована
      sessionStorage.setItem("auth_initialized", "true");

      console.log("Данные сохранены в sessionStorage");
      console.log("Текущий пользователь в состоянии:", response.user);
    } catch (error) {
      console.error("Ошибка входа:", error);
      console.error("Тип ошибки:", typeof error);
      console.error(
        "Стек ошибки:",
        error instanceof Error ? error.stack : "нет стека"
      );
      throw error;
    } finally {
      setIsLoading(false);
      console.log("🏁 Login процесс завершен, isLoading установлен в false");
    }
  };

  const register = async (data: RegisterData) => {
    if (apiStatus !== "success") {
      const connected = await testApiConnection();
      if (!connected) {
        throw new Error("Бэкенд недоступен");
      }
    }

    setIsLoading(true);
    try {
      console.log("Попытка регистрации:", data.email);
      const response = await authAPI.register(data);

      console.log("Успешная регистрация:", response.user);

      // ВАЖНО: Не устанавливаем пользователя и не сохраняем токен
      // Пользователь должен войти после регистрации
      setRegistrationSuccess(true);

      console.log("Регистрация успешна, пользователь должен войти");
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("Выход из системы");
    setUser(null);
    setRegistrationSuccess(false);

    // Очищаем sessionStorage
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_initialized");

    console.log("Данные удалены из sessionStorage");
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    apiStatus,
    testApiConnection,
    registrationSuccess,
    resetRegistrationSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
