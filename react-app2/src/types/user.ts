// src/types/user.ts
export interface UserSearchResult {
  id: number;
  email: string;
  username: string;
  avatar_url?: string;
}

export interface AddParticipantData {
  user_id: number;
}