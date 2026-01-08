import { apiClient } from '@/lib/api/client';

export interface GetFaturamentoParams {
  dateStart: string; // ISO 8601 format
  dateEnd: string; // ISO 8601 format
  cost_center_ids?: string | string[]; // Optional - string or array of IDs
  status?: string | string[]; // Optional - string or array of status values
}

export interface FaturamentoResponse {
  success: boolean;
  data: any; // Estrutura retornada pela API do n8n
}

export interface GetFluxoGerencialParams {
  companyId: string | number; // ID da empresa (obrigatório)
  cost_center_ids?: string; // Optional - string of IDs separated by comma
}

export interface FluxoGerencialItem {
  mes: string; // Abreviação do mês: "Jan", "Fev", "Mar", etc.
  mesNumero: number; // 0-11 (0 = Janeiro, 11 = Dezembro)
  entrada: number; // Valor sempre positivo
  saida: number; // Valor sempre negativo
}

export interface FluxoGerencialResponse {
  success: boolean;
  data: FluxoGerencialItem[];
}

export interface ResumoFaturamentoMensalItem {
  mes: string;
  mesNumero: number;
  value: number;
}

export interface ResumoFaturamentoMensalResponse {
  success: boolean;
  data: ResumoFaturamentoMensalItem[];
}

export interface GetResumoFaturamentoMensalParams {
  companyId: string | number;
  cost_center_id?: string | number;
  year: number;
}

export interface GetDetalhesFaturamentoMensalParams {
  companyId: string | number;
  cost_center_id?: string | number;
  mes: number; // 1-12
  year: number;
}

/**
 * Serviço para consultar dados do dashboard
 */
export const myDashboardService = {
  /**
   * Consulta dados de faturamento
   * GET /my-dashboard/faturamento
   */
  async getFaturamento(params: GetFaturamentoParams): Promise<FaturamentoResponse> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('dateStart', params.dateStart);
    queryParams.append('dateEnd', params.dateEnd);
    
    if (params.cost_center_ids) {
      const costCenterIds = Array.isArray(params.cost_center_ids)
        ? params.cost_center_ids.join(',')
        : params.cost_center_ids;
      queryParams.append('cost_center_ids', costCenterIds);
    }

    // Adiciona status (pode ser string ou array)
    // Se for array, precisa ser enviado como status[]=valor1&status[]=valor2
    if (params.status) {
      if (Array.isArray(params.status)) {
        // Para arrays, adiciona cada valor como status[]=valor
        params.status.forEach((status) => {
          queryParams.append('status[]', status);
        });
      } else {
        // Para string única, adiciona como status=valor
        queryParams.append('status', params.status);
      }
    } else {
      // Default: apenas autorizado
      queryParams.append('status', 'autorizado');
    }

    // Adiciona parâmetros fixos conforme documentação
    queryParams.append('page', '1');
    queryParams.append('pageSize', '1000');
    queryParams.append('sort[0][0]', 'name');
    queryParams.append('sort[0][1]', 'asc');

    const url = `/my-dashboard/faturamento?${queryParams.toString()}`;
    const response = await apiClient.get<FaturamentoResponse>(url);
    return response;
  },

  /**
   * Consulta dados de fluxo gerencial
   * GET /companies/:companyId/my-dashboard/fluxo-gerencial
   * 
   * Retorna dados mensais de entrada e saída para o gráfico de fluxo gerencial.
   * A API retorna automaticamente dados do ano vigente (01/01 até 31/12 do ano atual).
   * Ver documentação em: src/pages/private/my-dashboard/md-fluxo-gerencial/README.md
   */
  async getFluxoGerencial(params: GetFluxoGerencialParams): Promise<FluxoGerencialResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.cost_center_ids) {
      queryParams.append('cost_center_ids', params.cost_center_ids);
    }

    const queryString = queryParams.toString();
    const url = `/companies/${params.companyId}/my-dashboard/fluxo-gerencial${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<FluxoGerencialResponse>(url);
    return response;
  },

  /**
   * Consulta resumo de faturamento mensal
   * GET /companies/:companyId/my-dashboard/resumo-faturamento-mensal?cost_center_id=:cost_center_id&year=:year
   */
  async getResumoFaturamentoMensal(params: GetResumoFaturamentoMensalParams): Promise<ResumoFaturamentoMensalResponse> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('year', String(params.year));
    
    if (params.cost_center_id) {
      queryParams.append('cost_center_id', String(params.cost_center_id));
    }

    const queryString = queryParams.toString();
    const url = `/companies/${params.companyId}/my-dashboard/resumo-faturamento-mensal?${queryString}`;
    const response = await apiClient.get<ResumoFaturamentoMensalResponse>(url);
    return response;
  },

  /**
   * Consulta detalhes de faturamento mensal
   * GET /companies/:companyId/my-dashboard/detalhes-faturamento-mensal?cost_center_id=:cost_center_id&mes=:month&year=:year
   */
  async getDetalhesFaturamentoMensal(params: GetDetalhesFaturamentoMensalParams): Promise<FaturamentoResponse> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('mes', String(params.mes));
    queryParams.append('year', String(params.year));
    
    if (params.cost_center_id) {
      queryParams.append('cost_center_id', String(params.cost_center_id));
    }

    const queryString = queryParams.toString();
    const url = `/companies/${params.companyId}/my-dashboard/detalhes-faturamento-mensal?${queryString}`;
    const response = await apiClient.get<FaturamentoResponse>(url);
    return response;
  },
};

