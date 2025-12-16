// src/services/api.ts
import { LoginData, RegisterData, AuthResponse } from '../types/auth';
import { Chat, Message, CreateChatData, SendMessageData } from '../types/chat';
import { UserSearchResult } from '../types/user';

const API_BASE_URL = 'https://prodpal-backend.onrender.com';

// Функция для получения заголовков с авторизацией
const getAuthHeaders = () => {
  // Используем sessionStorage вместо localStorage
  const token = sessionStorage.getItem('auth_token');
  
  // ДИАГНОСТИКА
  console.log("🔐 getAuthHeaders вызван:");
  console.log("   Токен из sessionStorage:", token ? `есть (${token.length} символов)` : 'НЕТ!');
  console.log("   Все ключи в sessionStorage:");
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key || '');
    console.log(`     ${key}: ${value?.substring(0, 30)}...`);
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const authAPI = {
  async login(loginData: LoginData): Promise<AuthResponse> {
    console.log("Отправка запроса на /auth/login");
    console.log("Данные для входа:", { 
      email: loginData.email, 
      password: '***'
    });
    
    const url = `${API_BASE_URL}/auth/login`;
    console.log("URL:", url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      console.log("Ответ от сервера:");
      console.log("   Status:", response.status);
      console.log("   Status Text:", response.statusText);
      console.log("   OK:", response.ok);

      const responseText = await response.text();
      console.log("СЫРОЙ текст ответа:", responseText);
      console.log("Длина ответа:", responseText.length);
      
      if (responseText.length > 500) {
        console.log("Первые 500 символов:", responseText.substring(0, 500));
      } else {
        console.log("Полный текст:", responseText);
      }

      if (!response.ok) {
        console.error("Ошибка логина:", response.status, responseText);
        throw new Error(`Login failed: ${response.status} - ${responseText}`);
      }

      // Парсим JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("JSON парсинг успешен");
      } catch (parseError) {
        console.error("Ошибка парсинга JSON:", parseError);
        console.log("Проблемный текст:", responseText);
        throw new Error("Invalid JSON response from server");
      }
      
      // ДЕТАЛЬНАЯ ДИАГНОСТИКА
      console.log("ДЕТАЛЬНЫЙ АНАЛИЗ ОТВЕТА:");
      console.log("   Тип данных:", typeof data);
      console.log("   Является массивом?", Array.isArray(data));
      
      if (typeof data === 'object' && data !== null) {
        console.log("   Все ключи объекта:", Object.keys(data));
        
        // Выведем все ключи и их значения
        for (const key in data) {
          const value = data[key];
          let valuePreview = value;
          if (typeof value === 'string' && value.length > 100) {
            valuePreview = value.substring(0, 100) + '...';
          }
          console.log(`   ${key}:`, valuePreview, `(тип: ${typeof value})`);
        }
      } else {
        console.log("   Данные не объект:", data);
      }

      // АДАПТАЦИЯ РАЗЛИЧНЫХ ФОРМАТОВ ОТВЕТА
      console.log("Адаптация ответа сервера...");
      
      let userData: any = null;
      let tokenData: string | null = null;

      // Вариант 1: Стандартная структура {user: {}, token: ''}
      if (data.user && data.token) {
        console.log("Используем стандартную структуру");
        userData = data.user;
        tokenData = data.token;
      }
      // Вариант 2: {access_token: '', user: {}}
      else if (data.access_token && data.user) {
        console.log("Используем структуру с access_token");
        userData = data.user;
        tokenData = data.access_token;
      }
      // Вариант 3: {user: {}, accessToken: ''}
      else if (data.user && data.accessToken) {
        console.log("Используем структуру с accessToken");
        userData = data.user;
        tokenData = data.accessToken;
      }
      // Вариант 4: Данные в корне объекта
      else if (data.id && data.email) {
        console.log("Используем данные из корня объекта");
        userData = data;
        tokenData = data.token || data.access_token || data.accessToken;
      }
      // Вариант 5: {data: {user: {}, token: ''}}
      else if (data.data && data.data.user && data.data.token) {
        console.log("Используем вложенную структуру data");
        userData = data.data.user;
        tokenData = data.data.token;
      }
      // Вариант 6: {result: {user: {}, token: ''}}
      else if (data.result && data.result.user && data.result.token) {
        console.log("Используем вложенную структуру result");
        userData = data.result.user;
        tokenData = data.result.token;
      }
      else {
        console.log("Неизвестная структура ответа, пробуем создать mock данные");
        
        // Создаем mock пользователя на основе того что есть
        userData = {
          id: data.id || data.user_id || 1,
          email: data.email || loginData.email,
          username: data.username || loginData.email.split('@')[0],
          avatar_url: data.avatar_url || data.avatar,
          privacy_mode: data.privacy_mode || data.privacy || false,
          created_at: data.created_at || data.created || new Date().toISOString(),
          last_seen: data.last_seen || data.last_seen_at || new Date().toISOString(),
          is_active: data.is_active !== undefined ? data.is_active : true,
        };
        
        tokenData = data.token || data.access_token || data.accessToken || 'mock-token-' + Date.now();
        
        console.log("Создан адаптированный пользователь:", userData);
        console.log("Использован токен:", tokenData ? 'есть' : 'нет');
      }

      // Проверяем что у нас есть необходимые данные
      if (!userData || !tokenData) {
        console.error("Не удалось извлечь user и token из ответа");
        console.error("   userData:", userData);
        console.error("   tokenData:", tokenData);
        console.error("   Исходные данные:", data);
        throw new Error("Invalid response structure - missing user or token");
      }

      // Создаем финального пользователя
      const finalUser = {
        id: userData.id || 1,
        email: userData.email || loginData.email,
        username: userData.username || userData.name || loginData.email.split('@')[0],
        avatar_url: userData.avatar_url || userData.avatar || userData.profile_picture,
        privacy_mode: userData.privacy_mode || userData.private || false,
        created_at: userData.created_at || userData.created || new Date().toISOString(),
        last_seen: userData.last_seen || userData.last_seen_at || userData.updated_at || new Date().toISOString(),
        is_active: userData.is_active !== undefined ? userData.is_active : true,
      };

      console.log("Финальный пользователь:", finalUser);
      console.log("Токен получен:", tokenData ? 'да' : 'нет');
      console.log("Токен (первые 30 символов):", tokenData.substring(0, 30) + '...');

      // ⚠️ ВАЖНОЕ ИСПРАВЛЕНИЕ: Сохраняем токен в sessionStorage
      console.log("💾 Сохраняю токен в sessionStorage...");
      sessionStorage.setItem('auth_token', tokenData);
      
      // Проверяем сохранение
      const savedToken = sessionStorage.getItem('auth_token');
      console.log("✅ Проверка сохранения токена:", savedToken ? 'успешно' : 'не удалось');
      if (savedToken) {
        console.log("✅ Длина сохраненного токена:", savedToken.length);
        console.log("✅ Совпадают токены?", savedToken === tokenData ? 'да' : 'нет');
      }

      return {
        user: finalUser,
        token: tokenData
      };
      
    } catch (error) {
      console.error("Ошибка в authAPI.login:", error);
      throw error;
    }
  },

  async register(registerData: RegisterData): Promise<AuthResponse> {
    console.log("Отправка запроса на /auth/register");
    console.log("Данные для регистрации:", { 
      email: registerData.email, 
      username: registerData.username,
      password: '***'
    });
    
    const url = `${API_BASE_URL}/auth/register`;
    console.log("URL:", url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      console.log("Ответ от сервера:");
      console.log("   Status:", response.status);
      console.log("   Status Text:", response.statusText);
      console.log("   OK:", response.ok);

      const responseText = await response.text();
      console.log("СЫРОЙ текст ответа:", responseText);
      console.log("Длина ответа:", responseText.length);

      if (!response.ok) {
        console.error("Ошибка регистрации:", response.status, responseText);
        throw new Error(`Registration failed: ${response.status} - ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("JSON парсинг успешен");
      } catch (parseError) {
        console.error("Ошибка парсинга JSON:", parseError);
        throw new Error("Invalid JSON response from server");
      }

      console.log("Все ключи ответа:", Object.keys(data));
      
      // АДАПТАЦИЯ ДЛЯ REGISTER (аналогично login)
      let userData: any = null;
      let tokenData: string | null = null;

      if (data.user && data.token) {
        userData = data.user;
        tokenData = data.token;
      } else if (data.access_token && data.user) {
        userData = data.user;
        tokenData = data.access_token;
      } else if (data.id && data.email) {
        userData = data;
        tokenData = data.token || data.access_token;
      } else {
        // Создаем mock данные для регистрации
        userData = {
          id: data.id || data.user_id || 2,
          email: data.email || registerData.email,
          username: data.username || registerData.username,
          avatar_url: data.avatar_url || data.avatar,
          privacy_mode: data.privacy_mode || false,
          created_at: data.created_at || new Date().toISOString(),
          last_seen: data.last_seen || new Date().toISOString(),
          is_active: data.is_active !== undefined ? data.is_active : true,
        };
        
        tokenData = data.token || data.access_token || 'mock-token-reg-' + Date.now();
      }

      if (!userData || !tokenData) {
        console.error("Не удалось извлечь user и token из ответа регистрации");
        throw new Error("Invalid response structure - missing user or token");
      }

      const finalUser = {
        id: userData.id || 2,
        email: userData.email || registerData.email,
        username: userData.username || registerData.username,
        avatar_url: userData.avatar_url || userData.avatar,
        privacy_mode: userData.privacy_mode || false,
        created_at: userData.created_at || new Date().toISOString(),
        last_seen: userData.last_seen || new Date().toISOString(),
        is_active: userData.is_active !== undefined ? userData.is_active : true,
      };

      console.log("Финальный пользователь (регистрация):", finalUser);
      console.log("Токен получен:", tokenData ? 'да' : 'нет');

      // ⚠️ ВАЖНОЕ ИСПРАВЛЕНИЕ: Сохраняем токен при регистрации тоже
      if (tokenData) {
        console.log("💾 Сохраняю токен регистрации в sessionStorage...");
        sessionStorage.setItem('auth_token', tokenData);
        console.log("✅ Токен сохранен при регистрации");
      }

      return {
        user: finalUser,
        token: tokenData
      };
      
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      throw error;
    }
  },

  async testConnection(): Promise<any> {
    try {
      console.log("Проверка соединения с бэкендом...");
      
      // Пробуем несколько эндпоинтов
      const endpoints = ['/docs', '/auth/login', '/', '/api/health'];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Проверка эндпоинта: ${endpoint}`);
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });
          
          console.log(`Ответ от ${endpoint}:`, response.status, response.statusText);
          
          if (response.ok) {
            console.log(`Эндпоинт ${endpoint} доступен`);
            return { 
              status: response.status, 
              statusText: response.statusText,
              endpoint: endpoint
            };
          } else {
            console.log(`Эндпоинт ${endpoint} ответил с ошибкой:`, response.status);
          }
        } catch (err) {
          console.log(`Эндпоинт ${endpoint} недоступен:`, err);
          // Пробуем следующий эндпоинт
        }
      }
      
      // Если все эндпоинты недоступны
      throw new Error("Все эндпоинты бэкенда недоступны");
      
    } catch (error) {
      console.error("Ошибка соединения:", error);
      throw error;
    }
  }
};

