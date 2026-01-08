import { apiClient } from '@/lib/api/client';

export interface UpdateProfileData {
  name: string;
  email: string;
  avatar?: string | null;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface ProfileResponse {
  data: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    type_user: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Constrói a URL completa do avatar
 * Se o avatar já for uma URL completa (http/https) ou base64, retorna como está
 * Se for um caminho relativo, adiciona a URL da API
 */
export function buildAvatarUrl(avatar: string | null | undefined): string | null {
  if (!avatar) return null;
  
  // Se já for uma URL completa ou base64, retorna como está
  if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:')) {
    return avatar;
  }
  
  // Se for um caminho relativo, adiciona a URL da API
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
  // Remove barra inicial se existir no avatar e adiciona barra entre API_URL e avatar
  const cleanAvatar = avatar.startsWith('/') ? avatar.slice(1) : avatar;
  return `${apiUrl}/${cleanAvatar}`;
}

export const profileService = {
  /**
   * Atualiza o perfil do usuário autenticado
   * PATCH /profile
   * O ID do usuário é extraído do token de autenticação
   */
  async updateProfile(profileData: UpdateProfileData): Promise<ProfileResponse> {
    const response = await apiClient.patch<ProfileResponse>('/profile', profileData);
    return response;
  },

  /**
   * Upload de avatar
   * Converte arquivo para base64 e envia via updateProfile
   */
  async uploadAvatar(file: File, currentName: string, currentEmail: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          
          // Atualiza perfil com novo avatar
          const response = await this.updateProfile({
            name: currentName,
            email: currentEmail,
            avatar: base64String,
          });
          
          // Retorna a URL do avatar atualizado
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

