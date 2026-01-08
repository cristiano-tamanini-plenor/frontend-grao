import { useQuery } from '@tanstack/react-query';
import { myDashboardService } from '../services/my-dashboard.service';
import { useMemo } from 'react';
import { analystsService } from '@/pages/private/analyst/services/analysts.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

export interface MetricsData {
  faturamento: {
    atual: number;
    anual: number;
    variacao: number;
  };
  carteira: {
    atual: number;
    anual: number;
    variacao: number;
  };
  comissao: {
    atual: number;
    anual: number;
    variacao: number;
  };
  nps: {
    atual: number;
    anual: number;
    variacao: number;
  };
}

export interface FaturamentoItem {
  id: number;
  guid?: string;
  nfse_number: string | null;
  status: string;
  data_emissao: string | null;
  value: number;
  services_value: string | null;
  verification_code?: string | null;
  url?: string | null;
  url_danfse: string | null;
  document: {
    id: number;
    code: string;
    generation_date?: string | null;
    situation?: string | null;
    category: {
      id: number;
      category: string;
      description: string;
    };
    cost_centers?: Array<{
      id: number;
      name: string;
      percentage: string;
      value: string;
    }>;
  };
  people: {
    id: number;
    name: string;
    fantasy_name: string;
    cnpjcpf: string;
  };
  cost_centers?: Array<{
    id: number;
    name: string;
    percentage: string;
    value: number;
  }>;
  item_value?: number;
}


/**
 * Obtém o valor do cost_center específico de um item
 * Prioriza cost_centers no nível raiz, depois dentro de document, depois item_value, por último value
 */
export function getCostCenterValue(item: FaturamentoItem, costCenterId: number): number {
  // Primeiro tenta cost_centers no nível raiz (estrutura da API de detalhes)
  if (item.cost_centers && Array.isArray(item.cost_centers)) {
    const costCenter = item.cost_centers.find((center) => center.id === costCenterId);
    if (costCenter) {
      return typeof costCenter.value === 'number' ? costCenter.value : parseFloat(String(costCenter.value)) || 0;
    }
  }

  // Depois tenta cost_centers dentro de document (estrutura antiga)
  if (item.document?.cost_centers && Array.isArray(item.document.cost_centers)) {
    const costCenter = item.document.cost_centers.find((center) => center.id === costCenterId);
    if (costCenter) {
      return parseFloat(costCenter.value) || 0;
    }
  }

  // Se não encontrou, tenta usar item_value (se existe)
  if (item.item_value !== undefined) {
    return item.item_value;
  }

  // Por último, retorna o value do item
  return item.value || 0;
}

/**
 * Obtém o valor do cost_center 1037 de um documento (função legada para compatibilidade)
 */
export function getCostCenter1037Value(item: FaturamentoItem): number {
  return getCostCenterValue(item, 1037);
}

/**
 * Verifica se um documento está cancelado
 */
export function isDocumentCanceled(item: FaturamentoItem): boolean {
  const situation = item.document?.situation?.toLowerCase() || '';
  return situation.includes('cancelado') || situation.includes('cancelada');
}


/**
 * Hook para buscar métricas dos cards do dashboard
 */
export function useMDCards(analystId: number | null) {
  const { currentCompany } = useCompany();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12 (janeiro = 1)

  // Busca o analista para obter o cost_center_id
  const { data: analyst } = useQuery({
    queryKey: ['analyst', analystId],
    queryFn: async () => {
      if (!analystId) return null;
      return await analystsService.getAnalystById(String(analystId));
    },
    enabled: !!analystId,
  });

  // Obtém o cost_center_id do analista ou usa 1037 como padrão
  const costCenterId = analyst?.marvee_cost_center_id 
    ? analyst.marvee_cost_center_id 
    : 1037;

  // Busca resumo de faturamento mensal do ano atual
  const { data: resumoData, isLoading, error } = useQuery({
    queryKey: ['my-dashboard', 'resumo-faturamento-mensal', currentCompany?.id, costCenterId, currentYear],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return await myDashboardService.getResumoFaturamentoMensal({
        companyId: currentCompany.id,
        cost_center_id: costCenterId,
        year: currentYear,
      });
    },
    enabled: !!currentCompany?.id,
  });

  // Processa os dados da API ou usa dados mockados como fallback
  const metrics: MetricsData = useMemo(() => {
    // Dados padrão (mockados) para fallback
    const defaultMetrics: MetricsData = {
      faturamento: {
        atual: 0,
        anual: 0,
        variacao: 0,
      },
      carteira: {
        atual: 45,
        anual: 540,
        variacao: 8.2,
      },
      comissao: {
        atual: 8750.00,
        anual: 105000.00,
        variacao: 12.5,
      },
      nps: {
        atual: 8.5,
        anual: 8.7,
        variacao: 5.8,
      },
    };

    // Se ainda está carregando ou deu erro, usa dados mockados
    if (isLoading || error || !resumoData?.data) {
      return defaultMetrics;
    }

    // Os dados já vêm no formato: [{ mes: "Jan", mesNumero: 1, value: 123.45 }, ...]
    const resumoMensal = resumoData.data;

    if (Array.isArray(resumoMensal) && resumoMensal.length > 0) {
      // Calcula o total anual (soma de todos os meses)
      const totalAnual = resumoMensal.reduce((sum, item) => sum + (item.value || 0), 0);
      
      // Encontra o valor do mês atual (mesNumero de 1-12)
      const mesAtualData = resumoMensal.find(item => item.mesNumero === currentMonth);
      const valorMesAtual = mesAtualData?.value || 0;
      
      // Calcula a média mensal do ano
      const mediaMensalAnual = totalAnual / 12;
      
      // Calcula a variação comparando o mês atual com a média mensal
      const variacao = mediaMensalAnual > 0 
        ? ((valorMesAtual - mediaMensalAnual) / mediaMensalAnual) * 100 
        : 0;

      return {
        ...defaultMetrics,
        faturamento: {
          atual: valorMesAtual,
          anual: totalAnual,
          variacao: variacao,
        },
      };
    }

    // Se não tem dados válidos, retorna dados mockados
    return defaultMetrics;
  }, [resumoData, isLoading, error, currentMonth]);

  return {
    metrics,
    isLoading,
    error,
    faturamentoData: null, // Não usado mais
    faturamentoMensalData: resumoData?.data ?? null, // Dados mensais para o card
  };
}

