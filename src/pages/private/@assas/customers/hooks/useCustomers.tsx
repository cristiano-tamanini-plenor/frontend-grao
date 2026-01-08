import { useQuery } from '@tanstack/react-query';
import { customersService, type CustomersFilters } from '../services/customers.service';
import type { CustomersResponse } from '../services/customers.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

/**
 * Hook para buscar lista de customers com paginação
 */
export function useCustomers(filters?: CustomersFilters) {
  const { currentCompany } = useCompany();

  return useQuery<CustomersResponse>({
    queryKey: ['customers', currentCompany?.id, filters],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return customersService.listCustomers(currentCompany.id, filters);
    },
    enabled: !!currentCompany?.id,
  });
}

