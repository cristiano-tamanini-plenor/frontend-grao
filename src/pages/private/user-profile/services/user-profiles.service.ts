import { apiClient } from '@/lib/api/client';

export interface UserProfileOption {
  id: string;
  name: string;
  description?: string;
}

export const userProfilesService = {
  /**
   * Busca perfis de uma empresa
   * TODO: Implement via API endpoint when available
   */
  async getProfilesByCompany(companyId: string): Promise<UserProfileOption[]> {
    // TODO: Replace with API call: GET /companies/:companyId/user-profiles
    const response = await apiClient.get<UserProfileOption[]>(`/companies/${companyId}/user-profiles`);
    return response || [];
  },

  /**
   * Busca usuários atribuídos a um perfil em uma empresa
   * TODO: Implement via API endpoint when available
   */
  async getUsersByProfile(profileId: string, companyId: string) {
    // TODO: Replace with API call: GET /companies/:companyId/user-profiles/:profileId/users
    const response = await apiClient.get<any[]>(`/companies/${companyId}/user-profiles/${profileId}/users`);
    return (response || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      avatar_url: item.avatar_url,
    }));
  },
};
