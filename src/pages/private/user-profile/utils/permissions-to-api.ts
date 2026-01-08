import { ModulePermission } from '../types';

/**
 * Converte a estrutura de permissões do frontend para o formato esperado pela API
 */
export function permissionsToApiData(
  modulesPermissions: ModulePermission[]
): {
  modulePermissions: Array<{ module_id: string; visible: boolean }>;
  cadastroPermissions: Array<{
    cadastro_id: string;
    can_read: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  }>;
} {
  const modulePermissions = modulesPermissions.map((module) => ({
    module_id: module.id,
    visible: module.visible,
  }));

  const cadastroPermissions: Array<{
    cadastro_id: string;
    can_read: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  }> = [];

  modulesPermissions.forEach((module) => {
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

  return {
    modulePermissions,
    cadastroPermissions,
  };
}

