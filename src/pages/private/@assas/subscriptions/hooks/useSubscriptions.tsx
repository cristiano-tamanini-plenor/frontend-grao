import { useQuery } from '@tanstack/react-query';
import { subscriptionsService, type SubscriptionsFilters } from '../services/subscriptions.service';
import type { SubscriptionsResponse } from '../services/subscriptions.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

/**
 * Hook para buscar lista de subscriptions com paginação
 */
export function useSubscriptions(filters?: SubscriptionsFilters) {
  const { currentCompany } = useCompany();

  return useQuery<SubscriptionsResponse>({
    queryKey: ['subscriptions', currentCompany?.id, filters],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return subscriptionsService.listSubscriptions(currentCompany.id, filters);
    },
    enabled: !!currentCompany?.id,
  });
}

