import { z } from 'zod';

export const moduleFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().nullable().optional(),
  code: z.string().min(1, 'Código é obrigatório'),
  icon_id: z.number().nullable().optional(),
  active: z.boolean().default(true),
  parent_id: z.string().nullable().optional(),
  allowed_roles: z.array(z.enum(['OWNER', 'MEMBER', 'MEMBER_LIMITED', 'GUEST', 'DEVELOPER'])).min(1, 'Selecione pelo menos um tipo de usuário'),
});

export type ModuleFormSchema = z.infer<typeof moduleFormSchema>;
