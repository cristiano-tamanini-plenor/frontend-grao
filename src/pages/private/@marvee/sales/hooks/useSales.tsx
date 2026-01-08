import { useQuery } from '@tanstack/react-query';
import { salesService, type SalesFilters } from '../services/sales.service';
import type { SalesListResponse } from '../services/sales.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

/**
 * Hook para buscar lista de vendas com paginação
 */
export function useSales(filters?: SalesFilters) {
  const { currentCompany } = useCompany();

  return useQuery<SalesListResponse>({
    queryKey: ['marvee-sales', currentCompany?.id, filters],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return salesService.listSales(currentCompany.id, filters);
    },
    enabled: !!currentCompany?.id,
  });
}

