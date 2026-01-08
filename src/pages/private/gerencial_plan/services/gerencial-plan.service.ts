import { apiClient } from '@/lib/api/client';
import type {
  GerencialPlan,
  CreateGerencialPlanDto,
  UpdateGerencialPlanDto,
  CreateGerencialPlanResultDto,
  ReorderGerencialPlanDto,
  GerencialPlanResult,
} from '../types';

/**
 * Serviço para gerenciar o plano gerencial
 */
export const gerencialPlanService = {
  /**
   * Lista todas as linhas do plano gerencial
   * GET /companies/:companyId/gerencial-plan
   */
  async listGerencialPlans(companyId: number): Promise<GerencialPlan[]> {
    return apiClient.get<GerencialPlan[]>(`/companies/${companyId}/gerencial-plan`);
  },

  /**
   * Busca uma linha específica por ID
   * GET /companies/:companyId/gerencial-plan/:id
   */
  async getGerencialPlanById(companyId: number, id: number): Promise<GerencialPlan> {
    return apiClient.get<GerencialPlan>(`/companies/${companyId}/gerencial-plan/${id}`);
  },

  /**
   * Cria uma nova linha do plano
   * POST /companies/:companyId/gerencial-plan
   */
  async createGerencialPlan(
    companyId: number,
    data: CreateGerencialPlanDto
  ): Promise<GerencialPlan> {
    return apiClient.post<GerencialPlan>(`/companies/${companyId}/gerencial-plan`, data);
  },

  /**
   * Atualiza uma linha existente
   * PUT /companies/:companyId/gerencial-plan/:id
   */
  async updateGerencialPlan(
    companyId: number,
    id: number,
    data: UpdateGerencialPlanDto
  ): Promise<GerencialPlan> {
    return apiClient.put<GerencialPlan>(`/companies/${companyId}/gerencial-plan/${id}`, data);
  },

  /**
   * Remove uma linha do plano
   * DELETE /companies/:companyId/gerencial-plan/:id
   */
  async deleteGerencialPlan(companyId: number, id: number): Promise<void> {
    return apiClient.delete<void>(`/companies/${companyId}/gerencial-plan/${id}`);
  },

  /**
   * Adiciona uma categoria a um resultado
   * POST /companies/:companyId/gerencial-plan/:id/results
   */
  async addResult(
    companyId: number,
    gerencialPlanId: number,
    data: CreateGerencialPlanResultDto
  ): Promise<GerencialPlanResult> {
    return apiClient.post<GerencialPlanResult>(
      `/companies/${companyId}/gerencial-plan/${gerencialPlanId}/results`,
      data
    );
  },

  /**
   * Remove uma categoria de um resultado
   * DELETE /companies/:companyId/gerencial-plan/:id/results/:resultId
   */
  async removeResult(
    companyId: number,
    gerencialPlanId: number,
    resultId: number
  ): Promise<void> {
    return apiClient.delete<void>(
      `/companies/${companyId}/gerencial-plan/${gerencialPlanId}/results/${resultId}`
    );
  },

  /**
   * Reordena todas as linhas do plano
   * PUT /companies/:companyId/gerencial-plan/reorder
   */
  async reorderLines(
    companyId: number,
    data: ReorderGerencialPlanDto
  ): Promise<GerencialPlan[]> {
    return apiClient.put<GerencialPlan[]>(`/companies/${companyId}/gerencial-plan/reorder`, data);
  },
};

