import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { plansService } from '../services/plans.service';
import type { PlanoFormSchema } from '../schemas/plano.schemas';
import type { Plano } from '../services/plans.service';

export function usePlano(id?: string) {
  return useQuery({
    queryKey: ['plano', id],
    queryFn: async () => {
      if (!id) return null;
      return plansService.getPlanById(id);
    },
    enabled: !!id,
  });
}

export function usePlanos() {
  return useQuery({
    queryKey: ['planos'],
    queryFn: async () => {
      return plansService.listPlans();
    },
  });
}

export function useCreatePlano() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PlanoFormSchema): Promise<Plano> => {
      return plansService.createPlan(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      toast.success('Plano criado com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao criar plano: ' + errorMessage);
    },
  });
}

export function useUpdatePlano() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PlanoFormSchema }): Promise<Plano> => {
      return plansService.updatePlan(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      queryClient.invalidateQueries({ queryKey: ['plano'] });
      toast.success('Plano atualizado com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao atualizar plano: ' + errorMessage);
    },
  });
}

export function useDeletePlano() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return plansService.deletePlan(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      queryClient.invalidateQueries({ queryKey: ['plano'] });
      toast.success('Plano excluído com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao excluir plano: ' + errorMessage);
    },
  });
}

// Planos Modulos hooks
export function usePlanoModulos(planoId: string) {
  return useQuery({
    queryKey: ['plano-modulos', planoId],
    queryFn: async () => {
      return plansService.listPlanModules(planoId);
    },
    enabled: !!planoId,
  });
}

export function useCreatePlanoModulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { plano_id: string; module_id: string; order_index: number; active: boolean }) => {
      const planoModuloData = {
        module_id: data.module_id,
        order_index: data.order_index,
        active: data.active,
      };
      return plansService.addModuleToPlan(data.plano_id, planoModuloData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plano-modulos', variables.plano_id] });
      toast.success('Módulo adicionado ao plano!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao adicionar módulo: ' + errorMessage);
    },
  });
}

export function useDeletePlanoModulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, planoId }: { id: string; planoId: string }): Promise<void> => {
      return plansService.removeModuleFromPlan(planoId, id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plano-modulos', variables.planoId] });
      toast.success('Módulo removido do plano!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao remover módulo: ' + errorMessage);
    },
  });
}

// Planos Grupos hooks
export function usePlanoGrupos(planoModuloId: string) {
  return useQuery({
    queryKey: ['plano-grupos', planoModuloId],
    queryFn: async () => {
      return plansService.listPlanGroups(planoModuloId);
    },
    enabled: !!planoModuloId,
  });
}

export function useCreatePlanoGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { plano_modulo_id: string; name: string; description: string | null; icon_id: number | null; order_index: number; active: boolean; iconName?: string | null }) => {
      const grupoData = {
        name: data.name,
        description: data.description,
        icon_id: data.icon_id,
        iconName: data.iconName || null, // Nome do ícone convertido do ID
        order_index: data.order_index,
        active: data.active,
      };
      return plansService.createPlanGroup(data.plano_modulo_id, grupoData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plano-grupos', variables.plano_modulo_id] });
      toast.success('Grupo criado!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao criar grupo: ' + errorMessage);
    },
  });
}

export function useDeletePlanoGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, planoModuloId }: { id: string; planoModuloId: string }): Promise<void> => {
      return plansService.deletePlanGroup(planoModuloId, id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plano-grupos', variables.planoModuloId] });
      toast.success('Grupo removido!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao remover grupo: ' + errorMessage);
    },
  });
}

// Planos Itens hooks
export function usePlanoItens(planoModuloId: string) {
  return useQuery({
    queryKey: ['plano-itens', planoModuloId],
    queryFn: async () => {
      return plansService.listPlanItems(planoModuloId);
    },
    enabled: !!planoModuloId,
  });
}

export function useCreatePlanoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { plano_modulo_id: string; grupo_id: string | null; cadastro_id: string; order_index: number; active: boolean }) => {
      const itemData = {
        cadastro_id: data.cadastro_id,
        grupo_id: data.grupo_id,
        order_index: data.order_index,
        active: data.active,
      };
      return plansService.addItemToPlanModule(data.plano_modulo_id, itemData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plano-itens', variables.plano_modulo_id] });
      toast.success('Cadastro adicionado!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao adicionar cadastro: ' + errorMessage);
    },
  });
}

export function useDeletePlanoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, planoModuloId }: { id: string; planoModuloId: string }): Promise<void> => {
      return plansService.deletePlanItem(planoModuloId, id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plano-itens', variables.planoModuloId] });
      toast.success('Cadastro removido!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao remover cadastro: ' + errorMessage);
    },
  });
}
