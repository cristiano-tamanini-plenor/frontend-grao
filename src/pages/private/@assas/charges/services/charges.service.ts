import { apiClient } from '@/lib/api/client';

/**
 * Interface para filtros de charges
 */
export interface ChargesFilters {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  status?: string | string[]; // Pode ser string única ou array de strings
  billingType?: string | string[]; // Pode ser string única ou array de strings
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
 * Interface para venda da Marvee (quando integrada)
 */
export interface MarveeSale {
  id: number;
  code_reference: string;
  value: string;
  fantasy_name: string;
  generation_date: string;
  situation: string;
  [key: string]: any; // Permite campos adicionais da API Marvee
}

/**
 * Interface para uma charge (conforme estrutura da API Asaas)
 */
export interface Charge {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  customerData?: CustomerData;
  subscription: string | null;
  installment: string | null;
  paymentLink: string | null;
  value: number;
  netValue: number;
  originalValue: number;
  interestValue: number;
  description: string;
  billingType: string;
  status: string;
  dueDate: string;
  originalDueDate: string;
  paymentDate: string | null;
  clientPaymentDate: string | null;
  installmentNumber: number | null;
  invoiceUrl: string;
  invoiceNumber: string;
  externalReference: string | null;
  deleted: boolean;
  anticipated: boolean;
  anticipable: boolean;
  creditDate: string | null;
  estimatedCreditDate: string;
  transactionReceiptUrl: string | null;
  nossoNumero: string;
  bankSlipUrl: string | null;
  // Campos adicionais da integração com Marvee
  marveeSale?: MarveeSale | null;
  marveeSaleWarning?: string | null;
  marveeSaleCount?: number;
  [key: string]: any; // Permite campos adicionais da API externa
}

/**
 * Interface para resposta da API Asaas
 */
export interface ChargesResponse {
  object: string;
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: Charge[];
}

/**
 * Serviço para gerenciar charges da API externa
 */
export const chargesService = {
  /**
   * Lista charges com filtros opcionais e paginação
   * GET /companies/:companyId/asaas/charges
   */
  async listCharges(
    companyId: string | number,
    filters?: ChargesFilters
  ): Promise<ChargesResponse> {
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
    
    // Filtro por status (suporta múltiplos valores)
    if (filters?.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      statuses.forEach(status => {
        queryParams.append('status', status);
      });
    }
    
    // Filtro por billingType (suporta múltiplos valores)
    if (filters?.billingType) {
      const billingTypes = Array.isArray(filters.billingType) ? filters.billingType : [filters.billingType];
      billingTypes.forEach(billingType => {
        queryParams.append('billingType', billingType);
      });
    }
    
    // Parâmetros de paginação
    if (filters?.offset !== undefined) {
      queryParams.append('offset', String(filters.offset));
    }
    if (filters?.limit !== undefined) {
      queryParams.append('limit', String(filters.limit));
    }
    
    const queryString = queryParams.toString();
    const url = `/companies/${companyId}/asaas/charges${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ChargesResponse>(url);
    
    // Retorna a resposta completa com informações de paginação
    return response;
  },

  /**
   * Cria venda Marvee para uma charge
   * POST /post-sale-marvee/:chargeId
   */
  async postSaleMarvee(companyId: string | number, chargeId: string): Promise<any> {
    const url = `/companies/${companyId}/asaas/charges/post-sale-marvee/${chargeId}`;
    return apiClient.post(url);
  },

  /**
   * Atualiza/corrige venda Marvee
   * POST /companies/:companyId/marvee/sales/update
   */
  async updateMarveeSale(
    companyId: string | number,
    data: { marvee_sale_id: number; charge_id: string }
  ): Promise<any> {
    const url = `/companies/${companyId}/marvee/sales/update`;
    return apiClient.post(url, data);
  },
};