// API для работы с чатами
export const chatAPI = {
  // Получить все чаты пользователя
  async getChats(): Promise<Chat[]> {
    console.log("Получение списка чатов...");
    
    const url = `${API_BASE_URL}/api/chats/`;
    console.log("URL:", url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log("Ответ от сервера для получения чатов:");
      console.log("   Status:", response.status);
      console.log("   OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка получения чатов:", response.status, errorText);
        throw new Error(`Get chats failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Получены чаты:", data);
      
      return data;
    } catch (error) {
      console.error("Ошибка в chatAPI.getChats:", error);
      throw error;
    }
  },

  // Создать новый чат
  async createChat(chatData: CreateChatData): Promise<Chat> {
    console.log("🚨 === НАЧАЛО СОЗДАНИЯ ЧАТА ===");
    
    const url = `${API_BASE_URL}/api/chats/`;
    console.log("🌐 URL:", url);
    
    // Получаем заголовки и логируем их
    const headers = getAuthHeaders();
    console.log("📨 Заголовки запроса:");
    console.log("   Content-Type:", headers['Content-Type']);
    console.log("   Authorization:", headers['Authorization'] ? 'есть' : 'НЕТ!');
    if (headers['Authorization']) {
      console.log("   Authorization (первые 50 символов):", headers['Authorization'].substring(0, 50) + '...');
    }
    
    // ⚠️ АВТОМАТИЧЕСКИ ОПРЕДЕЛЯЕМ ТИП ЧАТА
    const isPrivateChat = chatData.participant_usernames?.length === 1;
    
    const requestData = {
      name: chatData.name,
      description: chatData.description || "",
      is_private: chatData.is_private,
      type: isPrivateChat ? "private" : (chatData.type || "group"),
      participant_usernames: chatData.participant_usernames || []
    };
    
    console.log("📦 Данные чата:");
    console.log(JSON.stringify(requestData, null, 2));
    
    try {
      console.log("🔄 Отправка запроса...");
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestData),
      });

      console.log("📥 Ответ получен:");
      console.log("   Status:", response.status);
      console.log("   Status Text:", response.statusText);
      
      const responseText = await response.text();
      console.log("   Тело ответа:", responseText);
      
      if (!response.ok) {
        console.error("❌ Ошибка создания чата:", response.status, responseText);
        
        // Если это 401, покажем больше информации
        if (response.status === 401) {
          console.error("❌ КРИТИЧЕСКАЯ ОШИБКА 401:");
          const token = sessionStorage.getItem('auth_token');
          console.error("   Токен в sessionStorage:", token ? `есть (${token.length} символов)` : 'НЕТ!');
          console.error("   Заголовок Authorization был:", headers['Authorization']);
          
          // Сделаем тестовый GET запрос
          console.log("🔄 Делаю тестовый GET запрос...");
          try {
            const testResponse = await fetch(`${API_BASE_URL}/api/chats/`, {
              method: 'GET',
              headers: headers,
            });
            console.log("   Тестовый GET статус:", testResponse.status);
          } catch (testError) {
            console.error("   Тестовый GET не удался:", testError);
          }
        }
        
        throw new Error(`Create chat failed: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log("✅ Чат создан успешно!");
      return data;
    } catch (error) {
      console.error("❌ Ошибка в chatAPI.createChat:", error);
      throw error;
    }
  },

  // Получить конкретный чат
  async getChat(chatId: number): Promise<Chat> {
    console.log(`Получение чата ${chatId}...`);
    
    const url = `${API_BASE_URL}/api/chats/${chatId}`;
    console.log("URL:", url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log("Ответ от сервера для получения чата:");
      console.log("   Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка получения чата:", response.status, errorText);
        throw new Error(`Get chat failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Получен чат:", data);
      
      return data;
    } catch (error) {
      console.error("Ошибка в chatAPI.getChat:", error);
      throw error;
    }
  },

  // Удалить чат
  async deleteChat(chatId: number): Promise<void> {
    console.log(`Удаление чата ${chatId}...`);
    
    const url = `${API_BASE_URL}/api/chats/${chatId}`;
    console.log("URL:", url);
    console.log("Заголовки:", getAuthHeaders());
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        // ⚠️ Добавляем тело запроса с указанием действия
        body: JSON.stringify({
          action: "delete" // или "remove", зависит от бэкенда
        }),
      });

      console.log("Ответ от сервера для удаления чата:");
      console.log("   Status:", response.status);
      console.log("   Status Text:", response.statusText);

      const responseText = await response.text();
      console.log("Сырой ответ:", responseText);

      if (!response.ok) {
        console.error("Ошибка удаления чата:", response.status, responseText);
        throw new Error(`Delete chat failed: ${response.status} - ${responseText}`);
      }

      console.log("Чат удален");
    } catch (error) {
      console.error("Ошибка в chatAPI.deleteChat:", error);
      throw error;
    }
  },

  // Получить сообщения чата
  async getMessages(chatId: number): Promise<Message[]> {
    console.log(`Получение сообщений для чата ${chatId}...`);
    
    const url = `${API_BASE_URL}/api/chats/${chatId}/messages`;
    console.log("URL:", url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log("Ответ от сервера для получения сообщений:");
      console.log("   Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка получения сообщений:", response.status, errorText);
        throw new Error(`Get messages failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Получены сообщения:", data);
      
      return data;
    } catch (error) {
      console.error("Ошибка в chatAPI.getMessages:", error);
      throw error;
    }
  },

  // Отправить сообщение
  async sendMessage(chatId: number, messageData: SendMessageData): Promise<Message> {
    console.log(`Отправка сообщения в чат ${chatId}...`);
    
    const url = `${API_BASE_URL}/api/chats/${chatId}/messages`;
    console.log("URL:", url);
    
    // Добавляем chat_id в данные сообщения
    const requestData = {
      ...messageData,
      chat_id: chatId
    };
    
    console.log("Данные сообщения:", requestData);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      });

      console.log("Ответ от сервера для отправки сообщения:");
      console.log("   Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка отправки сообщения:", response.status, errorText);
        throw new Error(`Send message failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Сообщение отправлено:", data);
      
      return data;
    } catch (error) {
      console.error("Ошибка в chatAPI.sendMessage:", error);
      throw error;
    }
  },

  // Удалить сообщение
  async deleteMessage(chatId: number, messageId: number): Promise<void> {
    console.log(`Удаление сообщения ${messageId} из чата ${chatId}...`);
    
    const url = `${API_BASE_URL}/api/chats/${chatId}/messages/${messageId}`;
    console.log("URL:", url);
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      console.log("Ответ от сервера для удаления сообщения:");
      console.log("   Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка удаления сообщения:", response.status, errorText);
        throw new Error(`Delete message failed: ${response.status} - ${errorText}`);
      }

      console.log("Сообщение удалено");
    } catch (error) {
      console.error("Ошибка в chatAPI.deleteMessage:", error);
      throw error;
    }
  },

  // Получить участников чата
  async getChatParticipants(chatId: number): Promise<any[]> {
    console.log(`Получение участников чата ${chatId}...`);
    
    const url = `${API_BASE_URL}/api/chats/${chatId}/participants`;
    console.log("URL:", url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log("Ответ от сервера для получения участников:");
      console.log("   Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка получения участников:", response.status, errorText);
        throw new Error(`Get participants failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Получены участники:", data);
      
      return data;
    } catch (error) {
      console.error("Ошибка в chatAPI.getChatParticipants:", error);
      throw error;
    }
  },

  // Добавить участника в чат по username
  async addParticipantByUsername(chatId: number, username: string): Promise<void> {
    console.log(`Добавление участника ${username} в чат ${chatId}...`);
    
    const url = `${API_BASE_URL}/api/chats/${chatId}/participants`;
    console.log("URL:", url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ participant_usernames: [username] }),
      });

      console.log("Ответ от сервера для добавления участника:");
      console.log("   Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка добавления участника:", response.status, errorText);
        throw new Error(`Add participant failed: ${response.status} - ${errorText}`);
      }

      console.log("Участник добавлен");
    } catch (error) {
      console.error("Ошибка в chatAPI.addParticipantByUsername:", error);
      throw error;
    }
  },

  // Добавить нескольких участников в чат по usernames
  async addParticipantsByUsernames(chatId: number, usernames: string[]): Promise<void> {
    console.log(`Добавление участников ${usernames} в чат ${chatId}...`);
    
    const url = `${API_BASE_URL}/api/chats/${chatId}/participants`;
    console.log("URL:", url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ participant_usernames: usernames }),
      });

      console.log("Ответ от сервера для добавления участников:");
      console.log("   Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка добавления участников:", response.status, errorText);
        throw new Error(`Add participants failed: ${response.status} - ${errorText}`);
      }

      console.log("Участники добавлены");
    } catch (error) {
      console.error("Ошибка в chatAPI.addParticipantsByUsernames:", error);
      throw error;
    }
  },

  // Получить конкретное сообщение
  async getMessage(chatId: number, messageId: number): Promise<Message> {
    console.log(`Получение сообщения ${messageId} из чата ${chatId}...`);
    
    const url = `${API_BASE_URL}/api/chats/${chatId}/messages/${messageId}`;
    console.log("URL:", url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log("Ответ от сервера для получения сообщения:");
      console.log("   Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка получения сообщения:", response.status, errorText);
        throw new Error(`Get message failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Получено сообщение:", data);
      
      return data;
    } catch (error) {
      console.error("Ошибка в chatAPI.getMessage:", error);
      throw error;
    }
  }
};

// API для работы с пользователями
export const userAPI = {
  // Поиск пользователей
  async searchUsers(query: string): Promise<UserSearchResult[]> {
    console.log(`Поиск пользователей по запросу: ${query}`);
    
    const url = `${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`;
    console.log("URL:", url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log("Ответ от сервера для поиска пользователей:");
      console.log("   Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка поиска пользователей:", response.status, errorText);
        // Если эндпоинт не существует, возвращаем пустой массив
        if (response.status === 404) {
          console.log("Эндпоинт поиска не найден, возвращаем пустой массив");
          return [];
        }
        throw new Error(`Search users failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Найдены пользователи:", data);
      
      return data;
    } catch (error) {
      console.error("Ошибка в userAPI.searchUsers:", error);
      // Если ошибка, возвращаем пустой массив вместо выброса исключения
      return [];
    }
  },

  // Получить всех пользователей (альтернатива, если поиск не работает)
  async getAllUsers(): Promise<UserSearchResult[]> {
    console.log("Получение всех пользователей...");
    
    const url = `${API_BASE_URL}/api/users`;
    console.log("URL:", url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log("Ответ от сервера для получения пользователей:");
      console.log("   Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка получения пользователей:", response.status, errorText);
        return [];
      }

      const data = await response.json();
      console.log("Получены пользователи:", data);
      
      return data;
    } catch (error) {
      console.error("Ошибка в userAPI.getAllUsers:", error);
      return [];
    }
  },

  // Получить пользователя по ID
  async getUserById(userId: number): Promise<UserSearchResult | null> {
    console.log(`Получение пользователя с ID: ${userId}`);
    
    const url = `${API_BASE_URL}/api/users/${userId}`;
    console.log("URL:", url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log("Ответ от сервера для получения пользователя:");
      console.log("   Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка получения пользователя:", response.status, errorText);
        return null;
      }

      const data = await response.json();
      console.log("Получен пользователь:", data);
      
      return data;
    } catch (error) {
      console.error("Ошибка в userAPI.getUserById:", error);
      return null;
    }
  }
};