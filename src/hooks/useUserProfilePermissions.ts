import { useQuery } from '@tanstack/react-query';
import { userProfilePermissionsService, UserPermissions } from '@/pages/private/user-profile/services/user-profile-permissions.service';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

/**
 * Hook para buscar e usar as permissões do usuário baseado em seus perfis
 * OWNER sempre tem acesso total, outros usuários seguem as permissões dos perfis
 */
export function useUserProfilePermissions() {
  const { user, role } = useAuth();
  const { currentCompany } = useCompany();

  const { data: permissions, isLoading } = useQuery<UserPermissions>({
    queryKey: ['user-profile-permissions', user?.id, currentCompany?.id],
    queryFn: () => {
      if (!user?.id || !currentCompany?.id) return Promise.resolve({ modules: [], cadastros: [] });
      return userProfilePermissionsService.getUserPermissions(user.id, currentCompany.id);
    },
    enabled: !!user?.id && !!currentCompany?.id && role !== 'OWNER', // OWNER não precisa de permissões
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Verifica se o usuário pode ver um módulo
   */
  const canViewModule = (moduleId: string): boolean => {
    if (role === 'OWNER') return true;
    if (!permissions) return false;
    
    const modulePermission = permissions.modules.find(m => m.module_id === moduleId);
    return modulePermission?.visible || false;
  };

  /**
   * Verifica se o usuário pode acessar um cadastro
   */
  const canAccessCadastro = (cadastroId: string, action: 'read' | 'create' | 'edit' | 'delete'): boolean => {
    if (role === 'OWNER') return true;
    if (!permissions) return false;
    
    const cadastroPermission = permissions.cadastros.find(c => c.cadastro_id === cadastroId);
    if (!cadastroPermission) return false;
    
    switch (action) {
      case 'read':
        return cadastroPermission.can_read;
      case 'create':
        return cadastroPermission.can_create;
      case 'edit':
        return cadastroPermission.can_edit;
      case 'delete':
        return cadastroPermission.can_delete;
      default:
        return false;
    }
  };

  /**
   * Retorna todas as permissões de um cadastro
   */
  const getCadastroPermissions = (cadastroId: string) => {
    if (role === 'OWNER') {
      return {
        can_read: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      };
    }
    
    if (!permissions) {
      return {
        can_read: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
      };
    }
    
    const cadastroPermission = permissions.cadastros.find(c => c.cadastro_id === cadastroId);
    return cadastroPermission || {
      can_read: false,
      can_create: false,
      can_edit: false,
      can_delete: false,
    };
  };

  return {
    permissions,
    isLoading,
    canViewModule,
    canAccessCadastro,
    getCadastroPermissions,
    isOwner: role === 'OWNER',
  };
}
