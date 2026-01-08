import { useQuery } from '@tanstack/react-query';
import { extractService, type ExtractFilters } from '../services/extract.service';
import type { ExtractListResponse } from '../services/extract.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

/**
 * Hook para buscar lista de movimentações do extrato bancário com paginação
 */
export function useExtract(filters?: ExtractFilters) {
  const { currentCompany } = useCompany();

  return useQuery<ExtractListResponse>({
    queryKey: ['marvee-extract', currentCompany?.id, filters],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return extractService.listExtract(currentCompany.id, filters);
    },
    enabled: !!currentCompany?.id && !!filters?.dateStart && !!filters?.dateEnd,
  });
}

