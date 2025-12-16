// src/types/chat.ts
import { User } from './auth';

export interface Chat {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_private: boolean;
  created_by: number;
  participants: User[];
  last_message?: Message;
  unread_count?: number;
  type?: string;
}

export interface Message {
  id: number;
  chat_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CreateChatData {
  name: string;
  description?: string;
  is_private: boolean;
  participant_ids: number[]; // Для внутреннего использования
  participant_usernames: string[]; // Для отправки на сервер
  type: string;
}

export interface SendMessageData {
  content: string;
  chat_id: number;
}