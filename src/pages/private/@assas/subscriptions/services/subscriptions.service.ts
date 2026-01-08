import { apiClient } from '@/lib/api/client';

/**
 * Interface para filtros de subscriptions
 */
export interface SubscriptionsFilters {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  offset?: number;
  limit?: number;
}

/**
 * Interface para dados do cliente
 */
export interface CustomerData {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string | null;
  mobilePhone: string | null;
}

/**
 * Interface para uma subscription (conforme estrutura da API Asaas)
 */
export interface Subscription {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  customerData?: CustomerData;
  paymentLink: string | null;
  billingType: string;
  value: number;
  nextDueDate: string;
  cycle: string;
  description: string;
  status: string;
  deleted: boolean;
  [key: string]: any; // Permite campos adicionais da API externa
}

/**
 * Interface para resposta da API Asaas
 */
export interface SubscriptionsResponse {
  object: string;
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: Subscription[];
}

/**
 * Serviço para gerenciar subscriptions da API externa
 */
export const subscriptionsService = {
  /**
   * Lista subscriptions com filtros opcionais e paginação
   * GET /companies/:companyId/asaas/subscriptions
   */
  async listSubscriptions(
    companyId: string | number,
    filters?: SubscriptionsFilters
  ): Promise<SubscriptionsResponse> {
    const queryParams = new URLSearchParams();
    
    // Usa a sintaxe correta da API: dateCreated[ge] e dateCreated[le]
    if (filters?.startDate) {
      queryParams.append('dateCreated[ge]', filters.startDate);
    }
    if (filters?.endDate) {
      queryParams.append('dateCreated[le]', filters.endDate);
    }
    
    // Filtro por cliente
    if (filters?.customerId) {
      queryParams.append('customer', filters.customerId);
    }
    
    // Parâmetros de paginação
    if (filters?.offset !== undefined) {
      queryParams.append('offset', String(filters.offset));
    }
    if (filters?.limit !== undefined) {
      queryParams.append('limit', String(filters.limit));
    }
    
    const queryString = queryParams.toString();
    const url = `/companies/${companyId}/asaas/subscriptions${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<SubscriptionsResponse>(url);
    
    // Retorna a resposta completa com informações de paginação
    return response;
  },
};

