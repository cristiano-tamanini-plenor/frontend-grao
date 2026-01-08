import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { iconFormSchema, type IconFormSchema } from '../schemas/icon.schemas';
import { iconsService } from '../services/icons.service';
import { useCreateIcon, useUpdateIcon, useDeleteIcon } from './useIcon';

const defaultValues: IconFormSchema = {
  type: 'lib',
  name: '',
  variant: 'Linear',
  category: '',
  description: '',
  active: true,
  file: null,
  file_dark: null,
  url: null,
  url_dark: null,
};

export function useFormIcon(id: string | null) {
  const navigate = useNavigate();
  const formMethods = useForm<IconFormSchema>({
    defaultValues,
    resolver: zodResolver(iconFormSchema),
  });

  const { isLoadingForm } = useGetIcon(id, formMethods);
  const createMutation = useCreateIcon();
  const updateMutation = useUpdateIcon();
  const deleteMutation = useDeleteIcon();

  const onSubmit = async (formData: IconFormSchema) => {
    if (id) {
      const updatedIcon = await updateMutation.mutateAsync({ id, data: formData });
      // Reseta o formulário com os dados atualizados para limpar o estado "dirty"
      formMethods.reset({
        type: updatedIcon.type,
        name: updatedIcon.name,
        variant: updatedIcon.variant,
        category: updatedIcon.category || '',
        description: updatedIcon.description || '',
        active: updatedIcon.active,
        file: null, // Não mantém o arquivo após atualização
        file_dark: null, // Não mantém o arquivo após atualização
        url: updatedIcon.url || null,
        url_dark: updatedIcon.url_dark || null,
      });
      return updatedIcon;
    }
    // Ao criar, navega para a página de edição com o ID retornado
    const createdIcon = await createMutation.mutateAsync(formData);
    if (createdIcon?.id) {
      // Navega para a página de edição - o useGetIcon vai resetar o formulário quando o ID mudar
      navigate(`/icones/form?id=${createdIcon.id}`, { replace: true });
    }
    return createdIcon;
  };

  const handleSubmit = formMethods.handleSubmit(onSubmit);

  // Reset quando o ID muda (incluindo quando muda de null para um ID após criação)
  const prevIdRef = useRef<string | null>(id);
  useEffect(() => {
    if (prevIdRef.current !== id) {
      // Se mudou de null para um ID (após criação), reseta para limpar estado "dirty"
      if (!prevIdRef.current && id) {
        formMethods.reset(defaultValues, { keepDefaultValues: false });
      }
      // Se mudou de um ID para null (voltou para criação), reseta
      else if (prevIdRef.current && !id) {
        formMethods.reset(defaultValues, { keepDefaultValues: false });
      }
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
    handleDelete: id ? () => deleteMutation.mutateAsync(id) : undefined,
    isLoadingUpdate: updateMutation.isPending,
    isLoadingCreate: createMutation.isPending,
    isLoadingDelete: deleteMutation.isPending,
    isLoadingForm,
  };
}

function useGetIcon(
  id: string | null,
  formMethods: UseFormReturn<IconFormSchema>,
) {
  // Usa ref para manter a referência estável do reset
  const resetRef = useRef(formMethods.reset);
  resetRef.current = formMethods.reset;

  const { data, isFetching, error, isLoading } = useQuery({
    queryKey: ['icon', id],
    queryFn: async () => {
      if (!id) return null;
      return iconsService.getIconById(id);
    },
    enabled: Boolean(id),
  });

  // Popula o formulário quando os dados são carregados
  useEffect(() => {
    if (data && id) {
      const formData: IconFormSchema = {
        type: data.type || 'lib',
        name: data.name || '',
        variant: data.variant || 'Linear',
        category: data.category || '',
        description: data.description || '',
        active: data.active ?? true,
        file: null, // Não carrega o arquivo ao editar
        file_dark: null, // Não carrega o arquivo ao editar
        url: data.url || null,
        url_dark: data.url_dark || null,
      };
      
      resetRef.current(formData, {
        keepDefaultValues: false,
      });
    } else if (id && !data && !isFetching && !isLoading) {
      // Se há um ID mas não há dados e não está carregando, reseta para evitar estado "dirty"
      resetRef.current(defaultValues, {
        keepDefaultValues: false,
      });
    }
  }, [data, id, isFetching, isLoading]);

  // Log de erro para debug
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar ícone:', error);
      toast.error('Erro ao carregar dados do ícone: ' + (error.message || 'Erro desconhecido'));
    }
  }, [error]);

  return {
    isLoadingForm: isFetching || isLoading,
    icon: data,
  };
}

