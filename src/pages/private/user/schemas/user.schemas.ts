import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{10,14}$/;
const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/; // Apenas letras, espaços e acentos

/**
 * Schema para criação de usuário (conforme documentação do backend)
 * name: mínimo 10 caracteres
 */
export const createUserSchema = z.object({
  name: z.string().min(10, 'O campo nome deve ter no mínimo 10 caracteres.'),
  email: z.string().email('O campo email deve conter um email válido.'),
  password: z.string().min(1, 'O campo senha é obrigatório.'),
  confirmPassword: z.string().min(1, 'O campo confirmação de senha é obrigatório.'),
  type_user: z.enum(['owner', 'admin', 'developer', 'guest'], {
    errorMap: () => ({
      message: 'O campo tipo de usuário deve ser um dos seguintes valores: owner, admin, developer, guest',
    }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

/**
 * Schema para atualização de perfil (conforme documentação do backend)
 * name: mínimo 2, máximo 100 caracteres, apenas letras e espaços
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'O campo nome deve ter no mínimo 2 caracteres.')
    .max(100, 'O campo nome deve ter no máximo 100 caracteres.')
    .regex(nameRegex, 'O nome deve conter apenas letras, espaços e acentos.'),
  email: z
    .string()
    .email('O campo email deve conter um email válido.')
    .max(255, 'O campo email deve ter no máximo 255 caracteres.'),
  avatar: z.string().optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Se qualquer campo de senha for fornecido, todos são obrigatórios
  const hasAnyPassword = data.currentPassword || data.newPassword || data.confirmPassword;
  if (hasAnyPassword) {
    return !!(data.currentPassword && data.newPassword && data.confirmPassword);
  }
  return true;
}, {
  message: 'Senha atual é obrigatória para mudança de senha',
  path: ['currentPassword'],
}).refine((data) => {
  // Se newPassword for fornecido, deve ter no mínimo 6 caracteres
  if (data.newPassword) {
    return data.newPassword.length >= 6;
  }
  return true;
}, {
  message: 'A nova senha deve ter pelo menos 6 caracteres.',
  path: ['newPassword'],
}).refine((data) => {
  // Se mudando senha, confirmPassword deve coincidir com newPassword
  if (data.newPassword && data.confirmPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: 'Confirmação de senha não confere',
  path: ['confirmPassword'],
});

/**
 * Schema para formulário de usuário no frontend (compatibilidade)
 * Usa validações mais flexíveis para edição
 */
export const userFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  phone_e164: z.string().regex(phoneRegex, 'Telefone inválido').optional().or(z.literal('')),
  role: z.enum(['OWNER', 'MEMBER', 'MEMBER_LIMITED', 'GUEST', 'DEVELOPER']),
  avatar_url: z
    .union([
      z.string().url('URL inválida'),
      z.literal(''),
    ])
    .optional()
    .default(''),
});

export type UserFormSchema = z.infer<typeof userFormSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

