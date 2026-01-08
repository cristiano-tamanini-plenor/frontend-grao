import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  accountCategoryMarveeService,
  type CreateAccountCategoryMarveeDto,
} from '../services/account-category-marvee.service';

/**
 * Hook para listar associações de uma categoria de conta
 */
export function useAccountCategoryMarvee(
  companyId: number | undefined,
  accountCategoryId: string | null | undefined
) {
  return useQuery({
    queryKey: ['account-category-marvee', companyId, accountCategoryId],
    queryFn: async () => {
      if (!companyId || !accountCategoryId) return [];
      return accountCategoryMarveeService.listByAccountCategory(
        companyId,
        Number(accountCategoryId)
      );
    },
    enabled: !!companyId && !!accountCategoryId,
  });
}

/**
 * Hook para criar uma associação
 */
export function useCreateAccountCategoryMarvee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: number;
      data: CreateAccountCategoryMarveeDto;
    }) => {
      return accountCategoryMarveeService.create(companyId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['account-category-marvee', variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ['account-category', variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ['account-categories', variables.companyId],
      });
      toast.success('Categoria Marvee associada com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      if (error?.statusCode === 409) {
        toast.error('Esta categoria Marvee já está associada a outra categoria de conta nesta empresa.');
      } else {
        toast.error('Erro ao associar categoria Marvee: ' + errorMessage);
      }
    },
  });
}

/**
 * Hook para remover uma associação
 */
export function useDeleteAccountCategoryMarvee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      id,
      accountCategoryId,
    }: {
      companyId: number;
      id: number;
      accountCategoryId?: number;
    }) => {
      return accountCategoryMarveeService.delete(companyId, id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['account-category-marvee', variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ['account-category', variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ['account-categories', variables.companyId],
      });
      toast.success('Associação removida com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao remover associação: ' + errorMessage);
    },
  });
}

