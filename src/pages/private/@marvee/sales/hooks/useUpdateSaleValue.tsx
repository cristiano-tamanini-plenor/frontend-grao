import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '../services/sales.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { toast } from 'sonner';

/**
 * Hook para atualizar o valor de uma venda
 */
export function useUpdateSaleValue() {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ saleId, value }: { saleId: number; value: number }) => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return salesService.updateSaleValue(currentCompany.id, saleId, value);
    },
    onSuccess: () => {
      // Invalida a query de vendas para refetch
      queryClient.invalidateQueries({ queryKey: ['marvee-sales'] });
      toast.success('Valor atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar valor');
    },
  });
}

