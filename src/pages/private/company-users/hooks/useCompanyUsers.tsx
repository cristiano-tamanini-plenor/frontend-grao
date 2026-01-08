import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { companyUsersService, InviteUserData, CompanyUser } from '../services/company-users.service';
import { inviteUserSchema, InviteUserFormData } from '../schemas/invite-user.schema';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { userProfilesService } from '@/pages/private/user-profile/services/user-profiles.service';

const defaultValues: InviteUserFormData = {
  emails: '',
  role: 'MEMBER',
  user_profile_id: undefined,
};

export function useCompanyUsers() {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  const [inviteResult, setInviteResult] = useState<{
    temporaryPassword?: string;
    wasExistingUser: boolean;
    userName: string;
  } | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Query para listar usuários da empresa através da tabela user_companies
  const { data: users = [], isLoading, error: queryError } = useQuery<CompanyUser[]>({
    queryKey: ['company-users', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      try {
        return await companyUsersService.listCompanyUsers(currentCompany.id);
      } catch (error) {
        console.error('Erro ao listar usuários da empresa:', error);
        toast.error('Erro ao carregar usuários da empresa');
        return [];
      }
    },
    enabled: !!currentCompany?.id,
    retry: 1,
  });

  // Log de erros da query
  if (queryError) {
    console.error('Erro na query de usuários da empresa:', queryError);
  }

  // Query para buscar perfis de usuário da empresa
  const { data: userProfiles = [], isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['user-profiles-company-users', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      try {
        return await userProfilesService.getProfilesByCompany(currentCompany.id);
      } catch (error) {
        console.error('Erro ao buscar perfis de usuário:', error);
        return [];
      }
    },
    enabled: !!currentCompany?.id,
    staleTime: 30000, // Cache por 30 segundos
  });

  // Form para convite
  const formMethods = useForm<InviteUserFormData>({
    defaultValues,
    resolver: zodResolver(inviteUserSchema),
  });

  // Mutation para convidar usuários
  const { isPending: isInviting, mutateAsync } = useMutation({
    mutationFn: async (formData: InviteUserFormData) => {
      if (!currentCompany) {
        throw new Error('Nenhuma empresa selecionada');
      }

      // Separar emails por vírgula ou espaço
      const emailList = formData.emails
        .split(/[,;\s]+/)
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      if (emailList.length === 0) {
        throw new Error('Informe pelo menos um email');
      }

      // O backend não aceita role no convite (sempre cria como GUEST)
      // Mantemos o role no formulário apenas para UI, mas não enviamos ao backend
      return await companyUsersService.inviteUsersToCompany(
        currentCompany.id,
        emailList,
        'GUEST', // Backend sempre cria como GUEST
        formData.user_profile_id
      );
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-companies'] });
      
      const newUsers = results.filter((r) => !r.wasExistingUser);
      const existingUsers = results.filter((r) => r.wasExistingUser);

      if (results.length === 1) {
        const result = results[0];
        setInviteResult({
          temporaryPassword: result.temporaryPassword,
          wasExistingUser: result.wasExistingUser,
          userName: result.user.name,
        });
      } else {
        // Múltiplos usuários - mostrar resumo
        toast.success(`${results.length} usuários processados!`, {
          description: `${newUsers.length} novos usuários criados e ${existingUsers.length} usuários existentes associados.`,
          duration: 5000,
        });
        formMethods.reset(defaultValues);
        setIsInviteModalOpen(false);
      }
    },
    onError: (error: any) => {
      toast.error('Erro ao convidar usuários: ' + (error.message || 'Erro desconhecido'));
    },
  });

  // Mutation para remover usuário da empresa
  const removeUserMutation = useMutation({
    mutationFn: async (userId: string | number) => {
      if (!currentCompany?.id) {
        throw new Error('Nenhuma empresa selecionada');
      }
      await companyUsersService.removeUserFromCompany(currentCompany.id, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-companies'] });
      toast.success('Usuário removido da empresa com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao remover usuário: ' + (error.message || 'Erro desconhecido'));
    },
  });

  const handleInvite = async (formData: InviteUserFormData) => {
    await mutateAsync(formData);
  };

  const openInviteModal = () => {
    setIsInviteModalOpen(true);
    formMethods.reset(defaultValues);
  };

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
    setInviteResult(null);
  };

  return {
    users,
    isLoading,
    currentCompany,
    isInviteModalOpen,
    openInviteModal,
    closeInviteModal,
    formMethods,
    handleInvite,
    isInviting,
    inviteResult,
    userProfiles,
    isLoadingProfiles,
    removeUser: removeUserMutation.mutateAsync,
    isRemovingUser: removeUserMutation.isPending,
  };
}

