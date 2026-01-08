import { apiClient } from '@/lib/api/client';
import type { CreateUserData, UpdateUserData, BackendUser, BackendUserResponse } from '../types';
import { generateTemporaryPassword } from '@/lib/utils/password';
import type { AppRole } from '@/modules/auth/types';

/**
 * Mapeia AppRole do frontend para type_user do backend
 */
function mapRoleToUserType(role: AppRole): 'owner' | 'admin' | 'developer' | 'guest' {
  const mapping: Record<AppRole, 'owner' | 'admin' | 'developer' | 'guest'> = {
    OWNER: 'owner',
    MEMBER: 'admin',
    MEMBER_LIMITED: 'admin', // Mantém compatibilidade, pode ser ajustado conforme necessário
    GUEST: 'guest',
    DEVELOPER: 'developer',
  };
  return mapping[role] || 'guest';
}

/**
 * Mapeia type_user do backend para AppRole do frontend
 */
function mapUserTypeToRole(typeUser: string): AppRole {
  const mapping: Record<string, AppRole> = {
    owner: 'OWNER',
    admin: 'MEMBER',
    developer: 'DEVELOPER', // Agora mapeia corretamente para DEVELOPER
    guest: 'GUEST',
  };
  return mapping[typeUser] || 'GUEST';
}

/**
 * Converte usuário do backend para formato do frontend
 */
function mapBackendUserToFrontend(backendUser: BackendUser): any {
  return {
    id: String(backendUser.id),
    email: backendUser.email,
    name: backendUser.name,
    avatar_url: backendUser.avatar || null,
    phone_e164: null, // Backend não retorna phone_e164, pode ser adicionado depois
    force_password_change: false, // Backend não retorna isso, pode ser adicionado depois
    type_user: backendUser.type_user,
    status: backendUser.status ?? true,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
    // Mapeia type_user para role
    role: mapUserTypeToRole(backendUser.type_user),
    is_active: backendUser.status ?? true,
    created_at: backendUser.createdAt,
    updated_at: backendUser.updatedAt,
  };
}

export const usersService = {
  /**
   * Valida o token do usuário autenticado e retorna informações básicas
   * GET /users/validate-user
   */
  async validateUser(): Promise<any> {
    const user = await apiClient.get<BackendUser>('/users/validate-user');
    return mapBackendUserToFrontend(user);
  },

  /**
   * Lista todos os usuários
   * GET /users
   */
  async listUsers() {
    const users = await apiClient.get<BackendUser[]>('/users');
    return users.map(mapBackendUserToFrontend);
  },

  /**
   * Busca um usuário por ID
   * GET /users/:id
   */
  async getUserById(id: string) {
    const user = await apiClient.get<BackendUser>(`/users/${id}`);
    return mapBackendUserToFrontend(user);
  },

  /**
   * Cria novo usuário
   * POST /users
   */
  async createUser(userData: CreateUserData) {
    const password = userData.password || generateTemporaryPassword();
    
    const createPayload = {
      name: userData.name,
      email: userData.email,
      password,
      confirmPassword: password,
      type_user: mapRoleToUserType(userData.role),
    };

    const createdUser = await apiClient.post<BackendUser>('/users', createPayload);
    
    return {
      user: mapBackendUserToFrontend(createdUser),
      temporaryPassword: password,
    };
  },

  /**
   * Atualiza usuário
   * PATCH /users/:id
   */
  async updateUser(id: string, updates: UpdateUserData) {
    const updatePayload: any = {};
    
    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.role !== undefined) updatePayload.type_user = mapRoleToUserType(updates.role);
    // Removido: status não é aceito no updateUser, use toggleUserStatus para alterar status
    
    const updatedUser = await apiClient.patch<BackendUser>(`/users/${id}`, updatePayload);
    return mapBackendUserToFrontend(updatedUser);
  },

  /**
   * Atualiza perfil do usuário (incluindo avatar e senha opcionalmente)
   * PATCH /users/:id/profile
   */
  async updateProfile(id: string, profileData: {
    name: string;
    email: string;
    avatar?: string | null;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }) {
    const response = await apiClient.patch<BackendUserResponse>(`/users/${id}/profile`, profileData);
    return response;
  },

  /**
   * Exclui usuário
   * DELETE /users/:id
   */
  async deleteUser(id: string) {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Altera o status ativo/inativo do usuário
   * Usa PATCH /users/:id com status
   */
  async toggleUserStatus(id: string, isActive: boolean) {
    const updatedUser = await apiClient.patch<BackendUser>(`/users/${id}`, {
      status: isActive,
    });
    return mapBackendUserToFrontend(updatedUser);
  },

  /**
   * Reseta senha do usuário
   * Gera uma nova senha temporária e atualiza via PATCH /users/:id
   * Nota: Se o backend não permitir atualizar senha diretamente via PATCH /users/:id,
   * pode ser necessário usar updateProfile com currentPassword vazio ou criar endpoint específico
   */
  async resetUserPassword(id: string) {
    const password = generateTemporaryPassword();
    
    // Busca o usuário atual para manter nome e email
    const currentUser = await this.getUserById(id);
    
    // Tenta atualizar via PATCH /users/:id com password
    // Se isso não funcionar no backend, pode ser necessário usar updateProfile
    try {
      await apiClient.patch<BackendUser>(`/users/${id}`, {
        password,
      });
      return password;
    } catch (error) {
      // Se não funcionar, tenta via updateProfile
      // Nota: Isso pode falhar se o backend exigir currentPassword
      // Nesse caso, será necessário criar um endpoint específico de reset no backend
      try {
        await this.updateProfile(id, {
          name: currentUser.name,
          email: currentUser.email,
          newPassword: password,
          confirmPassword: password,
          // Não enviamos currentPassword para reset administrativo
        });
        return password;
      } catch (profileError) {
        // Se ambos falharem, lança o erro original
        throw error;
      }
    }
  },

  /**
   * Upload de avatar
   * Converte arquivo para base64 e envia via updateProfile
   */
  async uploadAvatar(file: File, userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          
          // Busca dados atuais do usuário
          const currentUser = await this.getUserById(userId);
          
          // Atualiza perfil com novo avatar
          const response = await this.updateProfile(userId, {
            name: currentUser.name,
            email: currentUser.email,
            avatar: base64String,
          });
          
          // Retorna a URL do avatar atualizado (pode ser base64 ou URL)
          const avatarUrl = response.data?.avatar || base64String;
          resolve(avatarUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};
