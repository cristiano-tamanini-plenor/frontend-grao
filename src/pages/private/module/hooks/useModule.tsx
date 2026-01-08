import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { moduleFormSchema, type ModuleFormSchema } from '../schemas/module.schemas';
import { modulesService, type Module } from '../services/modules.service';

// Interface Module agora vem do modules.service

const defaultValues: ModuleFormSchema = {
  name: '',
  description: '',
  code: '',
  icon_id: null,
  active: true,
  parent_id: null,
  allowed_roles: ['OWNER', 'MEMBER', 'MEMBER_LIMITED', 'GUEST', 'DEVELOPER'],
};

export function useModule(id?: string) {
  return useQuery({
    queryKey: ['module', id],
    queryFn: async () => {
      if (!id) return null;
      return modulesService.getModuleById(id);
    },
    enabled: !!id,
  });
}

export function useFormModule(id: string | null) {
  const navigate = useNavigate();
  const formMethods = useForm<ModuleFormSchema>({
    defaultValues,
    resolver: zodResolver(moduleFormSchema),
  });

  const { isLoadingForm } = useGetModule(id, formMethods);
  const { handleCreate, isLoadingCreate } = useCreateModule();
  const { handleUpdate, isLoadingUpdate } = useUpdateModule(id);
  const { handleDelete, isLoadingDelete } = useDeleteModule();

  const onSubmit = async (formData: ModuleFormSchema) => {
    if (id) {
      return handleUpdate(formData);
    }
    return handleCreate(formData);
  };

  const handleSubmit = formMethods.handleSubmit(onSubmit);

  // Reset apenas quando não há ID (modo criação) e não está carregando dados
  useEffect(() => {
    if (!id && !isLoadingForm) {
      formMethods.reset(defaultValues);
    }
  }, [id, isLoadingForm]);

  return {
    formMethods,
    handleSubmit,
    handleDelete,
    isLoadingUpdate,
    isLoadingCreate,
    isLoadingDelete,
    isLoadingForm,
  };
}

function useGetModule(
  id: string | null,
  formMethods: UseFormReturn<ModuleFormSchema>,
) {
  // Usa ref para manter a referência estável do reset
  const resetRef = useRef(formMethods.reset);
  resetRef.current = formMethods.reset;

  const { data, isFetching, error, isLoading } = useQuery({
    queryKey: ['module', id],
    queryFn: async () => {
      if (!id) return null;
      return modulesService.getModuleById(id);
    },
    enabled: Boolean(id),
  });

  // Popula o formulário quando os dados são carregados
  useEffect(() => {
    if (data && id) {
      const formData: ModuleFormSchema = {
        name: data.name || '',
        description: data.description || '',
        code: data.code || '',
        icon_id: data.icon_id ?? null,
        active: data.active ?? true,
        parent_id: data.parent_id || null,
        allowed_roles: data.allowed_roles || ['OWNER', 'MEMBER', 'MEMBER_LIMITED', 'GUEST', 'DEVELOPER'],
      };
      
      resetRef.current(formData, {
        keepDefaultValues: false,
      });
    }
  }, [data, id]);

  // Log de erro para debug
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar módulo:', error);
      toast.error('Erro ao carregar dados do módulo: ' + (error.message || 'Erro desconhecido'));
    }
  }, [error]);

  return {
    isLoadingForm: isFetching || isLoading,
    module: data,
  };
}

function useCreateModule() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isPending: isLoadingCreate, mutateAsync } = useMutation({
    mutationFn: async (formData: ModuleFormSchema): Promise<Module> => {
      return modulesService.createModule(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast.success('Módulo criado com sucesso!');
      navigate('/modulos');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao criar módulo: ' + errorMessage);
    },
  });

  const handleCreate = (formData: ModuleFormSchema) => {
    return mutateAsync(formData);
  };

  return {
    isLoadingCreate,
    handleCreate,
  };
}

function useUpdateModule(id: string | null) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isPending: isLoadingUpdate, mutateAsync } = useMutation({
    mutationFn: async (formData: ModuleFormSchema): Promise<Module> => {
      if (!id) return Promise.reject('Nenhum identificador encontrado');
      return modulesService.updateModule(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['module'] });
      toast.success('Módulo atualizado com sucesso!');
      navigate('/modulos');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao atualizar módulo: ' + errorMessage);
    },
  });

  const handleUpdate = (formData: ModuleFormSchema) => {
    if (!id) return Promise.reject('Nenhum identificador encontrado');
    return mutateAsync(formData);
  };

  return {
    isLoadingUpdate,
    handleUpdate,
  };
}

function useDeleteModule() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isPending: isLoadingDelete, mutateAsync } = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return modulesService.deleteModule(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['module'] });
      toast.success('Módulo excluído com sucesso!');
      navigate('/modulos');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error('Erro ao excluir módulo: ' + errorMessage);
    },
  });

  const handleDelete = (id: string) => {
    return mutateAsync(id);
  };

  return {
    isLoadingDelete,
    handleDelete,
  };
}

export function useModules() {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      return modulesService.listModules();
    },
  });
}
