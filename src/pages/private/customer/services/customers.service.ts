import { apiClient } from '@/lib/api/client';
import type { Customer } from '../types';
import type { CustomerFormSchema } from '../schemas/customer.schemas';

/**
 * Interface da resposta da API (NestJS)
 */
interface ApiCustomerResponse {
  id: number;
  name: string;
  fantasy_name: string;
  guid_marvee: string;
  marvee_id: number | null;
  status: boolean;
  date_initial: string; // ISO 8601
  date_final: string | null; // ISO 8601
  avatar: string | null;
  analyst_id: number | null;
  fee: number | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  analyst?: {
    id: number;
    avatar: string | null;
    role?: string;
    sector?: string;
    status?: boolean;
  } | null;
}

/**
 * Interface para resposta com wrapper success/message/data
 */
interface ApiCustomerWrappedResponse {
  success?: boolean;
  message?: string;
  data?: ApiCustomerResponse;
}

/**
 * Mapeia a resposta da API para o formato do frontend
 */
function mapApiCustomerToCustomer(apiCustomer: ApiCustomerResponse): Customer {
  return {
    id: String(apiCustomer.id),
    name: apiCustomer.name,
    fantasy_name: apiCustomer.fantasy_name,
    guid_marvee: apiCustomer.guid_marvee,
    marvee_id: apiCustomer.marvee_id,
    status: apiCustomer.status ?? true,
    date_initial: apiCustomer.date_initial,
    date_final: apiCustomer.date_final ?? null,
    avatar: apiCustomer.avatar ?? null,
    analyst_id: apiCustomer.analyst_id ?? null,
    fee: apiCustomer.fee ?? null,
    created_at: apiCustomer.createdAt,
    updated_at: apiCustomer.updatedAt,
    analyst: apiCustomer.analyst ?? null,
  };
}

/**
 * DTO para criação de cliente
 */
export interface CreateCustomerDto {
  name: string;
  fantasy_name: string;
  guid_marvee: string;
  marvee_id?: number | null;
  date_initial: string; // ISO 8601
  date_final?: string | null; // ISO 8601
  status?: boolean;
  analyst_id: number;
  fee?: number | null;
}

/**
 * DTO para atualização de cliente
 */
export interface UpdateCustomerDto {
  name?: string;
  fantasy_name?: string;
  guid_marvee?: string;
  marvee_id?: number | null;
  date_initial?: string;
  date_final?: string | null;
  status?: boolean;
  analyst_id?: number | null;
  fee?: number | null;
}

/**
 * Converte o schema do formulário para o DTO da API
 */
function formSchemaToCreateDto(data: CustomerFormSchema): CreateCustomerDto {
  return {
    name: data.name,
    fantasy_name: data.fantasy_name,
    guid_marvee: data.guid_marvee,
    marvee_id: data.marvee_id ?? null,
    date_initial: data.date_initial,
    date_final: data.date_final || null,
    status: data.status ?? true,
    analyst_id: data.analyst_id,
    fee: data.fee ?? null,
  };
}

/**
 * Converte o schema do formulário para o DTO de atualização
 */
function formSchemaToUpdateDto(data: CustomerFormSchema): UpdateCustomerDto {
  return {
    name: data.name,
    fantasy_name: data.fantasy_name,
    guid_marvee: data.guid_marvee,
    marvee_id: data.marvee_id ?? null,
    date_initial: data.date_initial,
    date_final: data.date_final || null,
    status: data.status ?? true,
    analyst_id: data.analyst_id ?? null,
    fee: data.fee ?? null,
  };
}

