import type { AppRole } from '@/modules/auth/types';

/**
 * Define permissões disponíveis no sistema
 * Este é um stub para futuras implementações de RBAC
 */
export type Permission = 
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.reset_password'
  | 'organizations.view'
  | 'organizations.create'
  | 'organizations.edit'
  | 'organizations.delete'
  | 'modules.view'
  | 'modules.create'
  | 'modules.edit'
  | 'modules.delete'
  | 'cadastros.view'
  | 'cadastros.create'
  | 'cadastros.edit'
  | 'cadastros.delete'
  | 'planos.view'
  | 'planos.create'
  | 'planos.edit'
  | 'planos.delete'
  | 'projects.view'
  | 'projects.create'
  | 'projects.edit'
  | 'projects.delete'
  | 'icons.view'
  | 'icons.create'
  | 'icons.edit'
  | 'icons.delete'
  | 'account-categories.view'
  | 'account-categories.create'
  | 'account-categories.edit'
  | 'account-categories.delete'
  | 'customers.view'
  | 'customers.create'
  | 'customers.edit'
  | 'customers.delete'
  | 'analysts.view'
  | 'analysts.create'
  | 'analysts.edit'
  | 'analysts.delete';

/**
 * Mapeamento de roles para permissões
 * Implementação futura: usar banco de dados
 */
const rolePermissions: Record<AppRole, Permission[]> = {
  OWNER: [
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.reset_password',
    'organizations.view',
    'organizations.create',
    'organizations.edit',
    'organizations.delete',
    'modules.view',
    'modules.create',
    'modules.edit',
    'modules.delete',
    'cadastros.view',
    'cadastros.create',
    'cadastros.edit',
    'cadastros.delete',
    'planos.view',
    'planos.create',
    'planos.edit',
    'planos.delete',
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'icons.view',
    'icons.create',
    'icons.edit',
    'icons.delete',
    'account-categories.view',
    'account-categories.create',
    'account-categories.edit',
    'account-categories.delete',
    'customers.view',
    'customers.create',
    'customers.edit',
    'customers.delete',
    'analysts.view',
    'analysts.create',
    'analysts.edit',
    'analysts.delete',
  ],
  MEMBER: [
    'users.view',
    'organizations.view',
    'organizations.create',
    'organizations.edit',
    'organizations.delete',
    'modules.view',
    'cadastros.view',
    'planos.view',
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'customers.view',
    'customers.create',
    'customers.edit',
    'customers.delete',
    'analysts.view',
    'analysts.create',
    'analysts.edit',
    'analysts.delete',
  ],
  MEMBER_LIMITED: [
    'organizations.view',
  ],
  GUEST: [
    'organizations.view',
  ],
  DEVELOPER: [
    'users.view',
    'users.create',
    'users.edit',
    'users.reset_password',
    'organizations.view',
    'organizations.create',
    'organizations.edit',
    'organizations.delete',
    'modules.view',
    'modules.create',
    'modules.edit',
    'modules.delete',
    'cadastros.view',
    'cadastros.create',
    'cadastros.edit',
    'cadastros.delete',
    'planos.view',
    'planos.create',
    'planos.edit',
    'planos.delete',
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'icons.view',
    'icons.create',
    'icons.edit',
    'icons.delete',
    'account-categories.view',
    'account-categories.create',
    'account-categories.edit',
    'account-categories.delete',
    'customers.view',
    'customers.create',
    'customers.edit',
    'customers.delete',
    'analysts.view',
    'analysts.create',
    'analysts.edit',
    'analysts.delete',
  ],
};

/**
 * Verifica se um role possui determinada permissão
 * Stub para futuras implementações mais complexas
 */
export function can(role: AppRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) || false;
}

/**
 * Retorna label em português para cada role
 */
export function getRoleLabel(role: AppRole): string {
  const labels: Record<AppRole, string> = {
    OWNER: 'Proprietário',
    MEMBER: 'Membro',
    MEMBER_LIMITED: 'Membro (Limitado)',
    GUEST: 'Convidado',
    DEVELOPER: 'Desenvolvedor',
  };
  return labels[role];
}

/**
 * Retorna todas as roles disponíveis com seus labels
 */
export function getAllRoles(): Array<{ value: AppRole; label: string }> {
  return [
    { value: 'OWNER', label: 'Proprietário' },
    { value: 'MEMBER', label: 'Membro' },
    { value: 'MEMBER_LIMITED', label: 'Membro (Limitado)' },
    { value: 'GUEST', label: 'Convidado' },
    { value: 'DEVELOPER', label: 'Desenvolvedor' },
  ];
}
