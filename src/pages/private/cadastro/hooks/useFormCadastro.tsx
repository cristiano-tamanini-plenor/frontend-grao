import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cadastroFormSchema, type CadastroFormSchema } from '../schemas/cadastro.schemas';
import { cadastrosService } from '../services/cadastros.service';
import { useCreateCadastro, useUpdateCadastro, useDeleteCadastro } from './useCadastro';

const defaultValues: CadastroFormSchema = {
  name: '',
  description: '',
  code: '',
  type: 'page',
  icon_id: null,
  route: '',
  active: true,
};

export function useFormCadastro(id: string | null) {
  const navigate = useNavigate();
  const formMethods = useForm<CadastroFormSchema>({
    defaultValues,
    resolver: zodResolver(cadastroFormSchema),
  });

  const { isLoadingForm } = useGetCadastro(id, formMethods);
  const createMutation = useCreateCadastro();
  const updateMutation = useUpdateCadastro();
  const deleteMutation = useDeleteCadastro();

  const onSubmit = async (formData: CadastroFormSchema) => {
    if (id) {
      const updatedCadastro = await updateMutation.mutateAsync({ id, data: formData });
      // Reseta o formulário com os dados atualizados para limpar o estado "dirty"
      formMethods.reset({
        name: updatedCadastro.name,
        description: updatedCadastro.description || '',
        code: updatedCadastro.code,
        type: updatedCadastro.type,
        icon_id: updatedCadastro.icon_id ?? null,
        route: updatedCadastro.route || '',
        active: updatedCadastro.active ?? true,
      });
      return updatedCadastro;
    }
    
    // Modo criação: cria e navega para a página de edição com o ID
    const createdCadastro = await createMutation.mutateAsync(formData);
    if (createdCadastro?.id) {
      // Navega para a página de edição - o useGetCadastro vai resetar o formulário quando o ID mudar
      navigate(`/cadastros/form?id=${createdCadastro.id}`, { replace: true });
    }
    return createdCadastro;
  };

  const handleSubmit = formMethods.handleSubmit(onSubmit);

  // Reset quando o ID muda (incluindo quando muda de null para um ID após criação)
  const prevIdRef = useRef<string | null>(id);
  useEffect(() => {
    if (prevIdRef.current !== id) {
      // Se mudou de null para um ID (após criação), não reseta aqui
      // O useGetCadastro vai popular os dados quando carregarem
      // Se mudou de um ID para null (voltou para criação), reseta
      if (prevIdRef.current && !id) {
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

function useGetCadastro(
  id: string | null,
  formMethods: UseFormReturn<CadastroFormSchema>,
) {
  // Usa ref para manter a referência estável do reset
  const resetRef = useRef(formMethods.reset);
  resetRef.current = formMethods.reset;

  const { data, isFetching, error, isLoading } = useQuery({
    queryKey: ['cadastro', id],
    queryFn: async () => {
      if (!id) return null;
      return cadastrosService.getCadastroById(id);
    },
    enabled: Boolean(id),
  });

  // Popula o formulário quando os dados são carregados
  useEffect(() => {
    if (data && id) {
      const formData: CadastroFormSchema = {
        name: data.name || '',
        description: data.description || '',
        code: data.code || '',
        type: data.type,
        icon_id: data.icon_id ?? null,
        route: data.route || '',
        active: data.active ?? true,
      };
      
      resetRef.current(formData, {
        keepDefaultValues: false,
      });
    }
  }, [data, id]);

  // Log de erro para debug
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar cadastro:', error);
      toast.error('Erro ao carregar dados do cadastro: ' + (error.message || 'Erro desconhecido'));
    }
  }, [error]);

  return {
    isLoadingForm: isFetching || isLoading,
    cadastro: data,
  };
}


