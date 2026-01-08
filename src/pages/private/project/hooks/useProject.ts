import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsService } from '../services/projects.service';
import { projectFormSchema, type ProjectFormSchema } from '../schemas/project.schemas';
import type { Project } from '../types';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

const defaultValues: ProjectFormSchema = {
  nome: '',
  descricao_detalhada: '',
  data_inicial: '',
  data_final: '',
  status: true,
  centro_custo_id: '',
  logomarca: null,
  imagem_banner: null,
};

export function useProject(id?: string) {
  const { currentCompany } = useCompany();
  
  return useQuery({
    queryKey: ['project', currentCompany?.id, id],
    queryFn: async () => {
      if (!id || !currentCompany?.id) return null;
      return await projectsService.getProjectById(currentCompany.id, id);
    },
    enabled: !!id && !!currentCompany?.id,
  });
}

export function useFormProject(id: string | null) {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const formMethods = useForm<ProjectFormSchema>({
    defaultValues,
    resolver: zodResolver(projectFormSchema),
  });

  const { isLoadingForm } = useGetProject(id, formMethods);
  const { handleCreate, isLoadingCreate } = useCreateProject();
  const { handleUpdate, isLoadingUpdate } = useUpdateProject(id, formMethods);

  const onSubmit = async (formData: ProjectFormSchema) => {
    if (!currentCompany?.id) {
      toast.error('Nenhuma empresa selecionada');
      return;
    }

    if (id) {
      return handleUpdate(formData);
    }
    return handleCreate(formData);
  };

  const handleSubmit = formMethods.handleSubmit(onSubmit);

  useEffect(() => {
    if (!id && !isLoadingForm) {
      formMethods.reset(defaultValues);
    }
  }, [id, isLoadingForm]);

  return {
    formMethods,
    handleSubmit,
    isLoadingUpdate,
    isLoadingCreate,
    isLoadingForm,
  };
}

function useGetProject(
  id: string | null,
  formMethods: UseFormReturn<ProjectFormSchema>,
) {
  const { currentCompany } = useCompany();
  const resetRef = useRef(formMethods.reset);
  resetRef.current = formMethods.reset;

  const { data, isFetching, error, isLoading } = useQuery({
    queryKey: ['project', currentCompany?.id, id],
    queryFn: async () => {
      if (!id || !currentCompany?.id) return null;
      
      try {
        const project = await projectsService.getProjectById(currentCompany.id, id);
        return project;
      } catch (err) {
        console.error('Erro ao buscar projeto:', err);
        throw err;
      }
    },
    enabled: Boolean(id) && Boolean(currentCompany?.id),
  });

  useEffect(() => {
    if (data && id) {
      const formData: ProjectFormSchema = {
        nome: data.nome || '',
        descricao_detalhada: data.descricao_detalhada || '',
        data_inicial: data.data_inicial || '',
        data_final: data.data_final || '',
        status: data.status ?? true,
        centro_custo_id: data.centro_custo_id || '',
        logomarca: null, // Arquivos não são carregados do backend
        imagem_banner: null, // Arquivos não são carregados do backend
      };
      
      resetRef.current(formData, {
        keepDefaultValues: false,
      });
    }
  }, [data, id, formMethods]);

  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar projeto:', error);
      toast.error('Erro ao carregar dados do projeto: ' + (error.message || 'Erro desconhecido'));
    }
  }, [error]);

  return {
    isLoadingForm: isFetching || isLoading,
    project: data,
  };
}

function useCreateProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentCompany } = useCompany();

  const { isPending: isLoadingCreate, mutateAsync } = useMutation({
    mutationFn: async (formData: ProjectFormSchema) => {
      if (!currentCompany?.id) {
        throw new Error('Nenhuma empresa selecionada');
      }

      const result = await projectsService.createProject(currentCompany.id, {
        nome: formData.nome,
        descricao_detalhada: formData.descricao_detalhada || undefined,
        data_inicial: formData.data_inicial,
        data_final: formData.data_final || undefined,
        status: formData.status,
        centro_custo_id: formData.centro_custo_id || undefined,
        logomarca: formData.logomarca || undefined,
        imagem_banner: formData.imagem_banner || undefined,
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentCompany?.id] });
      toast.success('Projeto criado com sucesso!');
      navigate('/projetos');
    },
    onError: (error: any) => {
      const errorMessage = Array.isArray(error.message) 
        ? error.message.join('\n')
        : error.message || 'Erro desconhecido';
      toast.error('Erro ao criar projeto: ' + errorMessage);
    },
  });

  const handleCreate = (formData: ProjectFormSchema) => {
    return mutateAsync(formData);
  };

  return {
    isLoadingCreate,
    handleCreate,
  };
}

function useUpdateProject(
  id: string | null,
  formMethods: UseFormReturn<ProjectFormSchema>,
) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentCompany } = useCompany();

  const { isPending: isLoadingUpdate, mutateAsync } = useMutation({
    mutationFn: async (formData: ProjectFormSchema) => {
      if (!id || !currentCompany?.id) {
        return Promise.reject('Nenhum identificador encontrado');
      }
      
      const updates: any = {};
      if (formData.nome !== undefined) updates.nome = formData.nome;
      if (formData.descricao_detalhada !== undefined) updates.descricao_detalhada = formData.descricao_detalhada;
      if (formData.data_inicial !== undefined) updates.data_inicial = formData.data_inicial;
      if (formData.data_final !== undefined) updates.data_final = formData.data_final;
      if (formData.status !== undefined) updates.status = formData.status;
      if (formData.centro_custo_id !== undefined) updates.centro_custo_id = formData.centro_custo_id;
      if (formData.logomarca) updates.logomarca = formData.logomarca;
      if (formData.imagem_banner) updates.imagem_banner = formData.imagem_banner;

      const result = await projectsService.updateProject(currentCompany.id, id, updates);
      return { id, ...formData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentCompany?.id] });
      queryClient.invalidateQueries({ queryKey: ['project', currentCompany?.id] });
      toast.success('Projeto atualizado com sucesso!');
      formMethods.reset(undefined, { keepValues: true });
      navigate('/projetos');
    },
    onError: (error: any) => {
      const errorMessage = Array.isArray(error.message) 
        ? error.message.join('\n')
        : error.message || 'Erro desconhecido';
      toast.error('Erro ao atualizar projeto: ' + errorMessage);
    },
  });

  const handleUpdate = (formData: ProjectFormSchema) => {
    if (!id) return Promise.reject('Nenhum identificador encontrado');
    return mutateAsync(formData);
  };

  return {
    isLoadingUpdate,
    handleUpdate,
  };
}

export function useProjects() {
  const { currentCompany } = useCompany();
  
  return useQuery({
    queryKey: ['projects', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      return await projectsService.listProjects(currentCompany.id);
    },
    enabled: !!currentCompany?.id,
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { currentCompany } = useCompany();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!currentCompany?.id) {
        throw new Error('Nenhuma empresa selecionada');
      }
      await projectsService.deleteProject(currentCompany.id, id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentCompany?.id] });
      queryClient.invalidateQueries({ queryKey: ['project', currentCompany?.id] });
      toast.success('Projeto removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao remover projeto: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

