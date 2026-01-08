import { useQuery } from '@tanstack/react-query';
import { costCentersService, type CostCentersFilters } from '../services/cost-centers.service';
import type { CostCentersListResponse } from '../services/cost-centers.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

/**
 * Hook para buscar lista de centros de custo com paginação
 */
export function useCostCenters(filters?: CostCentersFilters) {
  const { currentCompany } = useCompany();

  return useQuery<CostCentersListResponse>({
    queryKey: ['marvee-cost-centers', currentCompany?.id, filters],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return costCentersService.listCostCenters(currentCompany.id, filters);
    },
    enabled: !!currentCompany?.id,
  });
}

