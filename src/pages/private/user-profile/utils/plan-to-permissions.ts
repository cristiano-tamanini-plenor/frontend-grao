import { PlanStructure } from '@/pages/private/company/services/plan-structure.service';
import { ModulePermission, CadastroPermission, Permission } from '../types';

/**
 * Converte a estrutura do plano em estrutura de permissões para perfis de usuário
 */
export function planToPermissionsStructure(
  planStructure: PlanStructure | null,
  existingPermissions?: ModulePermission[]
): ModulePermission[] {
  if (!planStructure) {
    return [];
  }

  // Criar um mapa das permissões existentes por módulo e cadastro
  const existingPermissionsMap = new Map<string, ModulePermission>();
  if (existingPermissions) {
    existingPermissions.forEach((module) => {
      existingPermissionsMap.set(module.id, module);
    });
  }

  return planStructure.modules.map((module) => {
    const existingModule = existingPermissionsMap.get(module.id);
    
    // Buscar permissões existentes por cadastro
    const existingCadastrosMap = new Map<string, CadastroPermission>();
    if (existingModule) {
      existingModule.cadastros.forEach((cadastro) => {
        existingCadastrosMap.set(cadastro.id, cadastro);
      });
    }

    const cadastros: CadastroPermission[] = [];

    // Adicionar cadastros que estão em grupos
    module.groups.forEach((group) => {
      group.items.forEach((item) => {
        const existing = existingCadastrosMap.get(item.id);
        
        // Se é página, só permite leitura. Se é CRUD, permite todas as ações
        const defaultPermissions: Permission = item.type === 'page'
          ? { read: true, create: false, edit: false, delete: false }
          : existing?.permissions || { read: false, create: false, edit: false, delete: false };

        cadastros.push({
          id: item.id,
          code: item.code,
          name: item.name,
          type: item.type === 'crud' ? 'crud' : 'page',
          route: item.route || '',
          permissions: existing?.permissions || defaultPermissions,
          groupId: group.id,
          groupName: group.name,
        });
      });
    });

    // Adicionar cadastros sem grupo (diretos no módulo)
    module.items.forEach((item) => {
      const existing = existingCadastrosMap.get(item.id);
      
      // Se é página, só permite leitura. Se é CRUD, permite todas as ações
      const defaultPermissions: Permission = item.type === 'page'
        ? { read: true, create: false, edit: false, delete: false }
        : existing?.permissions || { read: false, create: false, edit: false, delete: false };

      cadastros.push({
        id: item.id,
        code: item.code,
        name: item.name,
        type: item.type === 'crud' ? 'crud' : 'page',
        route: item.route || '',
        permissions: existing?.permissions || defaultPermissions,
      });
    });

    return {
      id: module.id,
      code: module.code,
      name: module.name,
      icon: module.icon,
      visible: existingModule?.visible ?? true, // Por padrão, módulo é visível
      cadastros: cadastros.sort((a, b) => a.name.localeCompare(b.name)),
    };
  });
}

