import { z } from '@/lib/zod';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'Informe um e-mail válido' }));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: 'Informe a senha' }),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
