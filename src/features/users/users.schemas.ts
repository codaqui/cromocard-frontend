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
  .pipe(z.email({ error: 'Informe um e-mail válido' }));

const userRoleSchema = z.enum(USER_ROLES, { error: 'Selecione um papel' });

export const updateUserSchema = z.object({
  name: nameSchema,
});

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: userRoleSchema,
});

export const adminUpdateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  role: userRoleSchema.optional(),
});

export const reasonBodySchema = z.object({
  reason: reasonSchema,
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type ReasonInput = z.infer<typeof reasonBodySchema>;
