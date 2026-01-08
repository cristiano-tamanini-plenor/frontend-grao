import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersService } from '../services/users.service';
import { userFormSchema, type UserFormSchema } from '../schemas/user.schemas';
import type { UserWithRole } from '../types';

const defaultValues: UserFormSchema = {
  name: '',
  email: '',
  phone_e164: '',
  role: 'GUEST',
  avatar_url: '',
};

export function useUser(id?: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      if (!id) return null;
      
      // O usersService já retorna o usuário com role mapeado
      const user = await usersService.getUserById(id);
      
      return user as UserWithRole;
    },
    enabled: !!id,
  });
}

export function useFormUser(id: string | null) {
  const navigate = useNavigate();
  const formMethods = useForm<UserFormSchema>({
    defaultValues,
    resolver: zodResolver(userFormSchema),
  });

  const { isLoadingForm } = useGetUser(id, formMethods);
  const { handleCreate, isLoadingCreate } = useCreateUser();
  const { handleUpdate, isLoadingUpdate } = useUpdateUser(id, formMethods);

  const onSubmit = async (formData: UserFormSchema) => {
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
    isLoadingUpdate,
    isLoadingCreate,
    isLoadingForm,
  };
}

function useGetUser(
  id: string | null,
  formMethods: UseFormReturn<UserFormSchema>,
) {
  // Usa ref para manter a referência estável do reset
  const resetRef = useRef(formMethods.reset);
  resetRef.current = formMethods.reset;

  const { data, isFetching, error, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        // O usersService já retorna o usuário com role mapeado
        const user = await usersService.getUserById(id);
        
        return user as UserWithRole;
      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        throw err;
      }
    },
    enabled: Boolean(id),
  });

  // Popula o formulário quando os dados são carregados
  useEffect(() => {
    if (data && id) {
      const formData: UserFormSchema = {
        name: data.name || '',
        email: data.email || '',
        phone_e164: data.phone_e164 || '',
        role: data.role || 'GUEST',
        avatar_url: data.avatar_url ? String(data.avatar_url) : '',
      };
      
      resetRef.current(formData, {
        keepDefaultValues: false,
      });
      
      // Verifica se o reset funcionou
      const currentValues = formMethods.getValues();
      
    }
  }, [data, id, formMethods]);

  // Log de erro para debug
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar usuário:', error);
      toast.error('Erro ao carregar dados do usuário: ' + (error.message || 'Erro desconhecido'));
    }
  }, [error]);

  return {
    isLoadingForm: isFetching || isLoading,
    user: data,
  };
}

function useCreateUser() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isPending: isLoadingCreate, mutateAsync } = useMutation({
    mutationFn: async (formData: UserFormSchema) => {
      const result = await usersService.createUser({
        email: formData.email,
        name: formData.name,
        role: formData.role,
        phone_e164: formData.phone_e164 || undefined,
        avatar_url: formData.avatar_url || undefined,
      });

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso!', {
        description: `Senha temporária: ${result.temporaryPassword}`,
        duration: 10000,
      });
      navigate('/usuarios-app');
    },
    onError: (error: any) => {
      // Trata erros de validação do backend
      const errorMessage = Array.isArray(error.message) 
        ? error.message.join('\n')
        : error.message || 'Erro desconhecido';
      toast.error('Erro ao criar usuário: ' + errorMessage);
    },
  });

  const handleCreate = (formData: UserFormSchema) => {
    return mutateAsync(formData);
  };

  return {
    isLoadingCreate,
    handleCreate,
  };
}

function useUpdateUser(
  id: string | null,
  formMethods: UseFormReturn<UserFormSchema>,
) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isPending: isLoadingUpdate, mutateAsync } = useMutation({
    mutationFn: async (formData: UserFormSchema) => {
      if (!id) return Promise.reject('Nenhum identificador encontrado');
      
      // Atualiza dados básicos do usuário, incluindo role
      await usersService.updateUser(id, {
        name: formData.name,
        phone_e164: formData.phone_e164 || null,
        avatar_url: formData.avatar_url || null,
        role: formData.role,
        // is_active não é enviado aqui, use toggleUserStatus para alterar status
      });
      
      return { id, ...formData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Usuário atualizado com sucesso!');
      formMethods.reset(undefined, { keepValues: true });
      navigate('/usuarios-app');
    },
    onError: (error: any) => {
      // Trata erros de validação do backend
      const errorMessage = Array.isArray(error.message) 
        ? error.message.join('\n')
        : error.message || 'Erro desconhecido';
      toast.error('Erro ao atualizar usuário: ' + errorMessage);
    },
  });

  const handleUpdate = (formData: UserFormSchema) => {
    if (!id) return Promise.reject('Nenhum identificador encontrado');
    return mutateAsync(formData);
  };

  return {
    isLoadingUpdate,
    handleUpdate,
  };
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // O usersService.listUsers() já retorna usuários com role mapeado
      return await usersService.listUsers();
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Note: Delete is typically done via toggle status, not actual deletion
      await usersService.toggleUserStatus(id, false);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Usuário inativado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao inativar usuário: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // Atualizar o status do usuário
      // O backend deve lidar com a remoção de empresas quando inativar o usuário
      await usersService.toggleUserStatus(id, isActive);
      return { id, isActive };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      queryClient.invalidateQueries({ queryKey: ['user-companies'] });
      if (variables.isActive) {
        toast.success('Usuário ativado com sucesso!');
      } else {
        toast.success('Usuário inativado e removido de todas as empresas com sucesso!');
      }
    },
    onError: (error: any) => {
      toast.error('Erro ao alterar status: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: async (id: string) => {
      const password = await usersService.resetUserPassword(id);
      return password;
    },
    onError: (error: any) => {
      toast.error('Erro ao resetar senha: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

