// src/services/api.ts
import { LoginData, RegisterData, AuthResponse } from '../types/auth';

const API_BASE_URL = 'https://prodpal-backend.onrender.com';//http://25.33.4.91:8000
//https://prodpal-backend.onrender.com/docs#/

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
      const endpoints = ['/docs#', '/auth/login', '/', '/api/health'];
      
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

