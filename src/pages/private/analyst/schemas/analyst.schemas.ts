import { z } from 'zod';

/**
 * Schema de validação para formulário de analista
 */
export const analystFormSchema = z.object({
  avatar: z.string().nullable().optional(),
  status: z.boolean().default(true),
  role: z.string().min(1, 'Cargo é obrigatório'),
  sector: z.string().min(1, 'Setor é obrigatório'),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  user_id: z.string().min(1, 'Usuário é obrigatório'),
  marvee_cost_center_id: z.number().nullable().optional(),
});

export type AnalystFormSchema = z.infer<typeof analystFormSchema>;

