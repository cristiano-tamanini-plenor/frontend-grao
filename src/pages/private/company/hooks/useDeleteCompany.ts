import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { companiesService } from '../services/companies.service';

export function useDeleteCompany() {
  return useMutation({
    mutationFn: async (id: string) => {
      await companiesService.deleteCompany(id);
      return id;
    },
    onSuccess: () => {
      toast.success('Empresa excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir empresa: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

