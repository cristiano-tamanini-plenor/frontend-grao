import { z } from 'zod';

export const planoFormSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().trim().nullable().optional(),
  active: z.boolean().default(true),
});

export const planoModuloSchema = z.object({
  module_id: z.string().min(1, 'Selecione um módulo'),
  order_index: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const planoGrupoSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().trim().nullable().optional(),
  icon_id: z.number().nullable().optional(),
  order_index: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const planoItemSchema = z.object({
  cadastro_id: z.string().min(1, 'Selecione um cadastro'),
  grupo_id: z.preprocess(
    (val) => {
      // Transforma string vazia, null ou undefined em null
      if (val === '' || val === null || val === undefined) {
        return null;
      }
      return val;
    },
    z.union([
      z.string().min(1),
      z.null()
    ]).nullable().optional()
  ),
  order_index: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export type PlanoFormSchema = z.infer<typeof planoFormSchema>;
export type PlanoModuloSchema = z.infer<typeof planoModuloSchema>;
export type PlanoGrupoSchema = z.infer<typeof planoGrupoSchema>;
export type PlanoItemSchema = z.infer<typeof planoItemSchema>;
