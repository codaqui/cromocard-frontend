import { isValidCpf, normalizeCpf } from '@/lib/cpf';
import { isValidPhone, normalizePhone } from '@/lib/phone';
import { reasonSchema } from '@/lib/reason';
import { z } from '@/lib/zod';
import { USER_ROLES } from '@/types/authenticated-user';

const nameSchema = z
  .string()
  .trim()
  .min(2, { error: 'O nome precisa ter pelo menos 2 caracteres' })
  .max(120, { error: 'O nome pode ter no máximo 120 caracteres' });

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { error: 'Informe o e-mail' })
  .max(160, { error: 'O e-mail pode ter no máximo 160 caracteres' })
  .pipe(z.email({ error: 'Informe um e-mail válido' }));

const userRoleSchema = z.enum(USER_ROLES, { error: 'Selecione um papel' });

function optionalTextSchema(
  validate: (value: string) => boolean,
  message: string,
  normalize: (value: string) => string,
) {
  return z
    .string()
    .trim()
    .transform((value) => (value === '' ? undefined : value))
    .refine((value) => value === undefined || validate(value), { error: message })
    .transform((value) => (value === undefined ? undefined : normalize(value)));
}

const usernameSchema = optionalTextSchema(
  (value) => /^@?[a-z0-9._]{3,30}$/.test(value.toLowerCase()),
  'Use de 3 a 30 letras minúsculas, números, ponto ou _',
  (value) => value.toLowerCase().replace(/^@/, ''),
);

const cpfSchema = optionalTextSchema(isValidCpf, 'CPF inválido', normalizeCpf);

const phoneSchema = optionalTextSchema(
  isValidPhone,
  'Telefone inválido, informe o DDD',
  normalizePhone,
);

export const updateUserSchema = z.object({
  name: nameSchema,
});

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: userRoleSchema,
  username: usernameSchema,
  cpf: cpfSchema,
  phone: phoneSchema,
  sendActivation: z.boolean().default(true),
});

export const adminUpdateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  role: userRoleSchema.optional(),
  username: usernameSchema,
  cpf: cpfSchema,
  phone: phoneSchema,
});

export const reasonBodySchema = z.object({
  reason: reasonSchema,
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateUserFormValues = z.input<typeof createUserSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type ReasonInput = z.infer<typeof reasonBodySchema>;
