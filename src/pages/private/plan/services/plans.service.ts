import { apiClient } from '@/lib/api/client';
import type { 
  PlanoFormSchema, 
  PlanoModuloSchema, 
  PlanoGrupoSchema, 
  PlanoItemSchema 
} from '../schemas/plano.schemas';

/**
 * Interface da resposta da API (NestJS) - Plano
 */
interface ApiPlanResponse {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Interface para resposta com wrapper success/message/data - Plano
 */
interface ApiPlanWrappedResponse {
  success?: boolean;
  message?: string;
  data?: ApiPlanResponse;
}

/**
 * Interface para resposta com wrapper success/message/data - Plano Módulo
 */
interface ApiPlanModuleWrappedResponse {
  success?: boolean;
  message?: string;
  data?: ApiPlanModuleResponse;
}

/**
 * Interface para resposta com wrapper success/message/data - Plano Grupo
 */
interface ApiPlanGroupWrappedResponse {
  success?: boolean;
  message?: string;
  data?: ApiPlanGroupResponse;
}

/**
 * Interface para resposta com wrapper success/message/data - Plano Item
 */
interface ApiPlanItemWrappedResponse {
  success?: boolean;
  message?: string;
  data?: ApiPlanItemResponse;
}

/**
 * Interface do plano no frontend
 */
export interface Plano {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface da resposta da API - Plano Módulo
 */
interface ApiPlanModuleResponse {
  id: number;
  planId: number;
  moduleId: number;
  orderIndex: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  module?: {
    id: number;
    name: string;
    description?: string | null;
  };
}

/**
 * Interface do plano módulo no frontend
 */
export interface PlanoModulo {
  id: string;
  plano_id: string;
  module_id: string;
  order_index: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  modules?: {
    id: string;
    name: string;
    description?: string | null;
  };
}

/**
 * Interface da resposta da API - Plano Grupo
 */
interface ApiPlanGroupResponse {
  id: number;
  planModuleId: number;
  name: string;
  description: string | null;
  icon: string | null;
  orderIndex: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface do plano grupo no frontend
 */
export interface PlanoGrupo {
  id: string;
  plano_modulo_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface da resposta da API - Plano Item
 */
interface ApiPlanItemResponse {
  id: number;
  planModuleId: number;
  groupId: number | null;
  cadastroId: number;
  orderIndex: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  cadastro?: {
    id: number;
    name: string;
    route: string | null;
    code: string;
  };
}

/**
 * Interface do plano item no frontend
 */
export interface PlanoItem {
  id: string;
  plano_modulo_id: string;
  grupo_id: string | null;
  cadastro_id: string;
  order_index: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  cadastros?: {
    id: string;
    name: string;
    route: string | null;
    code: string;
  };
}

/**
 * DTO para criação de plano
 */
export interface CreatePlanDto {
  name: string;
  description?: string | null;
  active?: boolean;
}

/**
 * DTO para atualização de plano
 */
export interface UpdatePlanDto {
  name?: string;
  description?: string | null;
  active?: boolean;
}

/**
 * DTO para adicionar módulo ao plano
 */
export interface AddModuleToPlanDto {
  moduleId: string;
  orderIndex?: number;
  active?: boolean;
}

/**
 * DTO para criar grupo no módulo
 */
export interface CreatePlanGroupDto {
  name: string;
  description?: string | null;
  icon?: string | null;
  orderIndex?: number;
  active?: boolean;
}

/**
 * DTO para adicionar item ao módulo
 */
export interface AddItemToPlanModuleDto {
  cadastroId: string;
  groupId?: string | null;
  orderIndex?: number;
  active?: boolean;
}

/**
 * Mapeia a resposta da API para o formato do frontend - Plano
 */
function mapApiPlanToPlano(apiPlan: ApiPlanResponse): Plano {
  return {
    id: String(apiPlan.id),
    name: apiPlan.name,
    description: apiPlan.description ?? null,
    active: apiPlan.active ?? true,
    created_at: apiPlan.createdAt,
    updated_at: apiPlan.updatedAt,
  };
}

/**
 * Mapeia a resposta da API para o formato do frontend - Plano Módulo
 */
function mapApiPlanModuleToPlanoModulo(apiPlanModule: ApiPlanModuleResponse): PlanoModulo {
  return {
    id: String(apiPlanModule.id),
    plano_id: String(apiPlanModule.planId),
    module_id: String(apiPlanModule.moduleId),
    order_index: apiPlanModule.orderIndex ?? 0,
    active: apiPlanModule.active ?? true,
    created_at: apiPlanModule.createdAt,
    updated_at: apiPlanModule.updatedAt,
    modules: apiPlanModule.module ? {
      id: String(apiPlanModule.module.id),
      name: apiPlanModule.module.name,
      description: apiPlanModule.module.description ?? null,
    } : undefined,
  };
}

/**
 * Mapeia a resposta da API para o formato do frontend - Plano Grupo
 */
function mapApiPlanGroupToPlanoGrupo(apiPlanGroup: ApiPlanGroupResponse): PlanoGrupo {
  return {
    id: String(apiPlanGroup.id),
    plano_modulo_id: String(apiPlanGroup.planModuleId),
    name: apiPlanGroup.name,
    description: apiPlanGroup.description ?? null,
    icon: apiPlanGroup.icon ?? null,
    order_index: apiPlanGroup.orderIndex ?? 0,
    active: apiPlanGroup.active ?? true,
    created_at: apiPlanGroup.createdAt,
    updated_at: apiPlanGroup.updatedAt,
  };
}

/**
 * Mapeia a resposta da API para o formato do frontend - Plano Item
 */
function mapApiPlanItemToPlanoItem(apiPlanItem: ApiPlanItemResponse): PlanoItem {
  return {
    id: String(apiPlanItem.id),
    plano_modulo_id: String(apiPlanItem.planModuleId),
    grupo_id: apiPlanItem.groupId ? String(apiPlanItem.groupId) : null,
    cadastro_id: String(apiPlanItem.cadastroId),
    order_index: apiPlanItem.orderIndex ?? 0,
    active: apiPlanItem.active ?? true,
    created_at: apiPlanItem.createdAt,
    updated_at: apiPlanItem.updatedAt,
    cadastros: apiPlanItem.cadastro ? {
      id: String(apiPlanItem.cadastro.id),
      name: apiPlanItem.cadastro.name,
      route: apiPlanItem.cadastro.route ?? null,
      code: apiPlanItem.cadastro.code,
    } : undefined,
  };
}

/**
 * Converte o schema do formulário para o DTO da API - Plano
 */
function formSchemaToCreatePlanDto(data: PlanoFormSchema): CreatePlanDto {
  return {
    name: data.name,
    description: data.description || null,
    active: data.active ?? true,
  };
}

/**
 * Converte o schema do formulário para o DTO de atualização - Plano
 */
function formSchemaToUpdatePlanDto(data: PlanoFormSchema): UpdatePlanDto {
  return {
    name: data.name,
    description: data.description || null,
    active: data.active ?? true,
  };
}

export const plansService = {
  /**
   * Lista todos os planos
   * GET /plans
   */
  async listPlans(): Promise<Plano[]> {
    const apiPlans = await apiClient.get<ApiPlanResponse[]>('/plans');
    return apiPlans.map(mapApiPlanToPlano);
  },

  /**
   * Busca plano por ID
   * GET /plans/:id
   */
  async getPlanById(id: string): Promise<Plano> {
    const apiPlan = await apiClient.get<ApiPlanResponse>(`/plans/${id}`);
    return mapApiPlanToPlano(apiPlan);
  },

  /**
   * Cria novo plano
   * POST /plans
   */
  async createPlan(data: PlanoFormSchema): Promise<Plano> {
    const createDto = formSchemaToCreatePlanDto(data);
    const response = await apiClient.post<ApiPlanResponse | ApiPlanWrappedResponse>(
      '/plans',
      createDto
    );
    const planResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiPlanResponse;
    return mapApiPlanToPlano(planResponse);
  },

  /**
   * Atualiza plano existente
   * PATCH /plans/:id
   */
  async updatePlan(id: string, data: PlanoFormSchema): Promise<Plano> {
    const updateDto = formSchemaToUpdatePlanDto(data);
    
    const cleanUpdates: Record<string, any> = {};
    Object.keys(updateDto).forEach(key => {
      const value = updateDto[key as keyof UpdatePlanDto];
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });

    const response = await apiClient.patch<ApiPlanResponse | ApiPlanWrappedResponse>(
      `/plans/${id}`,
      cleanUpdates
    );
    const planResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiPlanResponse;
    return mapApiPlanToPlano(planResponse);
  },

  /**
   * Deleta plano
   * DELETE /plans/:id
   */
  async deletePlan(id: string): Promise<void> {
    return apiClient.delete<void>(`/plans/${id}`);
  },

  /**
   * Lista módulos de um plano
   * GET /plans/:planId/modules
   */
  async listPlanModules(planId: string): Promise<PlanoModulo[]> {
    const apiModules = await apiClient.get<ApiPlanModuleResponse[]>(`/plans/${planId}/modules`);
    return apiModules.map(mapApiPlanModuleToPlanoModulo);
  },

  /**
   * Adiciona módulo ao plano
   * POST /plans/:planId/modules
   */
  async addModuleToPlan(planId: string, data: PlanoModuloSchema): Promise<PlanoModulo> {
    const addDto: AddModuleToPlanDto = {
      moduleId: data.module_id,
      orderIndex: data.order_index ?? 0,
      active: data.active ?? true,
    };

    const response = await apiClient.post<ApiPlanModuleResponse | ApiPlanModuleWrappedResponse>(
      `/plans/${planId}/modules`,
      addDto
    );
    const moduleResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiPlanModuleResponse;
    return mapApiPlanModuleToPlanoModulo(moduleResponse);
  },

  /**
   * Remove módulo do plano
   * DELETE /plans/:planId/modules/:id
   */
  async removeModuleFromPlan(planId: string, moduleId: string): Promise<void> {
    return apiClient.delete<void>(`/plans/${planId}/modules/${moduleId}`);
  },

  /**
   * Lista grupos de um módulo
   * GET /plans/modules/:planModuleId/groups
   */
  async listPlanGroups(planModuleId: string): Promise<PlanoGrupo[]> {
    const apiGroups = await apiClient.get<ApiPlanGroupResponse[]>(
      `/plans/modules/${planModuleId}/groups`
    );
    return apiGroups.map(mapApiPlanGroupToPlanoGrupo);
  },

  /**
   * Cria grupo no módulo
   * POST /plans/modules/:planModuleId/groups
   */
  async createPlanGroup(planModuleId: string, data: PlanoGrupoSchema & { iconName?: string | null }): Promise<PlanoGrupo> {
    const createDto: CreatePlanGroupDto = {
      name: data.name,
      description: data.description || null,
      icon: data.iconName || null, // Usa iconName se fornecido (conversão de icon_id para nome)
      orderIndex: data.order_index ?? 0,
      active: data.active ?? true,
    };

    const response = await apiClient.post<ApiPlanGroupResponse | ApiPlanGroupWrappedResponse>(
      `/plans/modules/${planModuleId}/groups`,
      createDto
    );
    const groupResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiPlanGroupResponse;
    return mapApiPlanGroupToPlanoGrupo(groupResponse);
  },

  /**
   * Remove grupo
   * DELETE /plans/modules/:planModuleId/groups/:id
   */
  async deletePlanGroup(planModuleId: string, groupId: string): Promise<void> {
    return apiClient.delete<void>(`/plans/modules/${planModuleId}/groups/${groupId}`);
  },

  /**
   * Lista itens de um módulo
   * GET /plans/modules/:planModuleId/items
   */
  async listPlanItems(planModuleId: string): Promise<PlanoItem[]> {
    const apiItems = await apiClient.get<ApiPlanItemResponse[]>(
      `/plans/modules/${planModuleId}/items`
    );
    return apiItems.map(mapApiPlanItemToPlanoItem);
  },

  /**
   * Adiciona item (cadastro) ao módulo
   * POST /plans/modules/:planModuleId/items
   */
  async addItemToPlanModule(planModuleId: string, data: PlanoItemSchema): Promise<PlanoItem> {
    const addDto: AddItemToPlanModuleDto = {
      cadastroId: data.cadastro_id,
      groupId: data.grupo_id || null,
      orderIndex: data.order_index ?? 0,
      active: data.active ?? true,
    };

    const response = await apiClient.post<ApiPlanItemResponse | ApiPlanItemWrappedResponse>(
      `/plans/modules/${planModuleId}/items`,
      addDto
    );
    const itemResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiPlanItemResponse;
    return mapApiPlanItemToPlanoItem(itemResponse);
  },

  /**
   * Remove item do módulo
   * DELETE /plans/modules/:planModuleId/items/:id
   */
  async deletePlanItem(planModuleId: string, itemId: string): Promise<void> {
    return apiClient.delete<void>(`/plans/modules/${planModuleId}/items/${itemId}`);
  },
};

