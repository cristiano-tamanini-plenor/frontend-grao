import { apiClient } from '@/lib/api/client';
import type { Analyst } from '../types';
import type { AnalystFormSchema } from '../schemas/analyst.schemas';

/**
 * Interface do usuário na resposta da API
 */
interface ApiAnalystUserResponse {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

/**
 * Interface da resposta da API (NestJS)
 */
interface ApiAnalystResponse {
  id: number;
  avatar: string | null;
  status: boolean;
  role: string;
  sector: string;
  start_date: string; // ISO date string
  end_date: string | null; // ISO date string
  description: string | null;
  user_id: number | null;
  marvee_cost_center_id: number | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  user?: ApiAnalystUserResponse | null;
}

/**
 * Interface para resposta com wrapper success/message/data
 */
interface ApiAnalystWrappedResponse {
  success?: boolean;
  message?: string;
  data?: ApiAnalystResponse;
}

/**
 * Mapeia a resposta da API para o formato do frontend
 */
function mapApiAnalystToAnalyst(apiAnalyst: ApiAnalystResponse): Analyst {
  return {
    id: String(apiAnalyst.id),
    avatar: apiAnalyst.avatar ?? null,
    status: apiAnalyst.status ?? true,
    role: apiAnalyst.role,
    sector: apiAnalyst.sector,
    start_date: apiAnalyst.start_date,
    end_date: apiAnalyst.end_date ?? null,
    description: apiAnalyst.description ?? null,
    user_id: apiAnalyst.user_id ?? null,
    marvee_cost_center_id: apiAnalyst.marvee_cost_center_id ?? null,
    created_at: apiAnalyst.createdAt,
    updated_at: apiAnalyst.updatedAt,
    user: apiAnalyst.user ? {
      id: apiAnalyst.user.id,
      name: apiAnalyst.user.name,
      email: apiAnalyst.user.email,
      avatar: apiAnalyst.user.avatar ?? null,
    } : null,
  };
}

/**
 * DTO para criação de analista
 */
export interface CreateAnalystDto {
  avatar?: string;
  status?: boolean;
  role: string;
  sector: string;
  start_date: string; // ISO date: "YYYY-MM-DD"
  end_date?: string | null; // ISO date: "YYYY-MM-DD"
  description?: string | null;
  user_id: number;
  marvee_cost_center_id?: number | null;
}

/**
 * DTO para atualização de analista
 */
export interface UpdateAnalystDto {
  avatar?: string;
  status?: boolean;
  role?: string;
  sector?: string;
  start_date?: string;
  end_date?: string | null;
  description?: string | null;
  user_id?: number;
  marvee_cost_center_id?: number | null;
}

/**
 * Converte o schema do formulário para o DTO da API
 */
function formSchemaToCreateDto(data: AnalystFormSchema): CreateAnalystDto {
  return {
    avatar: data.avatar || undefined,
    status: data.status ?? true,
    role: data.role,
    sector: data.sector,
    start_date: data.start_date,
    end_date: data.end_date || null,
    description: data.description || null,
    user_id: Number(data.user_id),
    marvee_cost_center_id: data.marvee_cost_center_id ?? null,
  };
}

/**
 * Converte o schema do formulário para o DTO de atualização
 */
function formSchemaToUpdateDto(data: AnalystFormSchema): UpdateAnalystDto {
  return {
    avatar: data.avatar || undefined,
    status: data.status ?? true,
    role: data.role,
    sector: data.sector,
    start_date: data.start_date,
    end_date: data.end_date || null,
    description: data.description || null,
    user_id: data.user_id ? Number(data.user_id) : undefined,
    marvee_cost_center_id: data.marvee_cost_center_id ?? null,
  };
}

export const analystsService = {
  /**
   * Lista todos os analistas
   * GET /analysts
   */
  async listAnalysts(): Promise<Analyst[]> {
    const apiAnalysts = await apiClient.get<ApiAnalystResponse[]>('/analysts');
    return apiAnalysts.map(mapApiAnalystToAnalyst);
  },

  /**
   * Busca analista por ID
   * GET /analysts/:id
   */
  async getAnalystById(id: string): Promise<Analyst> {
    const apiAnalyst = await apiClient.get<ApiAnalystResponse>(`/analysts/${id}`);
    return mapApiAnalystToAnalyst(apiAnalyst);
  },

  /**
   * Cria novo analista
   * POST /analysts
   */
  async createAnalyst(data: AnalystFormSchema): Promise<Analyst> {
    const createDto = formSchemaToCreateDto(data);
    const response = await apiClient.post<ApiAnalystResponse | ApiAnalystWrappedResponse>(
      '/analysts',
      createDto
    );
    const analystResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiAnalystResponse;
    return mapApiAnalystToAnalyst(analystResponse);
  },

  /**
   * Atualiza analista existente
   * PATCH /analysts/:id
   */
  async updateAnalyst(id: string, data: AnalystFormSchema): Promise<Analyst> {
    const updateDto = formSchemaToUpdateDto(data);
    
    // Remove campos undefined e mantém null quando necessário
    const cleanUpdates: Record<string, any> = {};
    Object.keys(updateDto).forEach(key => {
      const value = updateDto[key as keyof UpdateAnalystDto];
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });

    const response = await apiClient.patch<ApiAnalystResponse | ApiAnalystWrappedResponse>(
      `/analysts/${id}`,
      cleanUpdates
    );
    const analystResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiAnalystResponse;
    return mapApiAnalystToAnalyst(analystResponse);
  },

  /**
   * Deleta analista
   * DELETE /analysts/:id
   */
  async deleteAnalyst(id: string): Promise<void> {
    return apiClient.delete<void>(`/analysts/${id}`);
  },

  /**
   * Upload de avatar (Base64)
   * POST /analysts/:id/avatar
   */
  async uploadAvatar(id: string, avatar: string): Promise<Analyst> {
    const response = await apiClient.post<ApiAnalystResponse | ApiAnalystWrappedResponse>(
      `/analysts/${id}/avatar`,
      { avatar }
    );
    const analystResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiAnalystResponse;
    return mapApiAnalystToAnalyst(analystResponse);
  },
};

