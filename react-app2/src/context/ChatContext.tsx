// src/context/ChatContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { Chat, Message, CreateChatData } from "../types/chat";
import { chatAPI } from "../services/api";
import { useAuth } from "./AuthContext";

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  error: string;
  selectChat: (chat: Chat | null) => void;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: number) => Promise<void>;
  createChat: (chatData: CreateChatData) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (messageId: number) => Promise<void>;
  deleteChat: (chatId: number) => Promise<void>;
  addParticipantsToChat: (chatId: number, usernames: string[]) => Promise<void>;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const clearError = () => setError("");

  const loadChats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log("Загрузка чатов...");
      const chatsData = await chatAPI.getChats();
      console.log("Получены чаты с сервера:", chatsData);

      // Доверяем серверу - он должен возвращать только чаты, доступные пользователю
      const userChats = chatsData;

      console.log("Чаты для отображения:", userChats.length);

      // Проверяем структуру данных
      userChats.forEach((chat: Chat, index: number) => {
        console.log(`Чат ${index}:`, {
          id: chat.id,
          name: chat.name,
          participants: chat.participants?.length,
          last_message: chat.last_message,
          hasLastMessage: !!chat.last_message,
          lastMessageContent: chat.last_message?.content,
        });
      });

      // Загружаем последние сообщения для каждого чата, если их нет
      const updatedChats = await Promise.all(
        userChats.map(async (chat: Chat) => {
          // Если у чата уже есть последнее сообщение, оставляем как есть
          if (chat.last_message && chat.last_message.content) {
            return chat;
          }

          // Если последнего сообщения нет, загружаем сообщения и берем последнее
          try {
            console.log(
              `Загрузка сообщений для чата ${chat.id} для обновления last_message...`
            );
            const messages = await chatAPI.getMessages(chat.id);

            if (messages.length > 0) {
              // СОРТИРУЕМ сообщения по дате (от старых к новым) и берем ПОСЛЕДНЕЕ
              const sortedMessages = messages.sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              );
              const lastMessage = sortedMessages[sortedMessages.length - 1];
              console.log(
                `Обновлен last_message для чата ${chat.id}:`,
                lastMessage.content
              );
              return {
                ...chat,
                last_message: lastMessage,
              };
            }
          } catch (error) {
            console.error(
              `Ошибка загрузки сообщений для чата ${chat.id}:`,
              error
            );
          }

          return chat;
        })
      );

      setChats(updatedChats);
      console.log("Чаты загружены и обновлены:", updatedChats.length);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ошибка загрузки чатов";
      setError(errorMessage);
      console.error("Ошибка загрузки чатов:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: number) => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log(`Загрузка сообщений для чата ${chatId}...`);
      const messagesData = await chatAPI.getMessages(chatId);

      // Сортируем сообщения по дате создания (от старых к новым)
      const sortedMessages = messagesData.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessages(sortedMessages);
      console.log(
        "Сообщения загружены и отсортированы:",
        sortedMessages.length
      );

      // Обновляем последнее сообщение в списке чатов
      if (sortedMessages.length > 0) {
        const lastMessage = sortedMessages[sortedMessages.length - 1];
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId ? { ...chat, last_message: lastMessage } : chat
          )
        );
        console.log(`Last_message обновлен для чата ${chatId}`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ошибка загрузки сообщений";
      setError(errorMessage);
      console.error("Ошибка загрузки сообщений:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectChat = async (chat: Chat | null) => {
    // Доверяем серверу - если чат в списке, значит у пользователя есть доступ
    setCurrentChat(chat);
    setMessages([]);

    if (chat) {
      await loadMessages(chat.id);
    }
  };

  const createChat = async (chatData: CreateChatData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log("Создание нового чата...");

      // ⚠️ НЕ добавляем текущего пользователя - сервер сделает это автоматически
      const chatDataWithCreator = {
        ...chatData,
        // Используем исходный список участников
        participant_usernames: chatData.participant_usernames,
      };

      console.log("Данные для создания чата:", chatDataWithCreator);

      const newChat = await chatAPI.createChat(chatDataWithCreator);

      console.log("Созданный чат:", newChat);

      // Обновляем список чатов
      setChats((prev) => [newChat, ...prev]);

      // Выбираем созданный чат
      setCurrentChat(newChat);
      await loadMessages(newChat.id);

      console.log("Чат создан и выбран:", newChat);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ошибка создания чата";
      setError(errorMessage);
      console.error("Ошибка создания чата:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentChat || !user) return;

    try {
      console.log("Отправка сообщения...");
      const newMessage = await chatAPI.sendMessage(currentChat.id, {
        content,
        chat_id: currentChat.id,
      });

      // Добавляем сообщение в список
      setMessages((prev) => [...prev, newMessage]);

      // Обновляем последнее сообщение в списке чатов
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChat.id
            ? { ...chat, last_message: newMessage }
            : chat
        )
      );

      console.log("Сообщение отправлено:", newMessage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ошибка отправки сообщения";
      setError(errorMessage);
      console.error("Ошибка отправки сообщения:", err);
      throw err;
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!currentChat || !user) return;

    try {
      console.log("Удаление сообщения...");
      await chatAPI.deleteMessage(currentChat.id, messageId);

      // Удаляем сообщение из списка
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      // Обновляем только текущий чат, чтобы обновить last_message
      try {
        const updatedChat = await chatAPI.getChat(currentChat.id);
        setChats((prev) =>
          prev.map((chat) => (chat.id === currentChat.id ? updatedChat : chat))
        );

        // Если текущий чат активен, обновляем его
        if (currentChat.id === updatedChat.id) {
          setCurrentChat(updatedChat);
        }
      } catch (error) {
        console.error(
          "Ошибка обновления чата после удаления сообщения:",
          error
        );
        // Продолжаем работу даже если не удалось обновить чат
      }

      console.log("Сообщение удалено");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ошибка удаления сообщения";
      setError(errorMessage);
      console.error("Ошибка удаления сообщения:", err);
      throw err;
    }
  };

  const deleteChat = async (chatId: number) => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log("Удаление чата...");
      await chatAPI.deleteChat(chatId);

      // Удаляем чат из списка
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));

      // Если удаляемый чат активен, очищаем текущий чат
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }

      console.log("Чат удален из состояния");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ошибка удаления чата";
      setError(errorMessage);
      console.error("Ошибка удаления чата:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addParticipantsToChat = async (chatId: number, usernames: string[]) => {
    if (!user || usernames.length === 0) return;

    try {
      console.log(`Добавление участников в чат ${chatId}:`, usernames);
      await chatAPI.addParticipantsByUsernames(chatId, usernames);

      // Обновляем информацию о чате
      const updatedChat = await chatAPI.getChat(chatId);

      // Обновляем чат в списке
      setChats((prev) =>
        prev.map((chat) => (chat.id === chatId ? updatedChat : chat))
      );

      // Если текущий чат активен, обновляем его
      if (currentChat?.id === chatId) {
        setCurrentChat(updatedChat);
      }

      console.log("Участники добавлены");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ошибка добавления участников";
      setError(errorMessage);
      console.error("Ошибка добавления участников:", err);
      throw err;
    }
  };

  // Загружаем чаты при монтировании компонента и при изменении пользователя
  useEffect(() => {
    if (user) {
      loadChats();
    } else {
      // Если пользователь вышел, очищаем данные чатов
      setChats([]);
      setCurrentChat(null);
      setMessages([]);
    }
  }, [user]);

  const value: ChatContextType = {
    chats,
    currentChat,
    messages,
    isLoading,
    error,
    selectChat,
    loadChats,
    loadMessages,
    createChat,
    sendMessage,
    deleteMessage,
    deleteChat,
    addParticipantsToChat,
    clearError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
