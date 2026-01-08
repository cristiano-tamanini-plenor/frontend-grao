import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { myDashboardService } from '../services/my-dashboard.service';

export interface FluxoGerencialData {
  mes: string;
  mesNumero: number;
  entrada: number;
  saida: number;
}

/**
 * Hook para buscar dados do fluxo gerencial
 * A API retorna tanto entrada quanto saída para cada mês
 */
export function useMDFluxoGerencial() {
  const { currentCompany } = useCompany();

  // Busca dados de fluxo gerencial (entrada e saída)
  const { data: fluxoData, isLoading, error } = useQuery({
    queryKey: ['my-dashboard', 'fluxo-gerencial', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      
      return await myDashboardService.getFluxoGerencial({
        companyId: currentCompany.id,
        cost_center_ids: '1037', // Fixo por enquanto
      });
    },
    enabled: !!currentCompany?.id,
  });

  // Processa os dados retornados pela API
  const data: FluxoGerencialData[] = useMemo(() => {
    if (!fluxoData?.data || !Array.isArray(fluxoData.data)) {
      return [];
    }

    // A API já retorna os dados no formato correto
    // Apenas garantimos que está ordenado por mês
    return fluxoData.data
      .sort((a, b) => a.mesNumero - b.mesNumero)
      .map((item) => ({
        mes: item.mes,
        mesNumero: item.mesNumero,
        entrada: item.entrada,
        saida: item.saida,
      }));
  }, [fluxoData]);

  return {
    data,
    isLoading,
    error,
  };
}

