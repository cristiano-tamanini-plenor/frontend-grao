import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Permission } from '@/lib/rbac/permissions';
import { useUserProfilePermissions } from './useUserProfilePermissions';

/**
 * Hook para verificar permissões do usuário
 * Combina permissões de role (RBAC) com permissões de perfil de usuário
 * 
 * @example
 * const { can, canCreate, canEdit } = usePermission('users');
 * 
 * if (canCreate) {
 *   // Show create button
 * }
 */
export function usePermission(resource: string, cadastroId?: string) {
  const { can, role } = useAuth();
  const { canAccessCadastro, getCadastroPermissions, isOwner } = useUserProfilePermissions();

  // Se tem cadastroId, usa as permissões do perfil
  if (cadastroId) {
    return {
      can: (action: string) => {
        // OWNER sempre pode
        if (isOwner) return true;
        
        // Verifica permissão de perfil
        const profileAction = action as 'read' | 'create' | 'edit' | 'delete';
        return canAccessCadastro(cadastroId, profileAction);
      },
      canView: isOwner || canAccessCadastro(cadastroId, 'read'),
      canCreate: isOwner || canAccessCadastro(cadastroId, 'create'),
      canEdit: isOwner || canAccessCadastro(cadastroId, 'edit'),
      canDelete: isOwner || canAccessCadastro(cadastroId, 'delete'),
      permissions: getCadastroPermissions(cadastroId),
      role,
    };
  }

  // Fallback para permissões de role (RBAC)
  return {
    can: (action: string) => can(`${resource}.${action}` as Permission),
    canView: can(`${resource}.view` as Permission),
    canCreate: can(`${resource}.create` as Permission),
    canEdit: can(`${resource}.edit` as Permission),
    canDelete: can(`${resource}.delete` as Permission),
    role,
  };
}

