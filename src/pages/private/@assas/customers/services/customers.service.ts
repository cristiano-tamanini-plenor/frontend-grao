import { apiClient } from '@/lib/api/client';

/**
 * Interface para filtros de customers
 */
export interface CustomersFilters {
  offset?: number;
  limit?: number;
  name?: string;
  email?: string;
  cpfCnpj?: string;
}

/**
 * Interface para um customer (conforme estrutura da API Asaas)
 */
export interface Customer {
  object: string;
  id: string;
  dateCreated: string;
  name: string;
  email: string | null;
  phone: string | null;
  mobilePhone: string | null;
  cpfCnpj: string | null;
  postalCode: string | null;
  address: string | null;
  addressNumber: string | null;
  complement: string | null;
  province: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  externalReference: string | null;
  notificationDisabled: boolean;
  additionalEmails: string | null;
  observations: string | null;
  [key: string]: any; // Permite campos adicionais da API externa
}

/**
 * Interface para resposta da API Asaas
 */
export interface CustomersResponse {
  object: string;
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: Customer[];
}

/**
 * Serviço para gerenciar customers da API externa
 */
export const customersService = {
  /**
   * Lista customers com filtros opcionais e paginação
   * GET /companies/:companyId/asaas/customers
   */
  async listCustomers(
    companyId: string | number,
    filters?: CustomersFilters
  ): Promise<CustomersResponse> {
    const queryParams = new URLSearchParams();
    
    // Filtros de busca
    if (filters?.name) {
      queryParams.append('name', filters.name);
    }
    if (filters?.email) {
      queryParams.append('email', filters.email);
    }
    if (filters?.cpfCnpj) {
      queryParams.append('cpfCnpj', filters.cpfCnpj);
    }
    
    // Parâmetros de paginação
    if (filters?.offset !== undefined) {
      queryParams.append('offset', String(filters.offset));
    }
    if (filters?.limit !== undefined) {
      queryParams.append('limit', String(filters.limit));
    }
    
    const queryString = queryParams.toString();
    const url = `/companies/${companyId}/asaas/customers${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<CustomersResponse>(url);
    
    // Retorna a resposta completa com informações de paginação
    return response;
  },
};

