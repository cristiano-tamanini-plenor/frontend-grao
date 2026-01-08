import { apiClient } from '@/lib/api/client';

/**
 * Interface para filtros de centros de custo
 */
export interface CostCentersFilters {
  name?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Interface para metadados de paginação
 */
export interface CostCentersMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  first_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  previous_page_url: string | null;
}

/**
 * Interface para um centro de custo (conforme estrutura da API Marvee)
 */
export interface CostCenter {
  id: number;
  guid: string;
  company_id: number;
  created_at: string;
  updated_at: string;
  name: string;
  code?: string | null;
  status?: boolean;
  description?: string | null;
  [key: string]: any; // Permite campos adicionais da API
}

/**
 * Interface para resposta da API de listagem de centros de custo
 */
export interface CostCentersListResponse {
  meta: CostCentersMeta;
  data: CostCenter[];
}

/**
 * Serviço para gerenciar centros de custo da API Marvee
 */
export const costCentersService = {
  /**
   * Lista centros de custo com filtros opcionais e paginação
   * GET /companies/:companyId/marvee/centros-de-custo
   */
  async listCostCenters(
    companyId: string | number,
    filters?: CostCentersFilters
  ): Promise<CostCentersListResponse> {
    const queryParams = new URLSearchParams();

    if (filters?.name) {
      queryParams.append('name', filters.name);
    }
    if (filters?.page !== undefined) {
      queryParams.append('page', String(filters.page));
    }
    if (filters?.pageSize !== undefined) {
      queryParams.append('pageSize', String(filters.pageSize));
    }

    const queryString = queryParams.toString();
    const url = `/companies/${companyId}/marvee/centros-de-custo${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<CostCentersListResponse>(url);
    return response;
  },
};

