import { useQuery } from '@tanstack/react-query';
import { myDashboardService } from '../services/my-dashboard.service';
import { analystsService } from '@/pages/private/analyst/services/analysts.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

export interface FaturamentoMensalData {
  mes: string;
  mesNumero: number;
  value: number;
}

export function useMDFaturamentoMensal(analystId: number | null, selectedYear: number) {
  const { currentCompany } = useCompany();

  // Busca o analista para obter o cost_center_id
  const { data: analyst } = useQuery({
    queryKey: ['analyst', analystId],
    queryFn: async () => {
      if (!analystId) return null;
      return await analystsService.getAnalystById(String(analystId));
    },
    enabled: !!analystId,
  });

  // Obtém o cost_center_id do analista ou usa '1037' como padrão
  const costCenterId = analyst?.marvee_cost_center_id 
    ? analyst.marvee_cost_center_id 
    : 1037;

  // Busca dados do resumo de faturamento mensal
  const { data: resumoData, isLoading, error } = useQuery({
    queryKey: ['my-dashboard', 'resumo-faturamento-mensal', currentCompany?.id, costCenterId, selectedYear],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return await myDashboardService.getResumoFaturamentoMensal({
        companyId: currentCompany.id,
        cost_center_id: costCenterId,
        year: selectedYear,
      });
    },
    enabled: !!currentCompany?.id,
  });

  // Processa os dados da API - a API já retorna tudo no formato correto
  const data: FaturamentoMensalData[] = resumoData?.data ?? [];

  return {
    data,
    isLoading,
    error,
  };
}
