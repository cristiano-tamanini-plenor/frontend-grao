import { z } from 'zod';

/**
 * Schema de validação para formulário de cliente
 */
export const customerFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  fantasy_name: z.string().min(1, 'Nome fantasia é obrigatório'),
  guid_marvee: z.string().min(1, 'GUID Marvee é obrigatório'),
  marvee_id: z.number().nullable().optional(),
  date_initial: z.string().min(1, 'Data inicial é obrigatória'),
  date_final: z.string().nullable().optional(),
  status: z.boolean().default(true),
  analyst_id: z.number().min(1, 'Analista é obrigatório'),
  fee: z.number().nullable().optional(),
});

export type CustomerFormSchema = z.infer<typeof customerFormSchema>;

