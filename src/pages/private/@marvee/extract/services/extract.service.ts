import { apiClient } from '@/lib/api/client';

/**
 * Interface para filtros de extrato bancário
 */
export interface ExtractFilters {
  dateStart?: string; // ISO 8601 (ex: 2025-01-01T00:00:00.000Z)
  dateEnd?: string; // ISO 8601 (ex: 2025-01-31T23:59:59.999Z)
  accounts?: string; // IDs separados por vírgula (ex: "4065,4066")
  categories?: string; // IDs separados por vírgula (ex: "107258,107257")
  cost_centers?: string; // IDs separados por vírgula (ex: "1928,1037,977")
  status?: string; // Valores: atrasado, conciliado, pendente, quitado, vence_hoje
  page?: number;
  pageSize?: number; // Máximo: 1000
}

/**
 * Interface para métricas de extrato
 */
export interface ExtractMetrics {
  total_receitas: number;
  total_despesas: number;
  saldo_final: number;
  total_receitas_previsto: number;
  total_despesas_previsto: number;
  total_receitas_realizado: number;
  total_despesas_realizado: number;
}

/**
 * Interface para metadados de paginação
 */
export interface ExtractMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  first_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  previous_page_url: string | null;
  metrics: ExtractMetrics;
}

/**
 * Interface para informações da conta bancária
 */
export interface ExtractAccount {
  id: number;
  name: string;
  bank_code: string;
}

/**
 * Interface para informações da parcela
 */
export interface ExtractInstallment {
  id: number;
  guid: string;
  installment: number;
  original_value: string;
  additional_value: string;
  discount_value: string;
  movement_value: string;
  balance_value: string;
  comment: string | null;
  expiration_date: string;
  payment_date: string;
  document: ExtractDocument;
}

/**
 * Interface para informações do documento
 */
export interface ExtractDocument {
  id: number;
  guid: string;
  code: string;
  generation_date: string;
  code_reference: string | null;
  purchase_order: string | null;
  comment: string | null;
  description: string;
  payment_method_type: string;
  original_value: string;
  additional_value: string;
  discount_value: string;
  value: string;
  people: ExtractPeople;
  cost_centers: ExtractCostCenter[];
  category_level_3: ExtractCategory;
  category_level_2: ExtractCategory;
  category_level_1: ExtractCategory;
}

/**
 * Interface para informações da pessoa (cliente/fornecedor)
 */
export interface ExtractPeople {
  id: number;
  guid: string;
  entity_type: string;
  cnpjcpf: string;
  name: string;
  fantasy_name: string;
  cep: string;
  number: number;
}

/**
 * Interface para centro de custo
 */
export interface ExtractCostCenter {
  id: number;
  cost_center_id: number;
  name: string;
  percentage: string;
  value: string;
}

/**
 * Interface para categoria
 */
export interface ExtractCategory {
  id: number;
  structure: string;
  description: string;
}

/**
 * Interface para transferências
 */
export interface ExtractTransfer {
  id: number;
  guid: string;
  original_account: {
    id: number;
    name: string;
  };
  destination_account: {
    id: number;
    name: string;
  };
  value: string;
  description: string;
}

/**
 * Interface para tesouro/movimentação
 */
export interface ExtractTreasury {
  id: number;
  guid: string;
  value: string;
  additional_value: string;
  discount_value: string;
  movement_value: string;
  movement_date: string;
  comment: string;
}

/**
 * Interface para uma movimentação do extrato
 */
export interface ExtractItem {
  type: number; // 1 = receita, -1 = despesa
  typecolumn: string; // "realizado" ou "previsto"
  source: string; // "bills_to_receive", "bills_to_pay", "transfer_in", "transfer_out"
  guid: string;
  origin: string;
  value: number;
  status: string;
  account: ExtractAccount;
  installment?: ExtractInstallment;
  transfers?: ExtractTransfer;
  treasury: ExtractTreasury;
}

/**
 * Interface para resposta da API de extrato
 */
export interface ExtractListResponse {
  meta: ExtractMeta;
  data: ExtractItem[];
}

/**
 * Serviço para gerenciar extrato bancário da API Marvee
 */
export const extractService = {
  /**
   * Lista movimentações do extrato bancário com filtros opcionais e paginação
   * GET /companies/:companyId/marvee/extract
   */
  async listExtract(
    companyId: string | number,
    filters?: ExtractFilters
  ): Promise<ExtractListResponse> {
    const queryParams = new URLSearchParams();

    if (filters?.dateStart) {
      queryParams.append('dateStart', filters.dateStart);
    }
    if (filters?.dateEnd) {
      queryParams.append('dateEnd', filters.dateEnd);
    }
    if (filters?.accounts) {
      queryParams.append('accounts', filters.accounts);
    }
    if (filters?.categories) {
      queryParams.append('categories', filters.categories);
    }
    if (filters?.cost_centers) {
      queryParams.append('cost_centers', filters.cost_centers);
    }
    if (filters?.status) {
      queryParams.append('status', filters.status);
    }
    if (filters?.page !== undefined) {
      queryParams.append('page', String(filters.page));
    }
    if (filters?.pageSize !== undefined) {
      queryParams.append('pageSize', String(filters.pageSize));
    }

    const queryString = queryParams.toString();
    const url = `/companies/${companyId}/marvee/extract${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ExtractListResponse>(url);
    return response;
  },
};

