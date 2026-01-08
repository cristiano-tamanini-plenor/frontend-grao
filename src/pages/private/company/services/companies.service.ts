import { apiClient } from '@/lib/api/client';
import type { Company, CreateCompanyData, UpdateCompanyData } from '../types';

/**
 * Constrói a URL completa do avatar da empresa
 * Se o avatar já for uma URL completa (http/https) ou base64, retorna como está
 * Se for um caminho relativo, adiciona a URL da API
 */
export function buildCompanyAvatarUrl(avatar: string | null | undefined): string | null {
  if (!avatar) return null;
  
  // Se já for uma URL completa ou base64, retorna como está
  if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:')) {
    return avatar;
  }
  
  // Se for um caminho relativo, adiciona a URL da API
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
  
  // Remove barra inicial se existir no avatar
  const cleanAvatar = avatar.startsWith('/') ? avatar.slice(1) : avatar;
  
  // Constrói a URL completa
  const fullUrl = `${apiUrl}/${cleanAvatar}`;
  
  return fullUrl;
}

/**
 * Interface da resposta da API
 */
interface ApiCompanyResponse {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  system_nickname: string | null;
  cnpj: string | null;
  legal_representative?: string | null;
  legal_email?: string | null;
  legal_phone?: string | null;
  client_id?: string | null;
  client_secret?: string | null;
  avatar_url?: string | null; // Campo avatar_url que vem da API (avatar do cliente associado)
  avatar?: string | null; // Campo avatar alternativo (caso venha em algum formato)
  is_active?: boolean;
  plan_id?: number | null;
  customer_id?: number | string | null; // Pode vir como número ou string
  certificate_imported?: boolean;
  certificate_validity?: string | null;
  certificate_path?: string | null;
}

/**
 * Interface para resposta com wrapper success/message/data
 */
interface ApiCompanyWrappedResponse {
  success?: boolean;
  message?: string;
  data?: ApiCompanyResponse;
}

/**
 * Mapeia a resposta da API para o formato do frontend
 */
function mapApiCompanyToCompany(apiCompany: ApiCompanyResponse): Company {
  // Se houver certificate_path, significa que há certificado importado
  const hasCertificate = !!(apiCompany.certificate_path || apiCompany.certificate_imported);
  
  // Usa avatar_url da API (prioritário) ou avatar como fallback
  const avatarUrl = apiCompany.avatar_url ?? apiCompany.avatar ?? null;
  
  // Converte customer_id para string se for número
  const customerId = apiCompany.customer_id 
    ? (typeof apiCompany.customer_id === 'number' ? String(apiCompany.customer_id) : apiCompany.customer_id)
    : null;
  
  return {
    id: String(apiCompany.id),
    name: apiCompany.name,
    system_nickname: apiCompany.system_nickname,
    legal_representative: apiCompany.legal_representative ?? null,
    legal_email: apiCompany.legal_email ?? null,
    legal_phone: apiCompany.legal_phone ?? null,
    client_id: apiCompany.client_id ?? null,
    client_secret: apiCompany.client_secret ?? null,
    avatar_url: avatarUrl, // Mapeia avatar_url ou avatar da API para avatar_url no frontend
    is_active: apiCompany.is_active ?? true,
    user_id: '',
    cnpj: apiCompany.cnpj,
    plan_id: apiCompany.plan_id ? String(apiCompany.plan_id) : null,
    customer_id: customerId,
    certificate_imported: hasCertificate,
    certificate_validity: apiCompany.certificate_validity ?? null,
    certificate_path: apiCompany.certificate_path ?? null,
    created_at: apiCompany.createdAt,
    updated_at: apiCompany.updatedAt,
  };
}

