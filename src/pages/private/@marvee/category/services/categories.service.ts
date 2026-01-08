import { apiClient } from '@/lib/api/client';

/**
 * Interface para filtros de categorias
 */
export interface CategoriesFilters {
  category?: string;
  description?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Interface para metadados de paginação
 */
export interface CategoriesMeta {
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
 * Interface para uma categoria (conforme estrutura da API Marvee)
 */
export interface Category {
  id: number;
  guid: string;
  company_id: number;
  created_at: string;
  updated_at: string;
  category: string;
  description: string;
  category_id?: number | null;
  level?: number | null;
  cac_percent?: number | null;
  cv_percent?: number | null;
  accounting_account?: string | null;
  is_salary?: boolean | null;
  nature?: string | null;
  status: boolean;
  recurrence_type?: string | null;
  account_category?: {
    id: number;
    structure: string | null;
    description: string | null;
    status: boolean;
    level: string;
    category_marvee_id: number | null;
  } | null;
  [key: string]: any; // Permite campos adicionais da API
}

/**
 * Interface para resposta da API de listagem de categorias
 */
export interface CategoriesListResponse {
  meta: CategoriesMeta;
  data: Category[];
}

/**
 * Serviço para gerenciar categorias da API Marvee
 */
export const categoriesService = {
  /**
   * Lista categorias com filtros opcionais e paginação
   * GET /companies/:companyId/marvee/categories
   */
  async listCategories(
    companyId: string | number,
    filters?: CategoriesFilters
  ): Promise<CategoriesListResponse> {
    const queryParams = new URLSearchParams();

    if (filters?.category) {
      queryParams.append('category', filters.category);
    }
    if (filters?.description) {
      queryParams.append('description', filters.description);
    }
    if (filters?.page !== undefined) {
      queryParams.append('page', String(filters.page));
    }
    if (filters?.pageSize !== undefined) {
      queryParams.append('pageSize', String(filters.pageSize));
    }

    const queryString = queryParams.toString();
    const url = `/companies/${companyId}/marvee/categories${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<CategoriesListResponse>(url);
    return response;
  },
};

