import { z } from '@/lib/zod';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(
    z
      .email({ error: 'Informe um e-mail válido' })
      .max(160, { error: 'O e-mail pode ter no máximo 160 caracteres' }),
  );

export const passwordSchema = z
  .string()
  .min(8, { error: 'A senha precisa ter pelo menos 8 caracteres' })
  .max(128, { error: 'A senha pode ter no máximo 128 caracteres' })
  .regex(/[A-Za-z]/, { error: 'A senha precisa ter pelo menos uma letra' })
  .regex(/\d/, { error: 'A senha precisa ter pelo menos um número' })
  .regex(/[^A-Za-z\d]/, { error: 'A senha precisa ter pelo menos um símbolo' });

export const SIGN_UP_ROLES = ['CUSTOMER', 'SELLER'] as const;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: 'Informe a senha' }),
  rememberMe: z.boolean(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: 'O nome precisa ter pelo menos 2 caracteres' })
      .max(120, { error: 'O nome pode ter no máximo 120 caracteres' }),
    email: emailSchema,
    role: z.enum(SIGN_UP_ROLES, { error: 'Escolha Cliente ou Vendedor' }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { error: 'Repita a senha' }),
    termsAccepted: z
      .boolean()
      .refine(Boolean, { error: 'Aceite os termos de uso para criar a conta' }),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ['confirmPassword'],
    error: 'As senhas não são iguais',
  });

export const resendVerificationSchema = z.object({ email: emailSchema });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, { error: 'Repita a senha' }),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ['confirmPassword'],
    error: 'As senhas não são iguais',
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
