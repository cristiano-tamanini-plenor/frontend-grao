import { apiClient } from '@/lib/api/client';

/**
 * Interface para filtros de clientes
 */
export interface CustomersFilters {
  name?: string;
  cpfCnpj?: string;
  email?: string;
  search?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Interface para metadados de paginação
 */
export interface CustomersMeta {
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
 * Interface para um cliente (conforme estrutura da API Marvee)
 */
export interface Customer {
  id: number;
  guid: string;
  company_id: number;
  created_at: string;
  updated_at: string;
  code: number;
  cnpjcpf: string | null;
  name: string;
  fantasy_name: string | null;
  entity_type: string | null;
  cep: string | null;
  address: string | null;
  number: number | null;
  complement: string | null;
  city: string | null;
  email: string | null;
  contact_name: string | null;
  phone: string | null;
  status: boolean;
  county_registrate: string | null;
  eh_customer: boolean;
  eh_provider: boolean;
  segment_id: number | null;
  district: string | null;
  avatar: string | null;
  company_avatar_url?: string | null; // URL do avatar da empresa associada
  tax_regime: string | null;
  special_tax_regime: string | null;
  modalidade_lucro: string | null;
  website: string | null;
  state_id: number | null;
  county_id: number | null;
  main_cnae_id: number | null;
  eh_company: boolean | null;
  type_address: string | null;
  es_type: string | null;
  eh_agent: boolean;
  eh_lead: boolean;
  crm_contact_reference_id: string | null;
  crm_deal_reference_id: string | null;
  es_plataforma_bloqueada: boolean | null;
  origin: string | null;
  origin_description: string | null;
  origin_id: number | null;
  seller_id: number | null;
  opening_date: string | null;
  ddd: string | null;
  ddi: string | null;
  tipo_de_entidade: string | null;
  country_id: number | null;
  ie_indicator: string | null;
  state_registrate: string | null;
  tax_profile_id: number | null;
  id_integration: string | null;
  eh_public_organization: boolean;
  crm_fatura_mais_que_30_mil: boolean | null;
  crm_valor_medio_servicos_maior_que_1000: boolean | null;
  minified_code: string | null;
  situacao_cadastral: string | null;
  data_ultima_consulta: string | null;
  emite_nfses: boolean;
  recebe_nfses: boolean;
  fee: number | null;
  [key: string]: any; // Permite campos adicionais da API
}

/**
 * Interface para resposta da API de listagem de clientes
 */
export interface CustomersListResponse {
  meta: CustomersMeta;
  data: Customer[];
}

/**
 * Serviço para gerenciar clientes da API Marvee
 */
export const customersService = {
  /**
   * Lista clientes com filtros opcionais e paginação
   * GET /companies/:companyId/marvee/customers
   */
  async listCustomers(
    companyId: string | number,
    filters?: CustomersFilters
  ): Promise<CustomersListResponse> {
    const queryParams = new URLSearchParams();

    if (filters?.name) {
      queryParams.append('name', filters.name);
    }
    if (filters?.cpfCnpj) {
      queryParams.append('cpfCnpj', filters.cpfCnpj);
    }
    if (filters?.email) {
      queryParams.append('email', filters.email);
    }
    if (filters?.page !== undefined) {
      queryParams.append('page', String(filters.page));
    }
    if (filters?.pageSize !== undefined) {
      queryParams.append('pageSize', String(filters.pageSize));
    }

    const queryString = queryParams.toString();
    const url = `/companies/${companyId}/marvee/customers${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<CustomersListResponse>(url);
    return response;
  },

  /**
   * Lista clientes ativos por analista
   * GET /companies/:companyId/marvee/customers/active/by-analyst?analystId=:analystId
   */
  async getActiveCustomersByAnalyst(
    companyId: string | number,
    analystId: number
  ): Promise<Customer[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('analystId', String(analystId));

    const queryString = queryParams.toString();
    const url = `/companies/${companyId}/marvee/customers/active/by-analyst?${queryString}`;

    const response = await apiClient.get<Customer[]>(url);
    return response;
  },

  /**
   * Lista clientes disponíveis (não cadastrados no sistema)
   * GET /analysts/clientes/available
   */
  async listAvailableCustomers(
    companyId: string | number,
    filters?: CustomersFilters
  ): Promise<CustomersListResponse | Customer[]> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('companyId', String(companyId));

    if (filters?.search) {
      queryParams.append('search', filters.search);
    }
    if (filters?.sort) {
      queryParams.append('sort', filters.sort);
    }
    if (filters?.page !== undefined) {
      queryParams.append('page', String(filters.page));
    }
    if (filters?.pageSize !== undefined) {
      queryParams.append('pageSize', String(filters.pageSize));
    }

    const queryString = queryParams.toString();
    const url = `/analysts/clientes/available${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<CustomersListResponse | Customer[]>(url);
    return response;
  },
};

