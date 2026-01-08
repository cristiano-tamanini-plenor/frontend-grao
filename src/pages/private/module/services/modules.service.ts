import { apiClient } from '@/lib/api/client';
import type { ModuleFormSchema } from '../schemas/module.schemas';

/**
 * Interface da resposta da API (NestJS)
 */
interface ApiModuleResponse {
  id: number;
  name: string;
  description: string | null;
  code: string;
  icon: string | null; // Deprecated
  iconId: number | null;
  iconEntity?: {
    id: number;
    name: string;
    variant: 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold';
    category: string | null;
    description: string | null;
    active: boolean;
    type: 'lib' | 'png';
    url: string | null;
    url_dark: string | null;
  } | null;
  route: string | null;
  order: number;
  active: boolean;
  parentId: number | null;
  allowedRoles: ('OWNER' | 'MEMBER' | 'MEMBER_LIMITED' | 'GUEST' | 'DEVELOPER')[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Interface para resposta com wrapper success/message/data
 */
interface ApiModuleWrappedResponse {
  success?: boolean;
  message?: string;
  data?: ApiModuleResponse;
}

/**
 * Interface do módulo no frontend
 */
export interface Module {
  id: string;
  name: string;
  description: string | null;
  code: string;
  icon_id: number | null;
  icon_entity?: {
    id: number;
    name: string;
    variant: 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold';
    category: string | null;
    description: string | null;
    active: boolean;
    type: 'lib' | 'png';
    url: string | null;
    url_dark: string | null;
  } | null;
  active: boolean;
  parent_id: string | null;
  allowed_roles: ('OWNER' | 'MEMBER' | 'MEMBER_LIMITED' | 'GUEST' | 'DEVELOPER')[];
  created_at: string;
  updated_at: string;
}

/**
 * DTO para criação de módulo
 */
export interface CreateModuleDto {
  name: string;
  description?: string | null;
  code: string;
  icon_id?: number | null;
  active: boolean;
  parentId?: number | null;
  allowedRoles: ('OWNER' | 'MEMBER' | 'MEMBER_LIMITED' | 'GUEST' | 'DEVELOPER')[];
}

/**
 * DTO para atualização de módulo
 */
export interface UpdateModuleDto {
  name?: string;
  description?: string | null;
  code?: string;
  icon_id?: number | null;
  active?: boolean;
  parentId?: number | null;
  allowedRoles?: ('OWNER' | 'MEMBER' | 'MEMBER_LIMITED' | 'GUEST' | 'DEVELOPER')[];
}

/**
 * Mapeia a resposta da API para o formato do frontend
 */
function mapApiModuleToModule(apiModule: ApiModuleResponse): Module {
  return {
    id: String(apiModule.id),
    name: apiModule.name,
    description: apiModule.description ?? null,
    code: apiModule.code,
    icon_id: apiModule.iconId ?? null,
    icon_entity: apiModule.iconEntity ?? null,
    active: apiModule.active ?? true,
    parent_id: apiModule.parentId ? String(apiModule.parentId) : null,
    allowed_roles: apiModule.allowedRoles ?? ['OWNER', 'MEMBER', 'MEMBER_LIMITED', 'GUEST', 'DEVELOPER'],
    created_at: apiModule.createdAt,
    updated_at: apiModule.updatedAt,
  };
}

/**
 * Converte o schema do formulário para o DTO da API
 */
function formSchemaToCreateDto(data: ModuleFormSchema): CreateModuleDto {
  return {
    name: data.name,
    description: data.description || null,
    code: data.code,
    icon_id: data.icon_id ?? null,
    active: data.active ?? true,
    parentId: data.parent_id ? Number(data.parent_id) : null,
    allowedRoles: data.allowed_roles ?? ['OWNER', 'MEMBER', 'MEMBER_LIMITED', 'GUEST', 'DEVELOPER'],
  };
}

/**
 * Converte o schema do formulário para o DTO de atualização
 */
function formSchemaToUpdateDto(data: ModuleFormSchema): UpdateModuleDto {
  return {
    name: data.name,
    description: data.description || null,
    code: data.code,
    icon_id: data.icon_id ?? null,
    active: data.active ?? true,
    parentId: data.parent_id ? Number(data.parent_id) : null,
    allowedRoles: data.allowed_roles ?? ['OWNER', 'MEMBER', 'MEMBER_LIMITED', 'GUEST', 'DEVELOPER'],
  };
}

export const modulesService = {
  /**
   * Lista todos os módulos
   * GET /modules
   */
  async listModules(): Promise<Module[]> {
    const response = await apiClient.get<ApiModuleResponse[] | ApiModuleWrappedResponse>('/modules');
    
    // Se vier com wrapper, extrai o array
    const apiModules = Array.isArray(response)
      ? response
      : 'data' in response && Array.isArray(response.data)
        ? response.data
        : [];
    
    return apiModules.map(mapApiModuleToModule);
  },

  /**
   * Busca módulo por ID
   * GET /modules/:id
   */
  async getModuleById(id: string): Promise<Module> {
    const response = await apiClient.get<ApiModuleResponse | ApiModuleWrappedResponse>(`/modules/${id}`);
    const moduleResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiModuleResponse;
    return mapApiModuleToModule(moduleResponse);
  },

  /**
   * Cria novo módulo
   * POST /modules
   */
  async createModule(data: ModuleFormSchema): Promise<Module> {
    const createDto = formSchemaToCreateDto(data);
    const response = await apiClient.post<ApiModuleResponse | ApiModuleWrappedResponse>(
      '/modules',
      createDto
    );
    const moduleResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiModuleResponse;
    return mapApiModuleToModule(moduleResponse);
  },

  /**
   * Atualiza módulo existente
   * PATCH /modules/:id
   */
  async updateModule(id: string, data: ModuleFormSchema): Promise<Module> {
    const updateDto = formSchemaToUpdateDto(data);
    
    // Remove campos undefined e mantém null quando necessário
    const cleanUpdates: Record<string, any> = {};
    Object.keys(updateDto).forEach(key => {
      const value = updateDto[key as keyof UpdateModuleDto];
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });

    const response = await apiClient.patch<ApiModuleResponse | ApiModuleWrappedResponse>(
      `/modules/${id}`,
      cleanUpdates
    );
    const moduleResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiModuleResponse;
    return mapApiModuleToModule(moduleResponse);
  },

  /**
   * Deleta módulo
   * DELETE /modules/:id
   */
  async deleteModule(id: string): Promise<void> {
    return apiClient.delete<void>(`/modules/${id}`);
  },
};

