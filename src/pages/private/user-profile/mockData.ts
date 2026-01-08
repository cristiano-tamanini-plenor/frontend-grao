import { UserProfile, User, ModulePermission } from './types';

// Mock de módulos com permissões
export const mockModulesPermissions: ModulePermission[] = [
  {
    id: '1',
    code: 'DESENVOLVIMENTO',
    name: 'Desenvolvimento',
    icon: 'package',
    visible: true,
    cadastros: [
      {
        id: '1-1',
        code: 'MODULOS',
        name: 'Módulos',
        type: 'crud',
        route: '/modulos',
        permissions: {
          read: true,
          create: true,
          edit: true,
          delete: true,
        },
      },
      {
        id: '1-2',
        code: 'FEATURES',
        name: 'Features',
        type: 'crud',
        route: '/features',
        permissions: {
          read: true,
          create: true,
          edit: true,
          delete: true,
        },
      },
    ],
  },
  {
    id: '2',
    code: 'CADASTROS',
    name: 'Cadastros',
    icon: 'edit',
    visible: true,
    cadastros: [
      {
        id: '2-1',
        code: 'EMPRESAS',
        name: 'Empresas',
        type: 'crud',
        route: '/empresas',
        permissions: {
          read: true,
          create: true,
          edit: true,
          delete: true,
        },
      },
      {
        id: '2-2',
        code: 'USUARIOS',
        name: 'Usuários',
        type: 'crud',
        route: '/usuarios',
        permissions: {
          read: true,
          create: false,
          edit: false,
          delete: false,
        },
      },
      {
        id: '2-3',
        code: 'DASHBOARD',
        name: 'Dashboard',
        type: 'page',
        route: '/dashboard',
        permissions: {
          read: true,
          create: false,
          edit: false,
          delete: false,
        },
      },
    ],
  },
];

// Mock de perfis de usuário
export const mockProfiles: UserProfile[] = [
  {
    id: '1',
    name: 'Admin',
    totalUsers: 5,
    modulesPermissions: mockModulesPermissions,
  },
];

// Mock de usuários
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@example.com',
  },
];
