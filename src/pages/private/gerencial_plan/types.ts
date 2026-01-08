/**
 * Tipo de linha do plano gerencial
 */
export enum GerencialPlanType {
  CATEGORY = 'category',
  RESULT = 'result',
}

/**
 * Interface para AccountCategory (usado nas relações)
 */
export interface AccountCategory {
  id: number;
  structure: string | null;
  description: string | null;
  type?: 'credit' | 'debit' | null;
  status: boolean;
  level: string;
}

/**
 * Interface para GerencialPlanResult (categoria que compõe um resultado)
 */
export interface GerencialPlanResult {
  id: number;
  gerencial_plan_id: number;
  account_category_id: number;
  accountCategory: AccountCategory;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para uma linha do plano gerencial (Frontend)
 */
export interface GerencialPlan {
  id: number;
  company_id: number;
  sequence: number;
  type: GerencialPlanType;
  account_category_id: number | null;
  description: string;
  accountCategory: AccountCategory | null;
  results: GerencialPlanResult[];
  createdAt: string;
  updatedAt: string;
  // Propriedades expandidas retornadas pela API
  level?: string;
  structure?: string;
  name?: string;
}

/**
 * DTO para criar uma linha do plano gerencial
 */
export interface CreateGerencialPlanDto {
  sequence: number;
  type: GerencialPlanType;
  account_category_id?: number | null;
  description: string;
}

/**
 * DTO para atualizar uma linha do plano gerencial
 */
export interface UpdateGerencialPlanDto {
  sequence?: number;
  type?: GerencialPlanType;
  account_category_id?: number | null;
  description?: string;
}

/**
 * DTO para adicionar categoria a um resultado
 */
export interface CreateGerencialPlanResultDto {
  account_category_id: number;
}

/**
 * DTO para reordenar linhas
 */
export interface ReorderGerencialPlanDto {
  lineIds: number[];
}

