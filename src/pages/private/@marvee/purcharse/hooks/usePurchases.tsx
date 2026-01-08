import { useQuery } from '@tanstack/react-query';
import { purchasesService, type PurchasesFilters } from '../services/purchases.service';
import type { PurchasesListResponse } from '../services/purchases.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

/**
 * Hook para buscar lista de compras com paginação
 */
export function usePurchases(filters?: PurchasesFilters) {
  const { currentCompany } = useCompany();

  return useQuery<PurchasesListResponse>({
    queryKey: ['marvee-purchases', currentCompany?.id, filters],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return purchasesService.listPurchases(currentCompany.id, filters);
    },
    enabled: !!currentCompany?.id,
  });
}

