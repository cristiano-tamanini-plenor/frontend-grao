import { apiClient } from '@/lib/api/client';

// Tipos baseados na resposta da API do backend
export interface InviteUserData {
  email: string;
}

export interface InviteUserResult {
  user: {
    id: number;
    email: string;
    name: string;
  };
  temporaryPassword?: string;
  wasExistingUser: boolean;
}

// Tipo baseado na resposta do GET /companies/:companyId/users
export interface CompanyUser {
  id: number;
  name: string;
  email: string;
  type_user: 'owner' | 'admin' | 'developer' | 'guest';
  avatar: string | null;
  createdAt: string; // ISO 8601 date string
  // Campos adicionais que podem ser úteis no frontend
  role?: string; // Mapeado de type_user para compatibilidade
  avatar_url?: string | null; // Alias de avatar
  created_at?: string; // Alias de createdAt
  invited_at?: string; // Alias de createdAt
  user_profile_id?: string | null; // Não retornado pela API, mas pode ser usado
  invited_by?: {
    id: number;
    name: string;
    email?: string;
  } | null; // Usuário que convidou este usuário para a empresa
}

// Resposta do endpoint de convite
interface InviteUserResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      name: string;
    };
    company: {
      id: number;
      name: string;
    };
  };
}

// Resposta do endpoint de remoção
interface RemoveUserResponse {
  success: boolean;
  message: string;
}

export const companyUsersService = {
  /**
   * Lista todos os usuários de uma empresa
   * GET /companies/:companyId/users
   */
  async listCompanyUsers(companyId: string | number): Promise<CompanyUser[]> {
    try {
      const users = await apiClient.get<CompanyUser[]>(
        `/companies/${companyId}/users`
      );

      // Transformar dados para manter compatibilidade com o código existente
      return users.map((user) => ({
        ...user,
        id: user.id, // Já é number
        // Criar aliases para compatibilidade
        role: user.type_user, // Mapear type_user para role
        avatar_url: user.avatar,
        created_at: user.createdAt,
        invited_at: user.createdAt, // createdAt é quando foi associado à empresa
        user_profile_id: user.user_profile_id || null,
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários da empresa:', error);
      throw error;
    }
  },

  /**
   * Remove um usuário da empresa
   * DELETE /companies/:companyId/users/:userId
   */
  async removeUserFromCompany(
    companyId: string | number,
    userId: string | number
  ): Promise<void> {
    try {
      await apiClient.delete<RemoveUserResponse>(
        `/companies/${companyId}/users/${userId}`
      );
    } catch (error) {
      console.error('Erro ao remover usuário da empresa:', error);
      throw error;
    }
  },

  /**
   * Convida múltiplos usuários para a empresa
   * Faz chamadas sequenciais para o endpoint de convite
   * Nota: O backend sempre cria usuários como GUEST, o parâmetro role é ignorado
   */
  async inviteUsersToCompany(
    companyId: string | number,
    emails: string[],
    role?: 'MEMBER' | 'MEMBER_LIMITED' | 'GUEST', // Mantido para compatibilidade, mas não usado
    userProfileId?: string // Mantido para compatibilidade, mas não usado pelo backend
  ): Promise<InviteUserResult[]> {
    const results: InviteUserResult[] = [];

    for (const email of emails) {
      try {
        const result = await this.inviteUserToCompany(
          companyId,
          {
            email: email.trim().toLowerCase(),
          },
          userProfileId
        );
        results.push(result);
      } catch (error: any) {
        // Se o erro for que o usuário já está na empresa (400), ignorar e continuar
        if (error.statusCode === 400 && error.message?.includes('já está associado')) {
          continue;
        }
        throw error;
      }
    }

    return results;
  },

  /**
   * Convida um usuário para a empresa
   * POST /companies/:companyId/users/invite
   * O backend cria o usuário automaticamente se não existir
   */
  async inviteUserToCompany(
    companyId: string | number,
    userData: InviteUserData,
    userProfileId?: string
  ): Promise<InviteUserResult> {
    try {
      const response = await apiClient.post<InviteUserResponse>(
        `/companies/${companyId}/users/invite`,
        {
          email: userData.email.trim().toLowerCase(),
        }
      );

      // Determinar se o usuário já existia baseado na mensagem
      // A mensagem indica se foi criado ou apenas associado
      const wasExistingUser = !response.message.includes('criado');

      return {
        user: {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
        },
        // O backend não retorna a senha provisória na resposta por segurança
        // Se precisarmos dela, teríamos que ajustar o backend ou usar outro endpoint
        temporaryPassword: undefined,
        wasExistingUser,
      };
    } catch (error: any) {
      console.error('Erro ao convidar usuário:', error);
      throw error;
    }
  },
};

