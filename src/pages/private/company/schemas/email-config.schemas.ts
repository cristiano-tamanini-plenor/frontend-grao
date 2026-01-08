import { z } from 'zod';

export const emailConfigFormSchema = z.object({
  smtp_host: z.string().min(1, 'Host SMTP é obrigatório'),
  smtp_port: z
    .number()
    .int('A porta deve ser um número inteiro')
    .min(1, 'A porta deve ser maior que 0')
    .max(65535, 'A porta deve ser menor que 65536'),
  smtp_user: z.string().min(1, 'Usuário SMTP é obrigatório'),
  smtp_password: z.string().min(1, 'Senha SMTP é obrigatória'),
  smtp_from_email: z.string().email('Email remetente inválido').min(1, 'Email remetente é obrigatório'),
  smtp_from_name: z.string().min(1, 'Nome remetente é obrigatório'),
  imap_host: z.string().min(1, 'Host IMAP é obrigatório'),
  imap_port: z
    .number()
    .int('A porta deve ser um número inteiro')
    .min(1, 'A porta deve ser maior que 0')
    .max(65535, 'A porta deve ser menor que 65536'),
  is_active: z.boolean().default(true),
});

export type EmailConfigFormData = z.infer<typeof emailConfigFormSchema>;

