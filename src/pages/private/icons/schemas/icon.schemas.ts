import { z } from 'zod';

// Schema base para validação de arquivo PNG
const pngFileSchema = z
  .instanceof(File, { message: 'Arquivo PNG é obrigatório' })
  .refine((file) => file.type === 'image/png', {
    message: 'Apenas arquivos PNG são permitidos',
  })
  .refine((file) => file.size <= 1024 * 1024, {
    message: 'Arquivo muito grande. Tamanho máximo: 1MB',
  });

export const iconFormSchema = z
  .object({
    type: z.enum(['lib', 'png']).default('lib'),
    name: z.string().min(1, 'Nome do ícone é obrigatório'),
    variant: z.enum(['Linear', 'Outline', 'TwoTone', 'Bulk', 'Broken', 'Bold']).optional(),
    category: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    active: z.boolean().default(true),
    file: z.instanceof(File).optional().nullable(), // Arquivo PNG light
    file_dark: z.instanceof(File).optional().nullable(), // Arquivo PNG dark
    url: z.string().nullable().optional(), // URL do arquivo light (apenas para leitura/exibição)
    url_dark: z.string().nullable().optional(), // URL do arquivo dark (apenas para leitura/exibição)
  })
  .refine(
    (data) => {
      // Para tipo 'lib', variant é obrigatório
      if (data.type === 'lib' && !data.variant) {
        return false;
      }
      return true;
    },
    {
      message: 'Variante é obrigatória para ícones de biblioteca',
      path: ['variant'],
    }
  )
  .refine(
    (data) => {
      // Para tipo 'png', ambos os arquivos são obrigatórios na criação
      // Se tiver URL, significa que já existe (edição), então não precisa dos arquivos
      if (data.type === 'png' && !data.url && (!data.file || !data.file_dark)) {
        return false;
      }
      // Se tiver file mas não tiver file_dark (ou vice-versa), também é inválido
      // Isso garante que quando atualizar, ambos devem ser enviados juntos
      if (data.type === 'png' && ((data.file && !data.file_dark) || (!data.file && data.file_dark))) {
        return false;
      }
      return true;
    },
    {
      message: 'Ambos os arquivos PNG (light e dark) são obrigatórios',
      path: ['file'],
    }
  )
  .refine(
    (data) => {
      // Valida os arquivos PNG se presentes
      if (data.type === 'png') {
        if (data.file) {
          if (data.file.type !== 'image/png') {
            return false;
          }
          if (data.file.size > 1024 * 1024) {
            return false;
          }
        }
        if (data.file_dark) {
          if (data.file_dark.type !== 'image/png') {
            return false;
          }
          if (data.file_dark.size > 1024 * 1024) {
            return false;
          }
        }
      }
      return true;
    },
    {
      message: 'Arquivo inválido. Apenas PNG até 1MB é permitido',
      path: ['file'],
    }
  );

export type IconFormSchema = z.infer<typeof iconFormSchema>;

