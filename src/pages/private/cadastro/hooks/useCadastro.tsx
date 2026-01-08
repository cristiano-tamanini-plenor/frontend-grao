import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cadastrosService } from '../services/cadastros.service';
import type { CadastroFormSchema } from '../schemas/cadastro.schemas';
import type { Cadastro } from '../services/cadastros.service';

export function useCadastro(id?: string) {
  return useQuery({
    queryKey: ['cadastro', id],
    queryFn: async () => {
      if (!id) return null;
      return cadastrosService.getCadastroById(id);
    },
    enabled: !!id,
  });
}

export function useCadastros() {
  return useQuery({
    queryKey: ['cadastros'],
    queryFn: async () => {
      return cadastrosService.listCadastros();
    },
  });
}

export function useCreateCadastro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CadastroFormSchema): Promise<Cadastro> => {
      return cadastrosService.createCadastro(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cadastros'] });
      toast.success('Cadastro criado com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao criar cadastro: ' + errorMessage);
    },
  });
}

export function useUpdateCadastro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CadastroFormSchema }): Promise<Cadastro> => {
      return cadastrosService.updateCadastro(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cadastros'] });
      queryClient.invalidateQueries({ queryKey: ['cadastro'] });
      toast.success('Cadastro atualizado com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao atualizar cadastro: ' + errorMessage);
    },
  });
}

export function useDeleteCadastro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return cadastrosService.deleteCadastro(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cadastros'] });
      queryClient.invalidateQueries({ queryKey: ['cadastro'] });
      toast.success('Cadastro excluído com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao excluir cadastro: ' + errorMessage);
    },
  });
}
