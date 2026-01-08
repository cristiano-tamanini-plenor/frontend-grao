import { z } from 'zod';

export const cadastroFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().nullable().optional(),
  code: z.string().min(1, 'Código é obrigatório'),
  type: z.enum(['page', 'crud']).default('page'),
  icon_id: z.number().nullable().optional(),
  route: z.string().nullable().optional(),
  active: z.boolean().default(true),
});

export type CadastroFormSchema = z.infer<typeof cadastroFormSchema>;
