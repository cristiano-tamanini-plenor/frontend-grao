import { useQuery } from '@tanstack/react-query';
import { customersService, type CustomersFilters } from '../services/customers.service';
import type { CustomersListResponse, Customer } from '../services/customers.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

/**
 * Hook para buscar lista de clientes com paginação
 */
export function useCustomers(filters?: CustomersFilters) {
  const { currentCompany } = useCompany();

  return useQuery<CustomersListResponse>({
    queryKey: ['marvee-customers', currentCompany?.id, filters],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return customersService.listCustomers(currentCompany.id, filters);
    },
    enabled: !!currentCompany?.id,
  });
}

/**
 * Hook para buscar lista de clientes disponíveis (não cadastrados no sistema)
 */
export function useAvailableCustomers(filters?: CustomersFilters) {
  const { currentCompany } = useCompany();

  return useQuery<CustomersListResponse | Customer[]>({
    queryKey: ['marvee-customers-available', currentCompany?.id, filters],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return customersService.listAvailableCustomers(currentCompany.id, filters);
    },
    enabled: !!currentCompany?.id,
  });
}

