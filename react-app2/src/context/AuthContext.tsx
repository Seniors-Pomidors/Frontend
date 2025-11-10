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
  registrationSuccess: boolean; // Добавляем новое состояние
  resetRegistrationSuccess: () => void; // Метод для сброса состояния
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<string>("checking");
  const [registrationSuccess, setRegistrationSuccess] = useState(false); // Новое состояние

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

  // Метод для сброса состояния успешной регистрации
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
          const token = localStorage.getItem("auth_token");
          const userData = localStorage.getItem("user_data");

          console.log("Данные из localStorage:");
          console.log("Token:", token);
          console.log("UserData:", userData);

          if (token && userData) {
            try {
              const parsedUser = JSON.parse(userData);
              console.log("Пользователь восстановлен:", parsedUser);
              setUser(parsedUser);
            } catch (parseError) {
              console.error("Ошибка парсинга user_data:", parseError);
              localStorage.removeItem("auth_token");
              localStorage.removeItem("user_data");
            }
          } else {
            console.log("Нет сохраненных данных пользователя");
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

      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user_data", JSON.stringify(response.user));

      console.log("Данные сохранены в localStorage");
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

      // ВАЖНОЕ ИЗМЕНЕНИЕ: Не устанавливаем пользователя и не сохраняем в localStorage
      // Вместо этого устанавливаем флаг успешной регистрации
      setRegistrationSuccess(true);

      console.log("Регистрация успешна, пользователь должен войти");

      // НЕ делаем этого:
      // setUser(response.user);
      // localStorage.setItem("auth_token", response.token);
      // localStorage.setItem("user_data", JSON.stringify(response.user));
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
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    console.log("Данные удалены из localStorage");
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    apiStatus,
    testApiConnection,
    registrationSuccess, // Добавляем в контекст
    resetRegistrationSuccess, // Добавляем в контекст
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
