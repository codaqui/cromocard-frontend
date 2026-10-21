import { z } from '@/lib/zod';

export const loginSchema = z.object({
  email: z.email({ error: 'Informe um e-mail válido' }),
  password: z.string().min(1, { error: 'Informe a senha' }),
  rememberMe: z.boolean(),
});

export const setupPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: 'A senha precisa ter pelo menos 8 caracteres' })
      .max(72, { error: 'A senha pode ter no máximo 72 caracteres' }),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SetupPasswordFormValues = z.infer<typeof setupPasswordSchema>;
