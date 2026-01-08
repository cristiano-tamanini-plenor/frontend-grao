// TODO: Migrar para endpoint do backend NestJS quando estiver disponível
// Por enquanto, este serviço está desabilitado - a sidebar agora vem do endpoint /companies/:id/sidebar

export interface PlanItem {
  id: string;
  name: string;
  description?: string;
  code: string;
  icon?: string;
  route?: string;
  type: string;
  order: number;
}

export interface PlanGroup {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  items: PlanItem[];
}

export interface PlanModule {
  id: string;
  name: string;
  description?: string;
  code: string;
  icon?: string;
  route?: string;
  order: number;
  allowed_roles?: ('OWNER' | 'MEMBER' | 'MEMBER_LIMITED' | 'GUEST')[];
  groups: PlanGroup[];
  items: PlanItem[]; // items sem grupo
}

export interface PlanStructure {
  planId: string;
  planName: string;
  modules: PlanModule[];
}

export const planStructureService = {
  /**
   * Busca a estrutura do plano de uma empresa
   * TODO: Migrar para endpoint do backend NestJS quando estiver disponível
   * Por enquanto, retorna null - a sidebar agora vem do endpoint /companies/:id/sidebar
   */
  async getPlanStructureByCompany(companyId: string): Promise<PlanStructure | null> {
    // Este serviço está desabilitado - a sidebar agora é carregada via endpoint /companies/:id/sidebar
    // Mantido apenas para compatibilidade com código legado
    return null;
  },
};
