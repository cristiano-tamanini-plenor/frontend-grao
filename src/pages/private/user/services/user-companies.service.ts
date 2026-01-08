import { apiClient } from '@/lib/api/client';
import { Company } from '../../company/types';

/**
 * Interface da resposta da API para empresas de um usuário
 */
interface ApiUserCompanyResponse {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  system_nickname: string | null;
  cnpj: string | null;
  legal_representative?: string | null;
  legal_email?: string | null;
  legal_phone?: string | null;
  client_id?: string | null;
  client_secret?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
  plan_id?: number | null;
  certificate_imported?: boolean;
  certificate_validity?: string | null;
  certificate_path?: string | null;
  user_profile_id?: string | null;
  user_profile_name?: string | null;
}

/**
 * Mapeia a resposta da API para o formato do frontend
 */
function mapApiUserCompanyToCompany(apiCompany: ApiUserCompanyResponse): Company & { user_profile_id?: string; user_profile_name?: string } {
  const hasCertificate = !!(apiCompany.certificate_path || apiCompany.certificate_imported);
  
  return {
    id: String(apiCompany.id),
    name: apiCompany.name,
    system_nickname: apiCompany.system_nickname,
    legal_representative: apiCompany.legal_representative ?? null,
    legal_email: apiCompany.legal_email ?? null,
    legal_phone: apiCompany.legal_phone ?? null,
    client_id: apiCompany.client_id ?? null,
    client_secret: apiCompany.client_secret ?? null,
    avatar_url: apiCompany.avatar_url ?? null,
    is_active: apiCompany.is_active ?? true,
    user_id: '',
    cnpj: apiCompany.cnpj,
    plan_id: apiCompany.plan_id ? String(apiCompany.plan_id) : null,
    certificate_imported: hasCertificate,
    certificate_validity: apiCompany.certificate_validity ?? null,
    certificate_path: apiCompany.certificate_path ?? null,
    created_at: apiCompany.createdAt,
    updated_at: apiCompany.updatedAt,
    user_profile_id: apiCompany.user_profile_id ?? undefined,
    user_profile_name: apiCompany.user_profile_name ?? undefined,
  };
}

export const userCompaniesService = {
  /**
   * List all companies associated with a user
   * GET /users/:userId/companies
   */
  async listUserCompanies(userId: string): Promise<(Company & { user_profile_id?: string; user_profile_name?: string })[]> {
    try {
      const apiCompanies = await apiClient.get<ApiUserCompanyResponse[]>(`/users/${userId}/companies`);
      return apiCompanies.map(mapApiUserCompanyToCompany);
    } catch (error) {
      console.error('Erro ao listar empresas do usuário:', error);
      throw error;
    }
  },

  /**
   * Associate a user with a company
   * POST /companies/:companyId/users/:userId
   */
  async addUserCompany(userId: string, companyId: string, userProfileId?: string): Promise<void> {
    try {
      const body: { user_profile_id?: string } = {};
      if (userProfileId) {
        body.user_profile_id = userProfileId;
      }
      
      await apiClient.post(`/companies/${companyId}/users/${userId}`, body);
    } catch (error) {
      console.error('Erro ao associar usuário à empresa:', error);
      throw error;
    }
  },

  /**
   * Update user profile for a company
   * PATCH /companies/:companyId/users/:userId
   */
  async updateUserCompanyProfile(userId: string, companyId: string, userProfileId: string | null): Promise<void> {
    try {
      const body: { user_profile_id?: string | null } = {
        user_profile_id: userProfileId,
      };
      
      await apiClient.patch(`/companies/${companyId}/users/${userId}`, body);
    } catch (error) {
      console.error('Erro ao atualizar perfil do usuário na empresa:', error);
      throw error;
    }
  },

  /**
   * Remove association between user and company
   * DELETE /companies/:companyId/users/:userId
   */
  async removeUserCompany(userId: string, companyId: string): Promise<void> {
    try {
      await apiClient.delete(`/companies/${companyId}/users/${userId}`);
    } catch (error) {
      console.error('Erro ao remover usuário da empresa:', error);
      throw error;
    }
  },

  /**
   * Check if user has at least one company
   * TODO: Implement via API endpoint when available
   */
  async hasCompanies(userId: string): Promise<boolean> {
    // TODO: Replace with API call: GET /users/:userId/companies (check if array.length > 0)
    throw new Error('hasCompanies: Not implemented - needs API endpoint');
  },

  /**
   * Remove all company associations for a user
   * NOTA: Este método não deve mais ser usado diretamente.
   * A remoção de usuários de empresas deve ser feita via API específica:
   * DELETE /companies/:companyId/users/:userId
   * 
   * Se necessário remover de todas as empresas, isso deve ser feito
   * pelo backend quando o usuário é inativado, ou removendo empresa por empresa.
   */
  async removeAllUserCompanies(userId: string): Promise<void> {
    // Este método não deve mais ser usado diretamente.
    // A remoção deve ser feita empresa por empresa usando removeUserCompany,
    // ou deixar o backend lidar quando inativar o usuário.
    throw new Error('removeAllUserCompanies não deve ser usado. Use removeUserCompany para remover de uma empresa específica, ou deixe o backend lidar com a remoção ao inativar o usuário.');
  },
};
