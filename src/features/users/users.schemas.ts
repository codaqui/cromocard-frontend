import { z } from '@/lib/zod';

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: 'O nome precisa ter pelo menos 2 caracteres' })
    .max(120, { error: 'O nome pode ter no máximo 120 caracteres' }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
