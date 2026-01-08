export type AppRole = 'OWNER' | 'MEMBER' | 'MEMBER_LIMITED' | 'GUEST' | 'DEVELOPER';
export type ThemePreference = 'SYSTEM' | 'LIGHT' | 'DARK';
export type UserType = 'owner' | 'member' | 'member_limited' | 'guest' | 'developer';

export interface Profile {
  id: string;
  email: string;
  name: string;
  phone_e164?: string | null;
  avatar_url?: string | null;
  force_password_change?: boolean;
  theme_preference?: ThemePreference;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  type_user: UserType;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole extends Profile {
  is_active: boolean;
  role: AppRole;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  type_user: UserType;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role?: AppRole;
}
