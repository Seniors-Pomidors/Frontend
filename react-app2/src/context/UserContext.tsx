// src/context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSearchResult } from "../types/user";
import { userAPI } from "../services/api";
import { useAuth } from "./AuthContext";

interface UserContextType {
  allUsers: UserSearchResult[];
  isLoading: boolean;
  error: string;
  searchUsers: (query: string) => Promise<UserSearchResult[]>;
  loadAllUsers: () => Promise<void>;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [allUsers, setAllUsers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user: currentUser } = useAuth();

  const clearError = () => setError("");

  const loadAllUsers = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      console.log("Загрузка всех пользователей...");
      const users = await userAPI.getAllUsers();

      // Фильтруем текущего пользователя из списка
      const filteredUsers = users.filter((user) => user.id !== currentUser.id);

      setAllUsers(filteredUsers);
      console.log("Все пользователи загружены:", filteredUsers.length);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ошибка загрузки пользователей";
      setError(errorMessage);
      console.error("Ошибка загрузки пользователей:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async (query: string): Promise<UserSearchResult[]> => {
    if (!currentUser) return [];

    try {
      // Если запрос пустой, возвращаем всех пользователей (кроме текущего)
      if (!query.trim()) {
        return allUsers;
      }

      // Пробуем поиск через API
      console.log(`Поиск пользователей по запросу: "${query}"`);
      const results = await userAPI.searchUsers(query.trim());

      // Фильтруем текущего пользователя и возвращаем результаты
      return results.filter((user) => user.id !== currentUser.id);
    } catch (error) {
      console.error("Ошибка поиска пользователей через API:", error);

      // Fallback: поиск по локальному списку пользователей
      console.log("Используем локальный поиск по загруженным пользователям");
      return allUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
      );
    }
  };

  // Загружаем всех пользователей при монтировании компонента
  useEffect(() => {
    if (currentUser) {
      loadAllUsers();
    } else {
      setAllUsers([]);
    }
  }, [currentUser]);

  const value: UserContextType = {
    allUsers,
    isLoading,
    error,
    searchUsers,
    loadAllUsers,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
};
