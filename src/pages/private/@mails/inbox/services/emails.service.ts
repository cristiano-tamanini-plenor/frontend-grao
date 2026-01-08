import { apiClient } from '@/lib/api/client';
import type { Email, EmailsFilters } from '../types';

/**
 * Serviço para gerenciar emails
 */
export const emailsService = {
  /**
   * Lista emails recebidos (Caixa de Entrada)
   * GET /companies/:companyId/emails/inbox
   */
  async listInbox(
    companyId: string | number,
    filters?: { folder?: string }
  ): Promise<Email[]> {
    const queryParams = new URLSearchParams();

    if (filters?.folder) {
      queryParams.append('folder', filters.folder);
    }

    const queryString = queryParams.toString();
    const url = `/companies/${companyId}/emails/inbox${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<Email[]>(url);
    return response;
  },

  /**
   * Lista emails enviados (Caixa de Saída)
   * GET /companies/:companyId/emails/sent
   */
  async listSent(
    companyId: string | number,
    filters?: { folder?: string }
  ): Promise<Email[]> {
    const queryParams = new URLSearchParams();

    if (filters?.folder) {
      queryParams.append('folder', filters.folder);
    }

    const queryString = queryParams.toString();
    const url = `/companies/${companyId}/emails/sent${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<Email[]>(url);
    return response;
  },

  /**
   * Lista todos os emails com filtros opcionais
   * GET /companies/:companyId/emails
   */
  async listEmails(
    companyId: string | number,
    filters?: EmailsFilters
  ): Promise<Email[]> {
    const queryParams = new URLSearchParams();

    if (filters?.direction) {
      queryParams.append('direction', filters.direction);
    }
    if (filters?.folder) {
      queryParams.append('folder', filters.folder);
    }

    const queryString = queryParams.toString();
    const url = `/companies/${companyId}/emails${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<Email[]>(url);
    return response;
  },

  /**
   * Busca um email por ID
   * GET /companies/:companyId/emails/:id
   */
  async getEmailById(
    companyId: string | number,
    emailId: number
  ): Promise<Email> {
    const url = `/companies/${companyId}/emails/${emailId}`;
    const response = await apiClient.get<Email>(url);
    return response;
  },

  /**
   * Marca um email como processado pela IA
   * PATCH /companies/:companyId/emails/:id/mark-processed
   */
  async markAsProcessed(
    companyId: string | number,
    emailId: number
  ): Promise<Email> {
    const url = `/companies/${companyId}/emails/${emailId}/mark-processed`;
    const response = await apiClient.patch<Email>(url, {});
    return response;
  },

  /**
   * Sincroniza emails do servidor IMAP
   * POST /companies/:companyId/emails/sync
   */
  async syncEmails(companyId: string | number): Promise<{ success: boolean; count: number; message?: string }> {
    const url = `/companies/${companyId}/emails/sync`;
    const response = await apiClient.post<{ success: boolean; count: number; message?: string }>(url, {});
    return response;
  },
};

