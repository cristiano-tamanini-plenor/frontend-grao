import { z } from 'zod';
import { GerencialPlanType } from '../types';

/**
 * Schema para criar/atualizar uma linha do plano gerencial
 */
export const gerencialPlanFormSchema = z
  .object({
    sequence: z.number().int().min(1, 'A sequência deve ser maior que zero'),
    type: z.nativeEnum(GerencialPlanType, {
      errorMap: () => ({ message: 'Tipo deve ser "category" ou "result"' }),
    }),
    account_category_id: z.union([z.number(), z.string()]).nullable().optional().transform((val) => {
      if (val === null || val === undefined) return null;
      return typeof val === 'string' ? Number(val) : val;
    }),
    description: z.string().max(255, 'A descrição deve ter no máximo 255 caracteres').nullable().optional(),
  })
  .refine(
    (data) => {
      // Se type é 'category', account_category_id é obrigatório
      if (data.type === GerencialPlanType.CATEGORY) {
        return data.account_category_id !== null && data.account_category_id !== undefined;
      }
      // Se type é 'result', account_category_id deve ser null
      if (data.type === GerencialPlanType.RESULT) {
        return data.account_category_id === null || data.account_category_id === undefined;
      }
      return true;
    },
    {
      message: 'Categoria de conta é obrigatória para linhas do tipo "category" e deve ser nula para linhas do tipo "result"',
      path: ['account_category_id'],
    }
  )
  .refine(
    (data) => {
      // Se type é 'result', description é obrigatória
      if (data.type === GerencialPlanType.RESULT) {
        return data.description !== null && data.description !== undefined && data.description.trim().length > 0;
      }
      return true;
    },
    {
      message: 'A descrição é obrigatória para linhas do tipo "result"',
      path: ['description'],
    }
  );

export type GerencialPlanFormSchema = z.infer<typeof gerencialPlanFormSchema>;

/**
 * Schema para adicionar categoria a um resultado
 */
export const gerencialPlanResultFormSchema = z.object({
  account_category_id: z.number().int().min(1, 'Selecione uma categoria'),
});

export type GerencialPlanResultFormSchema = z.infer<typeof gerencialPlanResultFormSchema>;

/**
 * Schema para reordenar linhas
 */
export const reorderGerencialPlanSchema = z.object({
  lineIds: z.array(z.number().int().min(1)).min(1, 'Deve fornecer pelo menos um ID'),
});

export type ReorderGerencialPlanSchema = z.infer<typeof reorderGerencialPlanSchema>;

