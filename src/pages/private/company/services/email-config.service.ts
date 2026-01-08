import { apiClient } from '@/lib/api/client';

export interface CompanyEmailConfig {
  id: number;
  company_id: number;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
  imap_host: string;
  imap_port: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailConfigDto {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
  imap_host: string;
  imap_port: number;
  is_active?: boolean;
}

export interface UpdateEmailConfigDto {
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  smtp_from_email?: string;
  smtp_from_name?: string;
  imap_host?: string;
  imap_port?: number;
  is_active?: boolean;
}

export const emailConfigService = {
  /**
   * Busca configuração de email da empresa
   * GET /companies/:companyId/email-config
   */
  async getEmailConfig(companyId: string | number): Promise<CompanyEmailConfig> {
    return apiClient.get<CompanyEmailConfig>(`/companies/${companyId}/email-config`);
  },

  /**
   * Cria configuração de email para a empresa
   * POST /companies/:companyId/email-config
   */
  async createEmailConfig(
    companyId: string | number,
    data: CreateEmailConfigDto
  ): Promise<CompanyEmailConfig> {
    return apiClient.post<CompanyEmailConfig>(`/companies/${companyId}/email-config`, data);
  },

  /**
   * Atualiza configuração de email da empresa
   * PATCH /companies/:companyId/email-config
   */
  async updateEmailConfig(
    companyId: string | number,
    data: UpdateEmailConfigDto
  ): Promise<CompanyEmailConfig> {
    return apiClient.patch<CompanyEmailConfig>(`/companies/${companyId}/email-config`, data);
  },

  /**
   * Remove configuração de email da empresa
   * DELETE /companies/:companyId/email-config
   */
  async deleteEmailConfig(companyId: string | number): Promise<void> {
    return apiClient.delete<void>(`/companies/${companyId}/email-config`);
  },
};

