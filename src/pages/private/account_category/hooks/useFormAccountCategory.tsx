import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { accountCategoryFormSchema, type AccountCategoryFormSchema } from '../schemas/account-category.schemas';
import { accountCategoriesService } from '../services/account-categories.service';
import {
  useCreateAccountCategory,
  useUpdateAccountCategory,
  useDeleteAccountCategory,
} from './useAccountCategory';
import { AccountCategoryLevel } from '../types';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

const defaultValues: AccountCategoryFormSchema = {
  account_category_father_id: null,
  primary_category_filter_id: null,
  structure: '',
  description: '',
  status: true,
  level: AccountCategoryLevel.PRIMARY,
};

export function useFormAccountCategory(id: string | null) {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id ? Number(currentCompany.id) : undefined;
  const formMethods = useForm<AccountCategoryFormSchema>({
    defaultValues,
    resolver: zodResolver(accountCategoryFormSchema),
  });

  const { isLoadingForm } = useGetAccountCategory(id, companyId, formMethods);
  const createMutation = useCreateAccountCategory();
  const updateMutation = useUpdateAccountCategory();
  const deleteMutation = useDeleteAccountCategory();

  const onSubmit = async (formData: AccountCategoryFormSchema) => {
    if (!currentCompany?.id) {
      toast.error('Nenhuma empresa selecionada');
      return;
    }

    if (id) {
      // Modo edição: atualiza e mantém na mesma página
      const updatedCategory = await updateMutation.mutateAsync({ id, data: formData, companyId: currentCompany.id });
      // Reseta o formulário com os dados atualizados para limpar o estado "dirty"
      // Mantém os valores atuais, apenas atualiza para limpar o estado dirty
      // Se a categoria tem um pai, e o pai tem um pai (para Tertiary), 
      // preenche o filtro primário com o pai do pai
      let primaryFilterId: string | null = formMethods.getValues('primary_category_filter_id');
      if (updatedCategory.father && updatedCategory.father.account_category_father_id) {
        primaryFilterId = String(updatedCategory.father.account_category_father_id);
      }
      
      formMethods.reset({
        account_category_father_id: updatedCategory.account_category_father_id ? String(updatedCategory.account_category_father_id) : null,
        primary_category_filter_id: primaryFilterId,
        structure: updatedCategory.structure || '',
        description: updatedCategory.description || '',
        status: updatedCategory.status ?? true,
        level: updatedCategory.level,
      }, { keepDefaultValues: false, keepValues: false });
      return updatedCategory;
    }
    
    // Modo criação: cria e navega para a página de edição com o ID
    const createdCategory = await createMutation.mutateAsync({ ...formData, companyId: currentCompany.id });
    if (createdCategory?.id) {
      // Navega para a página de edição - o useGetAccountCategory vai resetar o formulário quando o ID mudar
      navigate(`/contas-gerenciais/form?id=${createdCategory.id}`, { replace: true });
    }
    return createdCategory;
  };

  const handleSubmit = formMethods.handleSubmit(onSubmit);

  // Reset apenas quando muda de um ID para null (voltou para criação)
  const prevIdRef = useRef<string | null>(id);
  useEffect(() => {
    if (prevIdRef.current !== id) {
      // Se mudou de um ID para null (voltou para criação), reseta
      if (prevIdRef.current && !id) {
        formMethods.reset(defaultValues, { keepDefaultValues: false });
      }
      // Quando muda de null para ID (após criação), não reseta aqui
      // O useGetAccountCategory vai popular os dados quando carregarem
      prevIdRef.current = id;
    }
  }, [id, formMethods]);

  // Reset apenas quando não há ID (modo criação) e não está carregando dados
  useEffect(() => {
    if (!id && !isLoadingForm) {
      formMethods.reset(defaultValues);
    }
  }, [id, isLoadingForm, formMethods]);

  return {
    formMethods,
    handleSubmit,
    handleDelete: id && currentCompany?.id ? () => deleteMutation.mutateAsync({ companyId: currentCompany.id, id }) : undefined,
    isLoadingUpdate: updateMutation.isPending,
    isLoadingCreate: createMutation.isPending,
    isLoadingDelete: deleteMutation.isPending,
    isLoadingForm,
  };
}

function useGetAccountCategory(
  id: string | null,
  companyId: number | undefined,
  formMethods: UseFormReturn<AccountCategoryFormSchema>
) {
  // Usa ref para manter a referência estável do reset
  const resetRef = useRef(formMethods.reset);
  resetRef.current = formMethods.reset;

  const { data, isFetching, error, isLoading } = useQuery({
    queryKey: ['account-category', companyId, id],
    queryFn: async () => {
      if (!id || !companyId) return null;
      return accountCategoriesService.getAccountCategoryById(companyId, id);
    },
    enabled: Boolean(id) && Boolean(companyId),
  });

  // Popula o formulário quando os dados são carregados
  useEffect(() => {
    if (data && id) {
      // Se a categoria tem um pai, e o pai tem um pai (para Tertiary), 
      // preenche o filtro primário com o pai do pai
      let primaryFilterId: string | null = null;
      if (data.father && data.father.account_category_father_id) {
        primaryFilterId = String(data.father.account_category_father_id);
      }

      const formData: AccountCategoryFormSchema = {
        account_category_father_id: data.account_category_father_id ? String(data.account_category_father_id) : null,
        primary_category_filter_id: primaryFilterId, // Preenche o filtro se for Tertiary
        structure: data.structure || '',
        description: data.description || '',
        status: data.status ?? true,
        level: data.level,
      };

      // Força o reset com os dados corretos
      resetRef.current(formData, {
        keepDefaultValues: false,
        keepValues: false,
      });
    }
  }, [data, id]);

  // Log de erro para debug
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar categoria de conta:', error);
      toast.error(
        'Erro ao carregar dados da categoria de conta: ' + (error.message || 'Erro desconhecido')
      );
    }
  }, [error]);

  return {
    isLoadingForm: isFetching || isLoading,
    accountCategory: data,
  };
}

