import { apiClient } from '@/lib/api/client';
import type { CadastroFormSchema } from '../schemas/cadastro.schemas';

/**
 * Interface da resposta da API (NestJS)
 */
interface ApiCadastroResponse {
  id: number;
  name: string;
  description: string | null;
  code: string;
  type: 'page' | 'crud';
  icon: string | null; // Deprecated
  iconId: number | null;
  iconEntity?: {
    id: number;
    name: string;
    variant: 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold';
    category: string | null;
    description: string | null;
    active: boolean;
  } | null;
  route: string | null;
  order: number;
  active: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Interface para resposta com wrapper success/message/data
 */
interface ApiCadastroWrappedResponse {
  success?: boolean;
  message?: string;
  data?: ApiCadastroResponse;
}

/**
 * Interface do cadastro no frontend
 */
export interface Cadastro {
  id: string;
  name: string;
  description: string | null;
  code: string;
  type: 'page' | 'crud';
  icon_id: number | null;
  icon_entity?: {
    id: number;
    name: string;
    variant: 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold';
    category: string | null;
    description: string | null;
    active: boolean;
  } | null;
  route: string | null;
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * DTO para criação de cadastro
 */
export interface CreateCadastroDto {
  name: string;
  description?: string | null;
  code: string;
  type: 'page' | 'crud';
  icon_id?: number | null;
  route?: string | null;
  active?: boolean;
}

/**
 * DTO para atualização de cadastro
 */
export interface UpdateCadastroDto {
  name?: string;
  description?: string | null;
  code?: string;
  type?: 'page' | 'crud';
  icon_id?: number | null;
  route?: string | null;
  active?: boolean;
}

/**
 * Mapeia a resposta da API para o formato do frontend
 */
function mapApiCadastroToCadastro(apiCadastro: ApiCadastroResponse): Cadastro {
  return {
    id: String(apiCadastro.id),
    name: apiCadastro.name,
    description: apiCadastro.description ?? null,
    code: apiCadastro.code,
    type: apiCadastro.type,
    icon_id: apiCadastro.iconId ?? null,
    icon_entity: apiCadastro.iconEntity ?? null,
    route: apiCadastro.route ?? null,
    order: apiCadastro.order ?? 0,
    active: apiCadastro.active ?? true,
    created_at: apiCadastro.createdAt,
    updated_at: apiCadastro.updatedAt,
  };
}

/**
 * Converte o schema do formulário para o DTO da API
 */
function formSchemaToCreateDto(data: CadastroFormSchema): CreateCadastroDto {
  return {
    name: data.name,
    description: data.description || null,
    code: data.code,
    type: data.type,
    icon_id: data.icon_id ?? null,
    route: data.route || null,
    active: data.active ?? true,
  };
}

/**
 * Converte o schema do formulário para o DTO de atualização
 */
function formSchemaToUpdateDto(data: CadastroFormSchema): UpdateCadastroDto {
  return {
    name: data.name,
    description: data.description || null,
    code: data.code,
    type: data.type,
    icon_id: data.icon_id ?? null,
    route: data.route || null,
    active: data.active ?? true,
  };
}

export const cadastrosService = {
  /**
   * Lista todos os cadastros
   * GET /cadastros
   */
  async listCadastros(): Promise<Cadastro[]> {
    const apiCadastros = await apiClient.get<ApiCadastroResponse[]>('/cadastros');
    return apiCadastros.map(mapApiCadastroToCadastro);
  },

  /**
   * Busca cadastro por ID
   * GET /cadastros/:id
   */
  async getCadastroById(id: string): Promise<Cadastro> {
    const apiCadastro = await apiClient.get<ApiCadastroResponse>(`/cadastros/${id}`);
    return mapApiCadastroToCadastro(apiCadastro);
  },

  /**
   * Cria novo cadastro
   * POST /cadastros
   */
  async createCadastro(data: CadastroFormSchema): Promise<Cadastro> {
    const createDto = formSchemaToCreateDto(data);
    const response = await apiClient.post<ApiCadastroResponse | ApiCadastroWrappedResponse>(
      '/cadastros',
      createDto
    );
    const cadastroResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiCadastroResponse;
    return mapApiCadastroToCadastro(cadastroResponse);
  },

  /**
   * Atualiza cadastro existente
   * PATCH /cadastros/:id
   */
  async updateCadastro(id: string, data: CadastroFormSchema): Promise<Cadastro> {
    const updateDto = formSchemaToUpdateDto(data);
    
    // Remove campos undefined e mantém null quando necessário
    const cleanUpdates: Record<string, any> = {};
    Object.keys(updateDto).forEach(key => {
      const value = updateDto[key as keyof UpdateCadastroDto];
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });

    const response = await apiClient.patch<ApiCadastroResponse | ApiCadastroWrappedResponse>(
      `/cadastros/${id}`,
      cleanUpdates
    );
    const cadastroResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiCadastroResponse;
    return mapApiCadastroToCadastro(cadastroResponse);
  },

  /**
   * Deleta cadastro
   * DELETE /cadastros/:id
   */
  async deleteCadastro(id: string): Promise<void> {
    return apiClient.delete<void>(`/cadastros/${id}`);
  },
};

