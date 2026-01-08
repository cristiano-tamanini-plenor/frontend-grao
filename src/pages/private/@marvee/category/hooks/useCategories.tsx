import { useQuery } from '@tanstack/react-query';
import { categoriesService, type CategoriesFilters } from '../services/categories.service';
import type { CategoriesListResponse } from '../services/categories.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

/**
 * Hook para buscar lista de categorias com paginação
 */
export function useCategories(filters?: CategoriesFilters) {
  const { currentCompany } = useCompany();

  return useQuery<CategoriesListResponse>({
    queryKey: ['marvee-categories', currentCompany?.id, filters],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return categoriesService.listCategories(currentCompany.id, filters);
    },
    enabled: !!currentCompany?.id,
  });
}

