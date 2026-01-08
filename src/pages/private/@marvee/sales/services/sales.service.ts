import { apiClient } from '@/lib/api/client';

/**
 * Interface para filtros de vendas
 */
export interface SalesFilters {
  code_reference?: string;
  dateStart?: string; // YYYY-MM-DD
  dateEnd?: string; // YYYY-MM-DD
  peopleId?: string; // ID do cliente para filtrar
  situation?: string[]; // Array de situações para filtrar
  search?: string; // Busca geral (mínimo 3 caracteres)
  page?: number;
  pageSize?: number; // Máximo: 1000
}

/**
 * Interface para métricas de vendas
 */
export interface SalesMetrics {
  valorTotalVenda: number;
  valorTotalContrato: string;
  valorFaturado: number;
  ticketMedio: string;
  valorCancelado: number;
  valorTotalPeriodo: string;
}

/**
 * Interface para metadados de paginação
 */
export interface SalesMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  first_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  previous_page_url: string | null;
  metrics: SalesMetrics;
}

/**
 * Interface para uma venda (conforme estrutura da API Marvee)
 */
export interface Sale {
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
}

/**
 * Interface para resposta da API de listagem de vendas
 */
export interface SalesListResponse {
  meta: SalesMeta;
  data: Sale[];
}

/**
 * Serviço para gerenciar vendas da API Marvee
 */
export const salesService = {
  /**
   * Lista vendas com filtros opcionais e paginação
   * GET /companies/:companyId/marvee/sales
   */
  async listSales(
    companyId: string | number,
    filters?: SalesFilters
  ): Promise<SalesListResponse> {
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
    if (filters?.peopleId) {
      queryParams.append('peopleId', filters.peopleId);
    }
    if (filters?.situation && filters.situation.length > 0) {
      // Envia múltiplas situações como array na querystring
      filters.situation.forEach((sit) => {
        queryParams.append('situation', sit);
      });
    }
    if (filters?.search && filters.search.length >= 3) {
      queryParams.append('search', filters.search);
    }
    if (filters?.page !== undefined) {
      queryParams.append('page', String(filters.page));
    }
    if (filters?.pageSize !== undefined) {
      queryParams.append('pageSize', String(filters.pageSize));
    }

    const queryString = queryParams.toString();
    const url = `/companies/${companyId}/marvee/sales${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<SalesListResponse>(url);
    return response;
  },

  /**
   * Busca uma venda por código de referência
   * GET /companies/:companyId/marvee/sales/by-code-reference
   */
  async getSaleByCodeReference(
    companyId: string | number,
    codeReference: string,
    dateStart: string,
    dateEnd: string
  ): Promise<Sale> {
    const queryParams = new URLSearchParams();
    queryParams.append('code_reference', codeReference);
    queryParams.append('dateStart', dateStart);
    queryParams.append('dateEnd', dateEnd);

    const url = `/companies/${companyId}/marvee/sales/by-code-reference?${queryParams.toString()}`;
    const response = await apiClient.get<Sale>(url);
    return response;
  },

  /**
   * Atualiza o valor de uma venda
   * POST /company/:companyId/edit_value_sale
   */
  async updateSaleValue(
    companyId: string | number,
    saleId: number,
    value: number
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const url = `/company/${companyId}/edit_value_sale`;
    const response = await apiClient.post<{ success: boolean; message: string; data?: any }>(
      url,
      {
        id_sale: saleId,
        value: value,
      }
    );
    return response;
  },
};

