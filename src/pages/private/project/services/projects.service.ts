import { apiClient } from '@/lib/api/client';
import type { Project, CreateProjectDto, UpdateProjectDto } from '../types';

/**
 * Cria FormData a partir dos dados do projeto
 */
function createProjectFormData(data: CreateProjectDto | UpdateProjectDto): FormData {
  const formData = new FormData();

  if (data.nome !== undefined) formData.append('nome', data.nome);
  if (data.descricao_detalhada !== undefined && data.descricao_detalhada) {
    formData.append('descricao_detalhada', data.descricao_detalhada);
  }
  if (data.data_inicial !== undefined) formData.append('data_inicial', data.data_inicial);
  if (data.data_final !== undefined && data.data_final) {
    formData.append('data_final', data.data_final);
  }
  if (data.status !== undefined) formData.append('status', String(data.status));
  if (data.centro_custo_id !== undefined && data.centro_custo_id) {
    formData.append('centro_custo_id', data.centro_custo_id);
  }
  if (data.logomarca instanceof File) formData.append('logomarca', data.logomarca);
  if (data.imagem_banner instanceof File) formData.append('imagem_banner', data.imagem_banner);

  return formData;
}

export const projectsService = {
  /**
   * Lista todos os projetos da empresa
   * GET /companies/:companyId/projects
   */
  async listProjects(companyId: string): Promise<Project[]> {
    return apiClient.get<Project[]>(`/companies/${companyId}/projects`);
  },

  /**
   * Busca um projeto por ID
   * GET /companies/:companyId/projects/:id
   */
  async getProjectById(companyId: string, id: string): Promise<Project> {
    return apiClient.get<Project>(`/companies/${companyId}/projects/${id}`);
  },

  /**
   * Cria novo projeto
   * POST /companies/:companyId/projects
   */
  async createProject(companyId: string, projectData: CreateProjectDto): Promise<Project> {
    const formData = createProjectFormData(projectData);
    
    // Para FormData, precisamos fazer a requisição manualmente
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';
    const accessToken = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_URL}/companies/${companyId}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // Não definir Content-Type - o browser define automaticamente com boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(Array.isArray(error.message) ? error.message.join('\n') : error.message);
    }

    return response.json();
  },

  /**
   * Atualiza projeto existente
   * PATCH /companies/:companyId/projects/:id
   */
  async updateProject(companyId: string, id: string, updates: UpdateProjectDto): Promise<Project> {
    const formData = createProjectFormData(updates);
    
    // Para FormData, precisamos fazer a requisição manualmente
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';
    const accessToken = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_URL}/companies/${companyId}/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // Não definir Content-Type - o browser define automaticamente com boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(Array.isArray(error.message) ? error.message.join('\n') : error.message);
    }

    const result = await response.json();
    return result.data || result;
  },

  /**
   * Remove projeto
   * DELETE /companies/:companyId/projects/:id
   */
  async deleteProject(companyId: string, id: string): Promise<void> {
    return apiClient.delete<void>(`/companies/${companyId}/projects/${id}`);
  },
};

