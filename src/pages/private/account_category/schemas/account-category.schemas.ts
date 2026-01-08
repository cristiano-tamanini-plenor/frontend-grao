import { z } from 'zod';
import { AccountCategoryLevel } from '../types';

export const accountCategoryFormSchema = z
  .object({
    account_category_father_id: z.string().nullable().optional(),
    primary_category_filter_id: z.string().nullable().optional(), // Campo auxiliar para filtro (não é enviado ao backend)
    structure: z.string().max(255, 'Estrutura deve ter no máximo 255 caracteres').nullable().optional(),
    description: z.string().nullable().optional(),
    status: z.boolean().default(true),
    level: z.nativeEnum(AccountCategoryLevel, {
      errorMap: () => ({ message: 'Nível é obrigatório' }),
    }),
  })
  .refine(
    (data) => {
      // Se for Secondary ou Tertiary, account_category_father_id é obrigatório
      if (data.level === AccountCategoryLevel.SECONDARY || data.level === AccountCategoryLevel.TERTIARY) {
        return data.account_category_father_id !== null && data.account_category_father_id !== undefined && data.account_category_father_id !== '';
      }
      return true;
    },
    {
      message: 'Categoria Pai é obrigatória para níveis Secundária e Terciária',
      path: ['account_category_father_id'],
    }
  );

export type AccountCategoryFormSchema = z.infer<typeof accountCategoryFormSchema>;

