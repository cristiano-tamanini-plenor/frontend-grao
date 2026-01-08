import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chargesService, type ChargesFilters } from '../services/charges.service';
import type { ChargesResponse } from '../services/charges.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { toast } from 'sonner';

/**
 * Hook para buscar lista de charges com paginação
 */
export function useCharges(filters?: ChargesFilters) {
  const { currentCompany } = useCompany();

  return useQuery<ChargesResponse>({
    queryKey: ['charges', currentCompany?.id, filters],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return chargesService.listCharges(currentCompany.id, filters);
    },
    enabled: !!currentCompany?.id,
  });
}

/**
 * Hook para criar venda Marvee para uma charge
 */
export function usePostSaleMarvee() {
  const queryClient = useQueryClient();
  const { currentCompany } = useCompany();

  return useMutation({
    mutationFn: async (chargeId: string) => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return chargesService.postSaleMarvee(currentCompany?.id, chargeId);
    },
    onSuccess: () => {
      // Invalida a query de charges para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['charges', currentCompany?.id] });
      toast.success('Venda Marvee criada com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao criar venda Marvee: ' + errorMessage);
    },
  });
}

/**
 * Hook para atualizar/corrigir venda Marvee
 */
export function useUpdateMarveeSale() {
  const queryClient = useQueryClient();
  const { currentCompany } = useCompany();

  return useMutation({
    mutationFn: async (data: { marvee_sale_id: number; charge_id: string }) => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return chargesService.updateMarveeSale(currentCompany.id, data);
    },
    onSuccess: () => {
      // Invalida a query de charges para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['charges', currentCompany?.id] });
      toast.success('Venda Marvee corrigida com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao corrigir venda Marvee: ' + errorMessage);
    },
  });
}

