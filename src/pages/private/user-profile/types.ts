export type PermissionAction = 'read' | 'create' | 'edit' | 'delete';

export interface Permission {
  read: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

// Item de cadastro dentro de um módulo
export interface CadastroPermission {
  id: string;
  code: string;
  name: string;
  type: 'crud' | 'page';
  route: string;
  permissions: Permission;
  // Para itens dentro de grupos
  groupId?: string;
  groupName?: string;
}

// Módulo com seus cadastros
export interface ModulePermission {
  id: string;
  code: string;
  name: string;
  icon?: string;
  visible: boolean; // Permissão de visibilidade do módulo
  cadastros: CadastroPermission[];
}

// Perfil de usuário
export interface UserProfile {
  id: string;
  name: string;
  totalUsers: number;
  modulesPermissions: ModulePermission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

// Estrutura antiga (manter para compatibilidade temporária)
export interface PermissionItem {
  id: string;
  name: string;
  permissions: Permission;
}

export interface PermissionCategory {
  id: string;
  name: string;
  items: PermissionItem[];
}
