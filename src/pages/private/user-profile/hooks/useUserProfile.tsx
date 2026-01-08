import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import type { ModulePermission } from '../types';

interface UserProfile {
  id: string;
  name: string;
  description?: string;
  company_id: string;
  plan_id: string;
  active: boolean;
  created_at: string;
}

interface SaveUserProfileData {
  id?: string;
  name: string;
  description?: string;
  plan_id: string;
  company_id: string;
  modulesPermissions: ModulePermission[];
  userIds: string[];
}

export function useUserProfiles() {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ['user-profiles-list', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];

      // TODO: Replace with API call: GET /companies/:companyId/user-profiles
      const response = await apiClient.get<any[]>(`/companies/${currentCompany.id}/user-profiles`);

      return (response || []).map((profile: any) => ({
        id: profile.id,
        name: profile.name,
        totalUsers: profile.totalUsers || 0,
      }));
    },
    enabled: !!currentCompany?.id,
  });
}

export function useUserProfile(profileId: string | null) {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ['user-profile', profileId],
    queryFn: async () => {
      if (!profileId) return null;

      // TODO: Replace with API call: GET /user-profiles/:profileId?includePermissions=true&includeUsers=true
      const response = await apiClient.get<{
        profile: any;
        modulePermissions: any[];
        cadastroPermissions: any[];
        userIds: string[];
      }>(`/user-profiles/${profileId}?includePermissions=true&includeUsers=true`);

      return {
        profile: response.profile,
        modulePermissions: response.modulePermissions || [],
        cadastroPermissions: response.cadastroPermissions || [],
        userIds: response.userIds || [],
      };
    },
    enabled: !!profileId,
  });
}

export function useSaveUserProfile() {
  const queryClient = useQueryClient();
  const { currentCompany } = useCompany();

  return useMutation({
    mutationFn: async (data: SaveUserProfileData) => {
      const isUpdate = !!data.id;

      // Prepare permissions data
      const modulePermissions = data.modulesPermissions.map((module) => ({
        module_id: module.id,
        visible: module.visible,
      }));

      const cadastroPermissions: any[] = [];
      data.modulesPermissions.forEach((module) => {
        module.cadastros.forEach((cadastro) => {
          cadastroPermissions.push({
            cadastro_id: cadastro.id,
            can_read: cadastro.permissions.read,
            can_create: cadastro.permissions.create,
            can_edit: cadastro.permissions.edit,
            can_delete: cadastro.permissions.delete,
          });
        });
      });

      // TODO: Replace with API call
      if (isUpdate) {
        // PUT /user-profiles/:id
        const response = await apiClient.put<{ id: string }>(`/user-profiles/${data.id}`, {
          name: data.name,
          description: data.description,
          modulePermissions,
          cadastroPermissions,
          userIds: data.userIds,
        });
        return { profileId: response.id, isUpdate: true };
      } else {
        // POST /user-profiles
        const response = await apiClient.post<{ id: string }>('/user-profiles', {
          name: data.name,
          description: data.description,
          company_id: data.company_id,
          plan_id: data.plan_id,
          modulePermissions,
          cadastroPermissions,
          userIds: data.userIds,
        });
        return { profileId: response.id, isUpdate: false };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles-list'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile-permissions'] });
      
      toast.success(
        result.isUpdate
          ? 'Perfil atualizado com sucesso!'
          : 'Perfil criado com sucesso!'
      );
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar perfil: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useDeleteUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      // TODO: Replace with API call: DELETE /user-profiles/:id
      await apiClient.delete(`/user-profiles/${profileId}`);
      return profileId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles-list'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Perfil excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir perfil: ' + (error.message || 'Erro desconhecido'));
    },
  });
}
