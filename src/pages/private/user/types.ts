import { AppRole } from "@/modules/auth/types";

/**
 * Tipos do backend NestJS (conforme documentação)
 */
export type BackendUserType = 'owner' | 'admin' | 'developer' | 'guest';

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  password?: string; // Hash da senha (não retornado em algumas respostas)
  avatar: string | null;
  type_user: BackendUserType;
  status: boolean; // Default: true
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface BackendUserResponse {
  success: boolean;
  message: string;
  data?: BackendUser;
}

export interface CreateUserDto {
  name: string; // Mínimo 10 caracteres
  email: string; // Email válido
  password: string; // Obrigatório
  confirmPassword: string; // Deve coincidir com password
  type_user: BackendUserType; // owner | admin | developer | guest
}

export interface UpdateUserDto {
  name?: string;
  password?: string;
  status?: boolean;
}

export interface UpdateProfileDto {
  name: string; // Mínimo 2, máximo 100 caracteres, apenas letras e espaços
  email: string; // Email válido, máximo 255 caracteres
  avatar?: string; // Opcional, base64 ou URL
  currentPassword?: string; // Obrigatório se mudando senha
  newPassword?: string; // Obrigatório se mudando senha, mínimo 6 caracteres
  confirmPassword?: string; // Obrigatório se mudando senha, deve coincidir com newPassword
}

/**
 * Tipos do frontend (compatibilidade com código existente)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone_e164: string | null;
  avatar_url: string | null;
  force_password_change: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole extends User {
  is_active: boolean;
  role: AppRole;
}

export interface CreateUserData {
  email: string;
  name: string;
  phone_e164?: string;
  avatar_url?: string;
  role: AppRole;
  password?: string;
  force_password_change?: boolean;
}

export interface UpdateUserData {
  name?: string;
  phone_e164?: string;
  avatar_url?: string;
  role?: AppRole;
  force_password_change?: boolean;
  is_active?: boolean;
}
