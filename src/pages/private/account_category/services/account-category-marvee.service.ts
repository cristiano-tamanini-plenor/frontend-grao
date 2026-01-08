import { apiClient } from '@/lib/api/client';

/**
 * Interface para uma associação entre AccountCategory e Category Marvee
 */
export interface AccountCategoryMarvee {
  id: number;
  account_category_id: number;
  marvee_category_id: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para criar uma associação
 */
export interface CreateAccountCategoryMarveeDto {
  account_category_id: number;
  marvee_category_id: number;
}

/**
 * Interface para atualizar uma associação
 */
export interface UpdateAccountCategoryMarveeDto {
  account_category_id?: number;
  marvee_category_id?: number;
}

/**
 * Serviço para gerenciar associações entre AccountCategory e Category Marvee
 */
export const accountCategoryMarveeService = {
  /**
   * Lista todas as associações de uma categoria de conta
   * GET /companies/:companyId/account-category-marvee/by-category/:accountCategoryId
   */
  async listByAccountCategory(
    companyId: number,
    accountCategoryId: number
  ): Promise<AccountCategoryMarvee[]> {
    return apiClient.get<AccountCategoryMarvee[]>(
      `/companies/${companyId}/account-category-marvee/by-category/${accountCategoryId}`
    );
  },

  /**
   * Cria uma nova associação
   * POST /companies/:companyId/account-category-marvee
   */
  async create(
    companyId: number,
    data: CreateAccountCategoryMarveeDto
  ): Promise<AccountCategoryMarvee> {
    return apiClient.post<AccountCategoryMarvee>(
      `/companies/${companyId}/account-category-marvee`,
      data
    );
  },

  /**
   * Remove uma associação
   * DELETE /companies/:companyId/account-category-marvee/:id
   */
  async delete(companyId: number, id: number): Promise<void> {
    return apiClient.delete<void>(`/companies/${companyId}/account-category-marvee/${id}`);
  },
};

