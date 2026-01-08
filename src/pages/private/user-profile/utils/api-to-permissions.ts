import { ModulePermission, CadastroPermission, Permission } from '../types';
import { PlanStructure } from '@/pages/private/company/services/plan-structure.service';

/**
 * Converte os dados da API (permissões salvas) para a estrutura ModulePermission
 * Mescla com a estrutura do plano para garantir que todos os módulos/cadastros estejam presentes
 */
export function apiToPermissionsStructure(
  planStructure: PlanStructure,
  modulePermissions: Array<{ module_id: string; visible: boolean }>,
  cadastroPermissions: Array<{
    cadastro_id: string;
    can_read: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  }>
): ModulePermission[] {
  // Criar mapas para busca rápida
  const modulePermissionsMap = new Map<string, boolean>();
  modulePermissions.forEach((mp) => {
    modulePermissionsMap.set(mp.module_id, mp.visible);
  });

  const cadastroPermissionsMap = new Map<string, Permission>();
  cadastroPermissions.forEach((cp) => {
    cadastroPermissionsMap.set(cp.cadastro_id, {
      read: cp.can_read,
      create: cp.can_create,
      edit: cp.can_edit,
      delete: cp.can_delete,
    });
  });

  return planStructure.modules.map((module) => {
    const visible = modulePermissionsMap.get(module.id) ?? true;

    const cadastros: CadastroPermission[] = [];

    // Adicionar cadastros que estão em grupos
    module.groups.forEach((group) => {
      group.items.forEach((item) => {
        const permissions = cadastroPermissionsMap.get(item.id) || {
          read: item.type === 'page' ? true : false,
          create: false,
          edit: false,
          delete: false,
        };

        cadastros.push({
          id: item.id,
          code: item.code,
          name: item.name,
          type: item.type === 'crud' ? 'crud' : 'page',
          route: item.route || '',
          permissions,
          groupId: group.id,
          groupName: group.name,
        });
      });
    });

    // Adicionar cadastros sem grupo
    module.items.forEach((item) => {
      const permissions = cadastroPermissionsMap.get(item.id) || {
        read: item.type === 'page' ? true : false,
        create: false,
        edit: false,
        delete: false,
      };

      cadastros.push({
        id: item.id,
        code: item.code,
        name: item.name,
        type: item.type === 'crud' ? 'crud' : 'page',
        route: item.route || '',
        permissions,
      });
    });

    return {
      id: module.id,
      code: module.code,
      name: module.name,
      icon: module.icon,
      visible,
      cadastros: cadastros.sort((a, b) => a.name.localeCompare(b.name)),
    };
  });
}

