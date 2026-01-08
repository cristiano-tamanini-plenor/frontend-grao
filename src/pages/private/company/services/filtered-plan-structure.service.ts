import { PlanStructure, PlanModule, PlanGroup, PlanItem } from './plan-structure.service';
import { UserPermissions } from '@/pages/private/user-profile/services/user-profile-permissions.service';

/**
 * Filtra a estrutura do plano baseado nas permissões do usuário
 */
export function filterPlanStructureByPermissions(
  planStructure: PlanStructure | null,
  permissions: UserPermissions | undefined,
  isOwner: boolean
): PlanStructure | null {
  if (!planStructure) return null;
  if (isOwner) return planStructure; // OWNER vê tudo

  if (!permissions || permissions.modules.length === 0) {
    return { ...planStructure, modules: [] };
  }

  // Filtrar módulos visíveis
  const filteredModules: PlanModule[] = [];

  for (const module of planStructure.modules) {
    const modulePermission = permissions.modules.find(m => m.module_id === module.id);
    
    if (!modulePermission?.visible) continue; // Módulo não visível

    // Filtrar items do módulo baseado em permissões de cadastros
    const filteredItems: PlanItem[] = module.items.filter(item => {
      const cadastroPermission = permissions.cadastros.find(c => c.cadastro_id === item.id);
      return cadastroPermission?.can_read || false;
    });

    // Filtrar grupos e seus items
    const filteredGroups: PlanGroup[] = [];
    
    for (const group of module.groups) {
      const filteredGroupItems: PlanItem[] = group.items.filter(item => {
        const cadastroPermission = permissions.cadastros.find(c => c.cadastro_id === item.id);
        return cadastroPermission?.can_read || false;
      });

      // Só incluir grupo se tiver items visíveis
      if (filteredGroupItems.length > 0) {
        filteredGroups.push({
          ...group,
          items: filteredGroupItems,
        });
      }
    }

    // Só incluir módulo se tiver items ou grupos visíveis
    if (filteredItems.length > 0 || filteredGroups.length > 0) {
      filteredModules.push({
        ...module,
        items: filteredItems,
        groups: filteredGroups,
      });
    }
  }

  return {
    ...planStructure,
    modules: filteredModules,
  };
}
