import { apiClient } from '@/lib/api/client';
import type { SidebarConfig } from '@/components/layout/Template/Sidebar/types';

/**
 * Interface da resposta da API (pode ser wrapper ou array direto)
 */
interface SidebarWrappedResponse {
  success: boolean;
  data: SidebarConfig;
}

/**
 * Busca a configuração da sidebar para uma empresa
 * GET /companies/:company_id/sidebar
 */
export async function getSidebarByCompanyId(companyId: string): Promise<SidebarConfig> {
  try {
    const response = await apiClient.get<SidebarConfig | SidebarWrappedResponse>(
      `/companies/${companyId}/sidebar`
    );
    
    // Se for um objeto com success/data (wrapper)
    if (typeof response === 'object' && 'success' in response && 'data' in response) {
      const wrappedResponse = response as SidebarWrappedResponse;
      if (wrappedResponse.success && wrappedResponse.data) {
        return wrappedResponse.data;
      }
      return [];
    }
    
    // Se for array direto
    if (Array.isArray(response)) {
      return response;
    }
    
    // Fallback: retorna array vazio
    return [];
  } catch (error) {
    console.error('Erro ao buscar sidebar:', error);
    // Em caso de erro, retorna array vazio para não quebrar a aplicação
    return [];
  }
}

