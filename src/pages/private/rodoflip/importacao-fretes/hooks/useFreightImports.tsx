import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { freightImportsService } from '../services/freight-imports.service';
import type { FreightImport } from '../types';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

/**
 * Hook para listar todas as importações
 */
export function useFreightImports() {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ['freight-imports', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany) {
        throw new Error('Nenhuma empresa selecionada');
      }
      return freightImportsService.listImports(currentCompany.id);
    },
    enabled: !!currentCompany,
  });
}

/**
 * Hook para obter detalhes de uma importação específica
 */
export function useFreightImport(importId: number | null) {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ['freight-import', currentCompany?.id, importId],
    queryFn: async () => {
      if (!currentCompany || !importId) {
        throw new Error('Empresa ou importação não selecionada');
      }
      return freightImportsService.getImportById(currentCompany.id, importId);
    },
    enabled: !!currentCompany && !!importId,
  });
}

/**
 * Hook para fazer upload de CSV
 * @param showToast - Se true, mostra toast notifications (padrão: false)
 */
export function useUploadFreightImport(showToast: boolean = false) {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!currentCompany) {
        throw new Error('Nenhuma empresa selecionada');
      }
      return freightImportsService.uploadCSV(currentCompany.id, file);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['freight-imports', currentCompany?.id],
      });
      if (showToast) {
        toast.success('Importação realizada com sucesso!', {
          description: `Arquivo importado. Status: ${data.status}`,
        });
      }
    },
    onError: (error: Error) => {
      if (showToast) {
        toast.error('Erro ao importar arquivo', {
          description: error.message || 'Erro desconhecido',
        });
      }
    },
  });
}

/**
 * Hook para deletar uma importação
 */
export function useDeleteFreightImport() {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (importId: number) => {
      if (!currentCompany) {
        throw new Error('Nenhuma empresa selecionada');
      }
      return freightImportsService.deleteImport(currentCompany.id, importId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['freight-imports', currentCompany?.id],
      });
      toast.success('Importação deletada com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao deletar importação', {
        description: error.message || 'Erro desconhecido',
      });
    },
  });
}
