import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { iconsService, type IconFilters } from '../services/icons.service';
import type { IconFormSchema } from '../schemas/icon.schemas';
import type { Icon } from '../services/icons.service';

export function useIcon(id?: string) {
  return useQuery({
    queryKey: ['icon', id],
    queryFn: async () => {
      if (!id) return null;
      return iconsService.getIconById(id);
    },
    enabled: !!id,
  });
}

export function useIcons(filters?: IconFilters) {
  return useQuery({
    queryKey: ['icons', filters],
    queryFn: async () => {
      return iconsService.listIcons(filters);
    },
  });
}

export function useCreateIcon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IconFormSchema): Promise<Icon> => {
      return iconsService.createIcon(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['icons'] });
      toast.success('Ícone criado com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao criar ícone: ' + errorMessage);
    },
  });
}

export function useUpdateIcon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: IconFormSchema }): Promise<Icon> => {
      return iconsService.updateIcon(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['icons'] });
      queryClient.invalidateQueries({ queryKey: ['icon'] });
      toast.success('Ícone atualizado com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao atualizar ícone: ' + errorMessage);
    },
  });
}

export function useDeleteIcon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return iconsService.deleteIcon(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['icons'] });
      queryClient.invalidateQueries({ queryKey: ['icon'] });
      toast.success('Ícone excluído com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao excluir ícone: ' + errorMessage);
    },
  });
}

