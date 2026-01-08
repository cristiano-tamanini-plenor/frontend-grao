import { apiClient } from '@/lib/api/client';

/**
 * Interface para filtros de compras
 */
export interface PurchasesFilters {
  code_reference?: string;
  dateStart?: string; // YYYY-MM-DD
  dateEnd?: string; // YYYY-MM-DD
  page?: number;
  pageSize?: number; // Máximo: 1000
}

/**
 * Interface para métricas de compras
 */
export interface PurchasesMetrics {
  valorTotalCompra: number;
  valorTotalContrato: string;
  valorFaturado: number;
  ticketMedio: string;
  valorCancelado: number;
  valorTotalPeriodo: string;
}

/**
 * Interface para metadados de paginação
 */
export interface PurchasesMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  first_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  previous_page_url: string | null;
  metrics: PurchasesMetrics;
}

/**
 * Interface para o fornecedor
 */
export interface Provider {
  id: number;
  guid: string;
  name: string;
  fantasy_name: string;
  cnpjcpf: string;
}

/**
 * Interface para uma compra (conforme estrutura da API Marvee)
 */
export interface Purchase {
  category: string;
  category_name: string;
  account: string;
  bank_code: string;
  payment_method_type: string;
  nf_emission_type: string;
  nf_emission_trigger: string | null;
  id: number;
  guid: string;
  generation_date: string; // ISO datetime
  code: string;
  code_reference: string;
  purchase_order: string | null;
  service_order: string | null;
  situation: string;
  cnpjcpf: string;
  value: string; // Valor numérico como string
  services_total_amount: number;
  people_id: number;
  fantasy_name: string;
  people_avatar: string | null;
  people_emite_nfses: boolean;
  installment_settled: boolean;
  has_active_charge: boolean;
  type: string;
  original_document: string;
  contract_number: string;
  cancelable: boolean;
  outboxes: any[];
  cost_center_name: string | null;
  provider: Provider;
}

/**
 * Interface para resposta da API de listagem de compras
 */
export interface PurchasesListResponse {
  meta: PurchasesMeta;
  data: Purchase[];
}

/**
 * Serviço para gerenciar compras da API Marvee
 */
export const purchasesService = {
  /**
   * Lista compras com filtros opcionais e paginação
   * GET /companies/:companyId/marvee/purchases
   */
  async listPurchases(
    companyId: string | number,
    filters?: PurchasesFilters
  ): Promise<PurchasesListResponse> {
    const queryParams = new URLSearchParams();

    if (filters?.code_reference) {
      queryParams.append('code_reference', filters.code_reference);
    }
    if (filters?.dateStart) {
      queryParams.append('dateStart', filters.dateStart);
    }
    if (filters?.dateEnd) {
      queryParams.append('dateEnd', filters.dateEnd);
    }
    if (filters?.page !== undefined) {
      queryParams.append('page', String(filters.page));
    }
    if (filters?.pageSize !== undefined) {
      queryParams.append('pageSize', String(filters.pageSize));
    }

    const queryString = queryParams.toString();
    const url = `/companies/${companyId}/marvee/purchases${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<PurchasesListResponse>(url);
    return response;
  },

  /**
   * Busca uma compra por código de referência
   * GET /companies/:companyId/marvee/purchases/by-code-reference
   */
  async getPurchaseByCodeReference(
    companyId: string | number,
    codeReference: string,
    dateStart: string,
    dateEnd: string
  ): Promise<Purchase> {
    const queryParams = new URLSearchParams();
    queryParams.append('code_reference', codeReference);
    queryParams.append('dateStart', dateStart);
    queryParams.append('dateEnd', dateEnd);

    const url = `/companies/${companyId}/marvee/purchases/by-code-reference?${queryParams.toString()}`;
    const response = await apiClient.get<Purchase>(url);
    return response;
  },
};

