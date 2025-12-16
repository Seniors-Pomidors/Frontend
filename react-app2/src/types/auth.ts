// src/types/auth.ts
export interface User {
  id: number;
  email: string;
  username: string;
  avatar_url?: string;
  privacy_mode: boolean;
  created_at: string;
  last_seen: string;
  is_active: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}