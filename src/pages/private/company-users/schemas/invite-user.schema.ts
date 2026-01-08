import { z } from 'zod';

export const inviteUserSchema = z.object({
  emails: z
    .string()
    .min(1, 'Informe pelo menos um email')
    .refine(
      (value) => {
        // Separar emails por vírgula ou espaço
        const emailList = value
          .split(/[,;\s]+/)
          .map((e) => e.trim())
          .filter((e) => e.length > 0);
        
        // Validar cada email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailList.every((email) => emailRegex.test(email));
      },
      {
        message: 'Um ou mais emails são inválidos',
      }
    ),
  role: z.enum(['MEMBER', 'MEMBER_LIMITED', 'GUEST']).default('MEMBER'),
  user_profile_id: z.string().optional(),
});

export type InviteUserFormData = z.infer<typeof inviteUserSchema>;

