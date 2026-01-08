import { useQuery } from '@tanstack/react-query';
import { getSidebarByCompanyId } from '../services/sidebar.service';
import type { SidebarConfig } from '@/components/layout/Template/Sidebar/types';

/**
 * Hook para buscar a configuração da sidebar de uma empresa
 * Usa React Query para cache e gerenciamento de estado
 */
export function useSidebar(companyId: string | null) {
  return useQuery<SidebarConfig>({
    queryKey: ['sidebar', companyId],
    queryFn: async () => {
      if (!companyId) {
        return [];
      }
      return getSidebarByCompanyId(companyId);
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