export const customersService = {
  /**
   * Lista todos os clientes
   * GET /customers?status=true|false
   */
  async listCustomers(status?: boolean): Promise<Customer[]> {
    const queryParams = new URLSearchParams();
    if (status !== undefined) {
      queryParams.append('status', String(status));
    }
    const queryString = queryParams.toString();
    const url = `/customers${queryString ? `?${queryString}` : ''}`;
    const apiCustomers = await apiClient.get<ApiCustomerResponse[]>(url);
    return apiCustomers.map(mapApiCustomerToCustomer);
  },

  /**
   * Busca cliente por ID
   * GET /customers/:id
   */
  async getCustomerById(id: string): Promise<Customer> {
    const apiCustomer = await apiClient.get<ApiCustomerResponse>(`/customers/${id}`);
    return mapApiCustomerToCustomer(apiCustomer);
  },

  /**
   * Cria novo cliente
   * POST /customers
   */
  async createCustomer(data: CustomerFormSchema): Promise<Customer> {
    const createDto = formSchemaToCreateDto(data);
    const response = await apiClient.post<ApiCustomerResponse | ApiCustomerWrappedResponse>(
      '/customers',
      createDto
    );
    const customerResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiCustomerResponse;
    return mapApiCustomerToCustomer(customerResponse);
  },

  /**
   * Atualiza cliente existente
   * PATCH /customers/:id
   */
  async updateCustomer(id: string, data: CustomerFormSchema): Promise<Customer> {
    const updateDto = formSchemaToUpdateDto(data);
    
    // Remove campos undefined e mantém null quando necessário
    const cleanUpdates: Record<string, any> = {};
    Object.keys(updateDto).forEach(key => {
      const value = updateDto[key as keyof UpdateCustomerDto];
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });

    // Garante que fee esteja sempre presente no payload (mesmo quando null)
    cleanUpdates.fee = updateDto.fee ?? null;

    const response = await apiClient.patch<ApiCustomerResponse | ApiCustomerWrappedResponse>(
      `/customers/${id}`,
      cleanUpdates
    );
    const customerResponse = 'data' in response && response.data 
      ? response.data 
      : response as ApiCustomerResponse;
    return mapApiCustomerToCustomer(customerResponse);
  },

  /**
   * Deleta cliente
   * DELETE /customers/:id
   */
  async deleteCustomer(id: string): Promise<void> {
    return apiClient.delete<void>(`/customers/${id}`);
  },

  /**
   * Upload de avatar (Base64)
   * POST /customers/:id/avatar
   * 
   * Resposta esperada:
   * {
   *   "success": true,
   *   "message": "Avatar atualizado com sucesso",
   *   "data": {
   *     "id": 5,
   *     "name": "Cliente Exemplo",
   *     "avatar": "/uploads/avatars/customer-5-avatar-1705314600000.png"
   *   }
   * }
   */
  async uploadAvatar(id: string, avatar: string): Promise<Customer> {
    const response = await apiClient.post<ApiCustomerWrappedResponse>(
      `/customers/${id}/avatar`,
      { avatar }
    );
    
    // A resposta vem no formato: { success: true, message: "...", data: { id, name, avatar } }
    let avatarUrl: string | null = null;
    
    if (response && typeof response === 'object') {
      // Extrai o avatar de response.data.avatar
      if ('data' in response && response.data) {
        avatarUrl = (response.data as any).avatar || null;
      }
    }
    
    // Se conseguiu extrair o avatar, busca o customer completo e atualiza
    if (avatarUrl) {
      const fullCustomer = await customersService.getCustomerById(id);
      return {
        ...fullCustomer,
        avatar: avatarUrl,
      };
    }
    
    // Se não conseguiu extrair, tenta mapear como Customer completo
    const customerResponse = ('data' in response && response.data 
      ? response.data 
      : response) as ApiCustomerResponse;
    return mapApiCustomerToCustomer(customerResponse);
  },

  /**
   * Lista clientes não associados a empresas
   * GET /customers/unassociated
   */
  async listUnassociatedCustomers(): Promise<Customer[]> {
    const apiCustomers = await apiClient.get<ApiCustomerResponse[]>('/customers/unassociated');
    return apiCustomers.map(mapApiCustomerToCustomer);
  },
};

