import { PlanStructure } from '../services/plan-structure.service';
import { SidebarConfig } from '@/components/layout/Template/Sidebar/types';

/**
 * Converte a estrutura do plano em uma configuração compatível com o Sidebar
 */
export function planToSidebarConfig(planStructure: PlanStructure | null): SidebarConfig {
  if (!planStructure) {
    return [];
  }

  return planStructure.modules.map((module) => ({
    id: parseInt(module.id.substring(0, 8), 16), // Gera um ID numérico único a partir do UUID
    type: 'module' as const,
    name: module.code,
    description: module.name,
    icon: module.icon || 'Package',
    allowed_roles: module.allowed_roles || ['OWNER', 'MEMBER', 'MEMBER_LIMITED', 'GUEST'],
    features: [
      // Items sem grupo (diretos no módulo)
      ...module.items.map((item) => ({
        name: item.code,
        description: item.name,
        icon: item.icon || 'FileText',
        type: (item.type as 'page' | 'crud' | 'group') || 'page',
        route: item.route || null,
      })),
      // Grupos
      ...module.groups.map((group) => ({
        name: group.name,
        description: group.name,
        icon: group.icon || 'Folder',
        type: 'group' as const,
        route: null,
        features: group.items.map((item) => ({
          name: item.code,
          description: item.name,
          icon: item.icon || 'FileText',
          type: (item.type as 'page' | 'crud' | 'group') || 'page',
          route: item.route || null,
        })),
      })),
    ],
  }));
}
