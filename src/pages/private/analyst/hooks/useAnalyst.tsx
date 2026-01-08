import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { analystsService } from '../services/analysts.service';
import type { AnalystFormSchema } from '../schemas/analyst.schemas';
import type { Analyst } from '../types';

export function useAnalyst(id?: string) {
  return useQuery({
    queryKey: ['analyst', id],
    queryFn: async () => {
      if (!id) return null;
      return analystsService.getAnalystById(id);
    },
    enabled: !!id,
  });
}

export function useAnalysts() {
  return useQuery({
    queryKey: ['analysts'],
    queryFn: async () => {
      return analystsService.listAnalysts();
    },
  });
}

export function useCreateAnalyst() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AnalystFormSchema): Promise<Analyst> => {
      return analystsService.createAnalyst(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysts'] });
      toast.success('Analista criado com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
      toast.error('Erro ao criar analista: ' + errorMessage);
    },
  });
}

export function useUpdateAnalyst() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AnalystFormSchema }): Promise<Analyst> => {
      return analystsService.updateAnalyst(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysts'] });
      queryClient.invalidateQueries({ queryKey: ['analyst'] });
      toast.success('Analista atualizado com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
      toast.error('Erro ao atualizar analista: ' + errorMessage);
    },
  });
}

export function useDeleteAnalyst() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return analystsService.deleteAnalyst(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysts'] });
      queryClient.invalidateQueries({ queryKey: ['analyst'] });
      toast.success('Analista excluído com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
      toast.error('Erro ao excluir analista: ' + errorMessage);
    },
  });
}

