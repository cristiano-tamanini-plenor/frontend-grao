import { useQuery } from '@tanstack/react-query';
import { asaasHomeService } from '../services/home.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

/**
 * Hook para buscar dados da home do Asaas
 */
export function useAsaasHome() {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ['asaas-home', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return asaasHomeService.getHomeData(currentCompany.id);
    },
    enabled: !!currentCompany?.id,
  });
}

