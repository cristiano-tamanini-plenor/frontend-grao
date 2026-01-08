import { z } from 'zod';
import { cleanCNPJ } from '@/lib/utils/cnpj';

const cnpjRegex = /^\d{14}$/;

export const companyFormSchema = z.object({
  marvee_customer_id: z.number().nullable().optional(),
  customer_id: z.string().optional(), // Opcional no schema, será validado condicionalmente
  name: z.string().min(1, 'Nome da empresa é obrigatório'),
  system_nickname: z.string().min(1, 'Apelido do sistema é obrigatório'),
  legal_representative: z.string().optional(),
  legal_email: z.string().optional(),
  legal_phone: z.string().optional(),
  client_id: z.string().optional(),
  client_secret: z.string().optional(),
  // avatar_url não é enviado para API - removido do schema
  is_active: z.boolean().default(true),
  cnpj: z
    .string()
    .min(1, 'CNPJ é obrigatório')
    .refine(
      (value) => {
        const cleaned = cleanCNPJ(value);
        return cnpjRegex.test(cleaned);
      },
      'CNPJ deve conter 14 dígitos'
    ),
  plan_id: z.string().nullable().optional(),
  certificate: z.instanceof(File).optional(),
  certificate_password: z.string().optional(),
  alter_certificate: z.boolean().optional(),
}).refine(
  (data) => {
    // Se alter_certificate for true, certificate e certificate_password são obrigatórios
    if (data.alter_certificate === true) {
      return !!data.certificate && !!data.certificate_password;
    }
    return true;
  },
  {
    message: 'Arquivo de certificado e senha são obrigatórios ao atualizar o certificado',
    path: ['certificate'],
  }
).refine(
  (data) => {
    // Validação do tipo de arquivo (apenas .pfx)
    if (data.certificate) {
      const fileName = data.certificate.name.toLowerCase();
      return fileName.endsWith('.pfx');
    }
    return true;
  },
  {
    message: 'Apenas arquivos .pfx são aceitos',
    path: ['certificate'],
  }
);

export type CompanyFormData = z.infer<typeof companyFormSchema>;
