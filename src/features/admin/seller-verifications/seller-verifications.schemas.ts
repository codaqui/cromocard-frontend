import { reasonSchema } from '@/lib/reason';
import { z } from '@/lib/zod';

import { DEADLINE_HOURS_OPTIONS } from './seller-verifications.types';

export const sendPendingNoticeSchema = z.object({
  templateKey: z.string().trim().min(1).max(60).optional(),
  message: z
    .string()
    .trim()
    .min(1, { error: 'Escreva o corpo da mensagem' })
    .max(2000, { error: 'A mensagem pode ter no máximo 2000 caracteres' }),
  deadlineHours: z.literal(DEADLINE_HOURS_OPTIONS),
});

export const approveSchema = z.object({
  reason: reasonSchema.optional(),
});

export const rejectSchema = z.object({
  reason: reasonSchema,
});

export const addNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { error: 'Escreva uma anotação' })
    .max(2000, { error: 'A anotação pode ter no máximo 2000 caracteres' }),
});

export type ApproveInput = z.infer<typeof approveSchema>;
export type RejectInput = z.infer<typeof rejectSchema>;
export type AddNoteInput = z.infer<typeof addNoteSchema>;
export type SendPendingNoticeInput = z.infer<typeof sendPendingNoticeSchema>;
