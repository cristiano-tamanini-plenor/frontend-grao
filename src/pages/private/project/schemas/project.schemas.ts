import { z } from 'zod';

export const projectFormSchema = z.object({
  nome: z.string().min(1, 'O nome do projeto é obrigatório').max(255, 'Nome muito longo'),
  descricao_detalhada: z.string().optional().or(z.literal('')),
  data_inicial: z.string().min(1, 'A data inicial é obrigatória'),
  data_final: z.string().optional().or(z.literal('')),
  status: z.boolean().default(true),
  centro_custo_id: z.string().optional().or(z.literal('')),
  logomarca: z.custom<File | null>((val) => val === null || val instanceof File).optional().nullable(),
  imagem_banner: z.custom<File | null>((val) => val === null || val instanceof File).optional().nullable(),
}).refine((data) => {
  // Valida que data_final é posterior a data_inicial se ambas existirem e não forem vazias
  if (data.data_final && data.data_final.trim() && data.data_inicial && data.data_inicial.trim()) {
    return new Date(data.data_final) >= new Date(data.data_inicial);
  }
  return true;
}, {
  message: 'A data final deve ser posterior à data inicial',
  path: ['data_final'],
});

export type ProjectFormSchema = z.infer<typeof projectFormSchema>;

