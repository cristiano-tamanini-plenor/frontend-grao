import { apiClient, tokenManager } from '@/lib/api/client';
import type {
  AccountCategory,
  CreateAccountCategoryDto,
  UpdateAccountCategoryDto,
  AccountCategoryLevel,
} from '../types';

/**
 * Interface da resposta da API (NestJS)
 */
interface ApiAccountCategoryResponse {
  id: number;
  company_id: number;
  account_category_father_id: number | null;
  structure: string | null;
  description: string | null;
  status: boolean;
  level: AccountCategoryLevel;
  category_marvee?: Array<{
    id: number;
    name: string | null;
    description: string | null;
    category: string | null;
    link_id?: number;
  }> | null;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: number;
    name: string;
    cnpj?: string | null;
  };
  father?: ApiAccountCategoryResponse | null;
  children?: ApiAccountCategoryResponse[];
}

/**
 * Interface para resposta com wrapper success/message/data
 */
interface ApiAccountCategoryWrappedResponse {
  success?: boolean;
  message?: string;
  data?: ApiAccountCategoryResponse;
}

/**
 * Mapeia a resposta da API para o formato do frontend
 */
function mapApiAccountCategoryToAccountCategory(
  apiCategory: ApiAccountCategoryResponse
): AccountCategory {
  return {
    id: String(apiCategory.id),
    company_id: String(apiCategory.company_id),
    account_category_father_id: apiCategory.account_category_father_id
      ? String(apiCategory.account_category_father_id)
      : null,
    structure: apiCategory.structure ?? null,
    description: apiCategory.description ?? null,
    status: apiCategory.status ?? true,
    level: apiCategory.level,
    category_marvee: apiCategory.category_marvee
      ? apiCategory.category_marvee.map((item) => ({
          id: item.id,
          name: item.name ?? null,
          description: item.description ?? null,
          category: item.category ?? null,
          link_id: item.link_id,
        }))
      : null,
    created_at: apiCategory.createdAt,
    updated_at: apiCategory.updatedAt,
    company: apiCategory.company
      ? {
          id: String(apiCategory.company.id),
          name: apiCategory.company.name,
          cnpj: apiCategory.company.cnpj ?? null,
        }
      : undefined,
    father: apiCategory.father
      ? mapApiAccountCategoryToAccountCategory(apiCategory.father)
      : null,
    children: apiCategory.children
      ? apiCategory.children.map(mapApiAccountCategoryToAccountCategory)
      : undefined,
  };
}

export const accountCategoriesService = {
  /**
   * Lista todas as categorias de conta
   * GET /companies/:companyId/account-categories
   */
  async listAccountCategories(companyId: number): Promise<AccountCategory[]> {
    const apiCategories = await apiClient.get<ApiAccountCategoryResponse[]>(
      `/companies/${companyId}/account-categories`
    );
    return apiCategories.map(mapApiAccountCategoryToAccountCategory);
  },

  /**
   * Busca categoria por ID
   * GET /companies/:companyId/account-categories/:id
   */
  async getAccountCategoryById(companyId: number, id: string): Promise<AccountCategory> {
    const apiCategory = await apiClient.get<ApiAccountCategoryResponse>(
      `/companies/${companyId}/account-categories/${id}`
    );
    return mapApiAccountCategoryToAccountCategory(apiCategory);
  },

  /**
   * Cria nova categoria de conta
   * POST /companies/:companyId/account-categories
   */
  async createAccountCategory(
    companyId: number,
    data: CreateAccountCategoryDto
  ): Promise<AccountCategory> {
    const response = await apiClient.post<
      ApiAccountCategoryResponse | ApiAccountCategoryWrappedResponse
    >(`/companies/${companyId}/account-categories`, data);
    const categoryResponse =
      'data' in response && response.data ? response.data : (response as ApiAccountCategoryResponse);
    return mapApiAccountCategoryToAccountCategory(categoryResponse);
  },

  /**
   * Atualiza categoria existente
   * PATCH /companies/:companyId/account-categories/:id
   */
  async updateAccountCategory(
    companyId: number,
    id: string,
    data: UpdateAccountCategoryDto
  ): Promise<AccountCategory> {
    // Remove campos undefined e mantém null quando necessário
    const cleanUpdates: Record<string, any> = {};
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof UpdateAccountCategoryDto];
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });

    const response = await apiClient.patch<
      ApiAccountCategoryResponse | ApiAccountCategoryWrappedResponse
    >(`/companies/${companyId}/account-categories/${id}`, cleanUpdates);
    const categoryResponse =
      'data' in response && response.data ? response.data : (response as ApiAccountCategoryResponse);
    return mapApiAccountCategoryToAccountCategory(categoryResponse);
  },

  /**
   * Deleta categoria
   * DELETE /companies/:companyId/account-categories/:id
   */
  async deleteAccountCategory(companyId: number, id: string): Promise<void> {
    return apiClient.delete<void>(`/companies/${companyId}/account-categories/${id}`);
  },

  /**
   * Exporta todas as categorias de uma empresa
   * GET /companies/:companyId/account-categories/export
   */
  async exportAccountCategories(companyId: number): Promise<Blob> {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';
    const accessToken = tokenManager.getAccessToken();
    
    const response = await fetch(
      `${API_URL}/companies/${companyId}/account-categories/export`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join('\n')
          : error.message || 'Erro ao exportar categorias'
      );
    }

    return response.blob();
  },

  /**
   * Importa categorias de um arquivo JSON
   * POST /companies/:companyId/account-categories/import
   */
  async importAccountCategories(
    companyId: number,
    categoriesJson: { categories: any[] }
  ): Promise<{ imported: number; errors: string[] }> {
    return apiClient.post<{ imported: number; errors: string[] }>(
      `/companies/${companyId}/account-categories/import`,
      categoriesJson
    );
  },
};

