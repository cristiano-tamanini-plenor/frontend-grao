import { apiClient } from '@/lib/api/client';
import type { IconFormSchema } from '../schemas/icon.schemas';

/**
 * Interface da resposta da API (NestJS)
 */
interface ApiIconResponse {
  id: number;
  name: string;
  variant: 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold';
  category: string | null;
  description: string | null;
  active: boolean;
  type: 'lib' | 'png';
  url: string | null;
  url_dark: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Interface para resposta com wrapper success/message/data
 */
interface ApiIconWrappedResponse {
  success?: boolean;
  message?: string;
  data?: ApiIconResponse;
}

/**
 * Interface do ícone no frontend
 */
export interface Icon {
  id: string;
  name: string;
  variant: 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold';
  category: string | null;
  description: string | null;
  active: boolean;
  type: 'lib' | 'png';
  url: string | null;
  url_dark: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * DTO para criação de ícone
 */
export interface CreateIconDto {
  name: string;
  variant?: 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold';
  category?: string | null;
  description?: string | null;
  active?: boolean;
  type?: 'lib' | 'png';
}

/**
 * DTO para atualização de ícone
 */
export interface UpdateIconDto {
  name?: string;
  variant?: 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold';
  category?: string | null;
  description?: string | null;
  active?: boolean;
  type?: 'lib' | 'png';
}

/**
 * Mapeia a resposta da API para o formato do frontend
 */
function mapApiIconToIcon(apiIcon: ApiIconResponse): Icon {
  return {
    id: String(apiIcon.id),
    name: apiIcon.name,
    variant: apiIcon.variant,
    category: apiIcon.category ?? null,
    description: apiIcon.description ?? null,
    active: apiIcon.active ?? true,
    type: apiIcon.type ?? 'lib',
    url: apiIcon.url ?? null,
    url_dark: apiIcon.url_dark ?? null,
    created_at: apiIcon.createdAt,
    updated_at: apiIcon.updatedAt,
  };
}

/**
 * Converte o schema do formulário para o DTO da API (apenas para tipo lib)
 */
function formSchemaToCreateDto(data: IconFormSchema): CreateIconDto {
  return {
    name: data.name,
    variant: data.variant || 'Linear',
    category: data.category || null,
    description: data.description || null,
    active: data.active ?? true,
    type: data.type || 'lib',
  };
}

/**
 * Converte o schema do formulário para o DTO de atualização
 */
function formSchemaToUpdateDto(data: IconFormSchema): UpdateIconDto {
  return {
    name: data.name,
    variant: data.variant || 'Linear',
    category: data.category || null,
    description: data.description || null,
    active: data.active ?? true,
    type: data.type || 'lib',
  };
}

export interface IconFilters {
  name?: string;
  type?: string;
  status?: string;
}

export const iconsService = {
  /**
   * Lista todos os ícones
   * GET /icons
   */
  async listIcons(filters?: IconFilters): Promise<Icon[]> {
    const queryParams = new URLSearchParams();
    
    if (filters?.name) {
      queryParams.append('name', filters.name);
    }
    if (filters?.type) {
      queryParams.append('type', filters.type);
    }
    if (filters?.status !== undefined && filters.status !== '') {
      queryParams.append('status', filters.status);
    }
    
    const queryString = queryParams.toString();
    const url = `/icons${queryString ? `?${queryString}` : ''}`;
    const apiIcons = await apiClient.get<ApiIconResponse[]>(url);
    return apiIcons.map(mapApiIconToIcon);
  },

  /**
   * Busca ícone por ID
   * GET /icons/:id
   */
  async getIconById(id: string): Promise<Icon> {
    const apiIcon = await apiClient.get<ApiIconResponse>(`/icons/${id}`);
    return mapApiIconToIcon(apiIcon);
  },

  /**
   * Cria novo ícone
   * POST /icons (para lib) ou POST /icons/upload (para png)
   */
  async createIcon(data: IconFormSchema): Promise<Icon> {
    // Se for tipo PNG, usa o endpoint de upload
    if (data.type === 'png' && data.file && data.file_dark) {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('file_dark', data.file_dark);
      formData.append('name', data.name);
      
      if (data.variant) {
        formData.append('variant', data.variant);
      }
      if (data.category) {
        formData.append('category', data.category);
      }
      if (data.description) {
        formData.append('description', data.description);
      }
      if (data.active !== undefined) {
        formData.append('active', String(data.active));
      }

      const response = await apiClient.post<ApiIconResponse | ApiIconWrappedResponse>(
        '/icons/upload',
        formData
      );
      const iconResponse = 'data' in response && response.data 
        ? response.data 
        : response as ApiIconResponse;
      return mapApiIconToIcon(iconResponse);
    }

    // Para tipo lib, usa o endpoint tradicional
    const createDto = formSchemaToCreateDto(data);
    const response = await apiClient.post<ApiIconResponse | ApiIconWrappedResponse>(
      '/icons',
      createDto
    );
    const iconResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiIconResponse;
    return mapApiIconToIcon(iconResponse);
  },

  /**
   * Atualiza ícone existente
   * PATCH /icons/:id (para lib ou quando não há novo arquivo)
   * PATCH /icons/:id/upload (para PNG quando há novo arquivo)
   */
  async updateIcon(id: string, data: IconFormSchema): Promise<Icon> {
    // Se for tipo PNG e houver novos arquivos, usa o endpoint de upload
    if (data.type === 'png' && data.file && data.file_dark) {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('file_dark', data.file_dark);
      
      if (data.name) {
        formData.append('name', data.name);
      }
      if (data.variant) {
        formData.append('variant', data.variant);
      }
      if (data.category) {
        formData.append('category', data.category);
      }
      if (data.description) {
        formData.append('description', data.description);
      }
      if (data.active !== undefined) {
        formData.append('active', String(data.active));
      }

      const response = await apiClient.patch<ApiIconResponse | ApiIconWrappedResponse>(
        `/icons/${id}/upload`,
        formData
      );
      const iconResponse = 'data' in response && response.data 
        ? response.data 
        : response as ApiIconResponse;
      return mapApiIconToIcon(iconResponse);
    }

    // Para tipo lib ou quando não há novo arquivo, usa o endpoint tradicional
    const updateDto = formSchemaToUpdateDto(data);
    
    // Remove campos undefined e mantém null quando necessário
    const cleanUpdates: Record<string, any> = {};
    Object.keys(updateDto).forEach(key => {
      const value = updateDto[key as keyof UpdateIconDto];
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });

    const response = await apiClient.patch<ApiIconResponse | ApiIconWrappedResponse>(
      `/icons/${id}`,
      cleanUpdates
    );
    const iconResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiIconResponse;
    return mapApiIconToIcon(iconResponse);
  },

  /**
   * Deleta ícone
   * DELETE /icons/:id
   */
  async deleteIcon(id: string): Promise<void> {
    return apiClient.delete<void>(`/icons/${id}`);
  },
};

