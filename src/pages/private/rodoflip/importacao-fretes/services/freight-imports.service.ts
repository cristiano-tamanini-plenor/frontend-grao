import { apiClient, tokenManager } from '@/lib/api/client';
import type {
  FreightImport,
  FreightImportItem,
  UploadFreightImportResponse,
  DeleteFreightImportResponse,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export const freightImportsService = {
  /**
   * Faz upload de um arquivo CSV e processa a importação
   * POST /companies/:companyId/rodoflip/freight-imports/upload
   */
  async uploadCSV(
    companyId: string | number,
    file: File
  ): Promise<UploadFreightImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const accessToken = tokenManager.getAccessToken();

    const response = await fetch(
      `${API_URL}/companies/${companyId}/rodoflip/freight-imports/upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Não definir Content-Type - o browser define automaticamente com boundary
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join('\n')
          : error.message || 'Erro ao fazer upload do arquivo'
      );
    }

    return response.json();
  },

  /**
   * Lista todas as importações de uma empresa
   * GET /companies/:companyId/rodoflip/freight-imports
   */
  async listImports(companyId: string | number): Promise<FreightImport[]> {
    return apiClient.get<FreightImport[]>(
      `/companies/${companyId}/rodoflip/freight-imports`
    );
  },

  /**
   * Obtém os detalhes de uma importação específica
   * GET /companies/:companyId/rodoflip/freight-imports/:id
   */
  async getImportById(
    companyId: string | number,
    importId: number
  ): Promise<FreightImport> {
    return apiClient.get<FreightImport>(
      `/companies/${companyId}/rodoflip/freight-imports/${importId}`
    );
  },

  /**
   * Deleta uma importação e todos os seus itens
   * DELETE /companies/:companyId/rodoflip/freight-imports/:id
   */
  async deleteImport(
    companyId: string | number,
    importId: number
  ): Promise<DeleteFreightImportResponse> {
    return apiClient.delete<DeleteFreightImportResponse>(
      `/companies/${companyId}/rodoflip/freight-imports/${importId}`
    );
  },
};
