import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import { accountCategoriesService } from '../services/account-categories.service';
import type { AccountCategoryFormSchema } from '../schemas/account-category.schemas';
import type { AccountCategory } from '../types';

export function useAccountCategory(companyId: number | undefined, id?: string) {
  return useQuery({
    queryKey: ['account-category', companyId, id],
    queryFn: async () => {
      if (!id || !companyId) return null;
      return accountCategoriesService.getAccountCategoryById(companyId, id);
    },
    enabled: !!id && !!companyId,
  });
}

export function useAccountCategories(companyId: number | undefined) {
  return useQuery({
    queryKey: ['account-categories', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      return accountCategoriesService.listAccountCategories(companyId);
    },
    enabled: !!companyId,
  });
}

export function useCreateAccountCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AccountCategoryFormSchema & { companyId: string }): Promise<AccountCategory> => {
      const companyIdNumber = Number(data.companyId);
      // Convert string IDs to numbers for API
      // Note: company_id is in the URL, not in the payload
      // primary_category_filter_id is not sent to backend (it's just a filter field)
      const createDto = {
        account_category_father_id: data.account_category_father_id
          ? Number(data.account_category_father_id)
          : null,
        structure: data.structure || null,
        description: data.description || null,
        status: data.status ?? true,
        level: data.level,
      };
      return accountCategoriesService.createAccountCategory(companyIdNumber, createDto);
    },
    onSuccess: (_, variables) => {
      const companyId = variables.companyId ? Number(variables.companyId) : undefined;
      queryClient.invalidateQueries({ queryKey: ['account-categories', companyId] });
      queryClient.invalidateQueries({ queryKey: ['account-categories'] });
      toast.success('Categoria de conta criada com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao criar categoria de conta: ' + errorMessage);
    },
  });
}

export function useUpdateAccountCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      companyId,
    }: {
      id: string;
      data: AccountCategoryFormSchema;
      companyId: string;
    }): Promise<AccountCategory> => {
      // Convert string IDs to numbers for API
      // Note: company_id is in the URL, not in the payload
      const updateDto: any = {};
      if (data.account_category_father_id !== undefined) {
        updateDto.account_category_father_id = data.account_category_father_id
          ? Number(data.account_category_father_id)
          : null;
      }
      if (data.structure !== undefined) {
        updateDto.structure = data.structure || null;
      }
      if (data.description !== undefined) {
        updateDto.description = data.description || null;
      }
      if (data.status !== undefined) {
        updateDto.status = data.status;
      }
      if (data.level !== undefined) {
        updateDto.level = data.level;
      }

      const companyIdNumber = Number(companyId);
      return accountCategoriesService.updateAccountCategory(companyIdNumber, id, updateDto);
    },
    onSuccess: (_, variables) => {
      const companyId = variables.companyId ? Number(variables.companyId) : undefined;
      queryClient.invalidateQueries({ queryKey: ['account-categories', companyId] });
      queryClient.invalidateQueries({ queryKey: ['account-categories'] });
      queryClient.invalidateQueries({ queryKey: ['account-category', variables.companyId, variables.id] });
      toast.success('Categoria de conta atualizada com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao atualizar categoria de conta: ' + errorMessage);
    },
  });
}

export function useDeleteAccountCategory() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, id }: { companyId: string; id: string }): Promise<void> => {
      const companyIdNumber = Number(companyId);
      return accountCategoriesService.deleteAccountCategory(companyIdNumber, id);
    },
    onSuccess: (_, variables) => {
      const companyId = variables.companyId ? Number(variables.companyId) : undefined;
      queryClient.invalidateQueries({ queryKey: ['account-categories', companyId] });
      queryClient.invalidateQueries({ queryKey: ['account-categories'] });
      queryClient.invalidateQueries({ queryKey: ['account-category', companyId, variables.id] });
      queryClient.invalidateQueries({ queryKey: ['account-category'] });
      toast.success('Categoria de conta excluída com sucesso!');
      // Navega de volta para a listagem após excluir
      navigate('/contas-gerenciais');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao excluir categoria de conta: ' + errorMessage);
    },
  });
}

/**
 * Hook para exportar categorias de conta
 */
export function useExportAccountCategories() {
  const [isExporting, setIsExporting] = useState(false);

  const exportCategories = async (companyId: number) => {
    setIsExporting(true);
    try {
      const blob = await accountCategoriesService.exportAccountCategories(companyId);
      
      // Cria link de download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'categories.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Categorias exportadas com sucesso!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao exportar categorias: ' + errorMessage);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportCategories,
    isExporting,
  };
}

/**
 * Hook para importar categorias de conta
 */
export function useImportAccountCategories() {
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);

  const importCategories = async (companyId: number, file: File) => {
    setIsImporting(true);
    try {
      // Lê o conteúdo do arquivo
      const fileContent = await file.text();
      const categoriesJson = JSON.parse(fileContent);
      
      // Valida estrutura básica
      if (!categoriesJson.categories || !Array.isArray(categoriesJson.categories)) {
        throw new Error('Formato de arquivo inválido. Esperado campo "categories" como array.');
      }

      // Importa as categorias
      const result = await accountCategoriesService.importAccountCategories(companyId, categoriesJson);
      
      // Invalida queries para atualizar a listagem
      queryClient.invalidateQueries({ queryKey: ['account-categories', companyId] });
      queryClient.invalidateQueries({ queryKey: ['account-categories'] });
      
      // Mostra resultado
      if (result.errors.length > 0) {
        toast.warning(
          `${result.imported} categorias importadas. ${result.errors.length} aviso(s): ${result.errors.slice(0, 3).join(', ')}${result.errors.length > 3 ? '...' : ''}`
        );
      } else {
        toast.success(`${result.imported} categorias importadas com sucesso!`);
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao importar categorias: ' + errorMessage);
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importCategories,
    isImporting,
  };
}

