import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{10,14}$/;

export const userFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  phone_e164: z.string().regex(phoneRegex, 'Telefone inválido').optional().or(z.literal('')),
  role: z.enum(['OWNER', 'MEMBER', 'MEMBER_LIMITED', 'GUEST']),
  avatar_url: z.string().url('URL inválida').optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

export type UserFormData = z.infer<typeof userFormSchema>;