export const companiesService = {
  /**
   * Lista todas as empresas (para tela de empresas)
   * GET /companies
   */
  async listAllCompanies(): Promise<Company[]> {
    const apiCompanies = await apiClient.get<ApiCompanyResponse[]>('/companies');
    return apiCompanies.map(mapApiCompanyToCompany);
  },

  /**
   * Lista todas as empresas do usuário autenticado (para CompanySelector)
   * GET /user/companies
   */
  async listUserCompanies(): Promise<Company[]> {
    const apiCompanies = await apiClient.get<ApiCompanyResponse[]>('/user/companies');
    return apiCompanies.map(mapApiCompanyToCompany);
  },

  /**
   * @deprecated Use listAllCompanies() ou listUserCompanies() conforme necessário
   * Mantido para compatibilidade - retorna todas as empresas
   */
  async listCompanies(): Promise<Company[]> {
    return this.listAllCompanies();
  },

  /**
   * Busca empresa por ID
   * GET /companies/:id
   */
  async getCompanyById(id: string): Promise<Company> {
    const apiCompany = await apiClient.get<ApiCompanyResponse>(`/companies/${id}`);
    return mapApiCompanyToCompany(apiCompany);
  },

  /**
   * Cria nova empresa
   * POST /companies
   */
  async createCompany(companyData: CreateCompanyData): Promise<Company> {
    // Se houver certificado, usa FormData
    if (companyData.certificate) {
      const formData = new FormData();
      formData.append('name', companyData.name);
      if (companyData.system_nickname) formData.append('system_nickname', companyData.system_nickname);
      if (companyData.legal_representative) formData.append('legal_representative', companyData.legal_representative);
      if (companyData.legal_email) formData.append('legal_email', companyData.legal_email);
      if (companyData.legal_phone) formData.append('legal_phone', companyData.legal_phone);
      if (companyData.client_id) formData.append('client_id', companyData.client_id);
      if (companyData.client_secret) formData.append('client_secret', companyData.client_secret);
      // avatar_url não é enviado - o avatar é enviado via campo 'avatar' (base64) ou gerenciado separadamente
      if (companyData.cnpj) formData.append('cnpj', companyData.cnpj);
      if (companyData.plan_id) formData.append('plan_id', companyData.plan_id);
      if (companyData.customer_id) formData.append('customer_id', companyData.customer_id);
      
      formData.append('alter_certificate', 'true');
      formData.append('certificate', companyData.certificate);
      if (companyData.certificate_password) {
        formData.append('certificate_password', companyData.certificate_password);
      }
      
      const response = await apiClient.post<ApiCompanyResponse | ApiCompanyWrappedResponse>('/companies', formData);
      const companyResponse = 'data' in response && response.data ? response.data : response as ApiCompanyResponse;
      return mapApiCompanyToCompany(companyResponse);
    }
    
    // Caso contrário, usa JSON normal
    const response = await apiClient.post<ApiCompanyResponse | ApiCompanyWrappedResponse>('/companies', companyData);
    const companyResponse = 'data' in response && response.data ? response.data : response as ApiCompanyResponse;
    return mapApiCompanyToCompany(companyResponse);
  },

  /**
   * Atualiza empresa existente
   * PATCH /companies/:id
   */
  async updateCompany(id: string, updates: UpdateCompanyData): Promise<Company> {
    // Se houver certificado para atualizar, usa FormData
    if (updates.alter_certificate && updates.certificate) {
      const formData = new FormData();
      
      // Adiciona apenas os campos que foram fornecidos
      if (updates.name !== undefined) formData.append('name', updates.name);
      if (updates.system_nickname !== undefined) {
        // Se for null, não adiciona ao FormData (ou adiciona como string vazia)
        if (updates.system_nickname !== null) {
          formData.append('system_nickname', updates.system_nickname);
        }
      }
      if (updates.legal_representative !== undefined) {
        if (updates.legal_representative !== null && updates.legal_representative !== '') {
          formData.append('legal_representative', updates.legal_representative);
        }
      }
      if (updates.legal_email !== undefined) {
        if (updates.legal_email !== null && updates.legal_email !== '') {
          formData.append('legal_email', updates.legal_email);
        }
      }
      if (updates.legal_phone !== undefined) {
        if (updates.legal_phone !== null && updates.legal_phone !== '') {
          formData.append('legal_phone', updates.legal_phone);
        }
      }
      if (updates.client_id !== undefined) {
        if (updates.client_id !== null && updates.client_id !== '') {
          formData.append('client_id', updates.client_id);
        }
      }
      if (updates.client_secret !== undefined) {
        if (updates.client_secret !== null && updates.client_secret !== '') {
          formData.append('client_secret', updates.client_secret);
        }
      }
      // avatar_url não é enviado na atualização - o avatar é gerenciado separadamente
      if (updates.is_active !== undefined) {
        formData.append('is_active', String(updates.is_active));
      }
      if (updates.cnpj !== undefined) {
        if (updates.cnpj !== null && updates.cnpj !== '') {
          formData.append('cnpj', updates.cnpj);
        }
      }
      if (updates.plan_id !== undefined) {
        if (updates.plan_id !== null && updates.plan_id !== '') {
          formData.append('plan_id', updates.plan_id);
        }
      }
      if (updates.customer_id !== undefined) {
        if (updates.customer_id !== null && updates.customer_id !== '') {
          formData.append('customer_id', updates.customer_id);
        }
      }
      
      formData.append('alter_certificate', 'true');
      formData.append('certificate', updates.certificate);
      if (updates.certificate_password) {
        formData.append('certificate_password', updates.certificate_password);
      }
      
      const response = await apiClient.patch<ApiCompanyResponse | ApiCompanyWrappedResponse>(`/companies/${id}`, formData);
      const companyResponse = 'data' in response && response.data ? response.data : response as ApiCompanyResponse;
      return mapApiCompanyToCompany(companyResponse);
    }
    
    // Caso contrário, usa JSON normal
    // Remove campos undefined e mantém null quando necessário
    const cleanUpdates: Record<string, any> = {};
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof UpdateCompanyData] !== undefined) {
        cleanUpdates[key] = updates[key as keyof UpdateCompanyData];
      }
    });
    
    const response = await apiClient.patch<ApiCompanyResponse | ApiCompanyWrappedResponse>(`/companies/${id}`, cleanUpdates);
    const companyResponse = 'data' in response && response.data ? response.data : response as ApiCompanyResponse;
    return mapApiCompanyToCompany(companyResponse);
  },

  /**
   * Alterna status ativo/inativo da empresa
   * PATCH /companies/:id
   */
  async toggleCompanyStatus(id: string, isActive: boolean): Promise<Company> {
    const response = await apiClient.patch<ApiCompanyResponse | ApiCompanyWrappedResponse>(`/companies/${id}`, { is_active: isActive });
    const companyResponse = 'data' in response && response.data ? response.data : response as ApiCompanyResponse;
    return mapApiCompanyToCompany(companyResponse);
  },

  /**
   * Deleta empresa (soft delete)
   * DELETE /companies/:id
   */
  async deleteCompany(id: string): Promise<void> {
    return apiClient.delete<void>(`/companies/${id}`);
  },

  /**
   * Upload de avatar da empresa
   * PATCH /companies/:companyId/avatar
   * Converte arquivo para base64 e envia para o backend
   */
  async uploadAvatar(file: File, companyId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          
          // Envia para o endpoint de avatar
          const response = await apiClient.patch<ApiCompanyWrappedResponse>(
            `/companies/${companyId}/avatar`,
            { avatar: base64String }
          );
          
          // Extrai a URL do avatar da resposta
          // A resposta vem com "data.avatar" (não "data.avatar_url")
          const avatarUrl = (response.data as any)?.avatar || null;
          if (!avatarUrl) {
            throw new Error('Avatar URL não retornada pelo servidor');
          }
          
          resolve(avatarUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Remove avatar da empresa
   * DELETE /companies/:companyId/avatar
   */
  async removeAvatar(companyId: string): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/avatar`);
  },
};
