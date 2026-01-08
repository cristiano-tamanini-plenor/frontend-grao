import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gerencialPlanService } from '../services/gerencial-plan.service';
import type {
  GerencialPlan,
  CreateGerencialPlanDto,
  UpdateGerencialPlanDto,
  CreateGerencialPlanResultDto,
  ReorderGerencialPlanDto,
  GerencialPlanResult,
} from '../types';

/**
 * Hook para listar todas as linhas do plano gerencial
 */
export function useGerencialPlans(companyId: number | undefined) {
  return useQuery({
    queryKey: ['gerencial-plans', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      return gerencialPlanService.listGerencialPlans(companyId);
    },
    enabled: !!companyId,
  });
}

/**
 * Hook para buscar uma linha específica por ID
 */
export function useGerencialPlan(companyId: number | undefined, id: number | undefined) {
  return useQuery({
    queryKey: ['gerencial-plan', companyId, id],
    queryFn: async () => {
      if (!id || !companyId) return null;
      return gerencialPlanService.getGerencialPlanById(companyId, id);
    },
    enabled: !!id && !!companyId,
  });
}

/**
 * Hook para criar uma nova linha
 */
export function useCreateGerencialPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: number;
      data: CreateGerencialPlanDto;
    }): Promise<GerencialPlan> => {
      return gerencialPlanService.createGerencialPlan(companyId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gerencial-plans', variables.companyId] });
      toast.success('Linha do plano gerencial criada com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      if (error?.statusCode === 409) {
        toast.error('Esta sequência já existe para esta empresa.');
      } else {
        toast.error('Erro ao criar linha do plano: ' + errorMessage);
      }
    },
  });
}

/**
 * Hook para atualizar uma linha existente
 */
export function useUpdateGerencialPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      id,
      data,
    }: {
      companyId: number;
      id: number;
      data: UpdateGerencialPlanDto;
    }): Promise<GerencialPlan> => {
      return gerencialPlanService.updateGerencialPlan(companyId, id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gerencial-plans', variables.companyId] });
      queryClient.invalidateQueries({
        queryKey: ['gerencial-plan', variables.companyId, variables.id],
      });
      toast.success('Linha do plano gerencial atualizada com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      if (error?.statusCode === 409) {
        toast.error('Esta sequência já existe para esta empresa.');
      } else {
        toast.error('Erro ao atualizar linha do plano: ' + errorMessage);
      }
    },
  });
}

/**
 * Hook para remover uma linha
 */
export function useDeleteGerencialPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      id,
    }: {
      companyId: number;
      id: number;
    }): Promise<void> => {
      return gerencialPlanService.deleteGerencialPlan(companyId, id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gerencial-plans', variables.companyId] });
      toast.success('Linha do plano gerencial removida com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao remover linha do plano: ' + errorMessage);
    },
  });
}

/**
 * Hook para adicionar categoria a um resultado
 */
export function useAddGerencialPlanResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      gerencialPlanId,
      data,
    }: {
      companyId: number;
      gerencialPlanId: number;
      data: CreateGerencialPlanResultDto;
    }): Promise<GerencialPlanResult> => {
      return gerencialPlanService.addResult(companyId, gerencialPlanId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['gerencial-plans', variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ['gerencial-plan', variables.companyId, variables.gerencialPlanId],
      });
      toast.success('Categoria adicionada ao resultado com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      if (error?.statusCode === 409) {
        toast.error('Esta categoria já está associada a este resultado.');
      } else {
        toast.error('Erro ao adicionar categoria: ' + errorMessage);
      }
    },
  });
}

/**
 * Hook para remover categoria de um resultado
 */
export function useRemoveGerencialPlanResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      gerencialPlanId,
      resultId,
    }: {
      companyId: number;
      gerencialPlanId: number;
      resultId: number;
    }): Promise<void> => {
      return gerencialPlanService.removeResult(companyId, gerencialPlanId, resultId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['gerencial-plans', variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ['gerencial-plan', variables.companyId, variables.gerencialPlanId],
      });
      toast.success('Categoria removida do resultado com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao remover categoria: ' + errorMessage);
    },
  });
}

/**
 * Hook para reordenar linhas
 */
export function useReorderGerencialPlans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: number;
      data: ReorderGerencialPlanDto;
    }): Promise<GerencialPlan[]> => {
      return gerencialPlanService.reorderLines(companyId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gerencial-plans', variables.companyId] });
      toast.success('Linhas reordenadas com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao reordenar linhas: ' + errorMessage);
    },
  });
}

