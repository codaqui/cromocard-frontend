import { z } from '@/lib/zod';

export const REASON_MIN_LENGTH = 3;
export const REASON_MAX_LENGTH = 500;

export const reasonSchema = z
  .string()
  .trim()
  .min(REASON_MIN_LENGTH, {
    error: `O motivo precisa ter pelo menos ${REASON_MIN_LENGTH} caracteres`,
  })
  .max(REASON_MAX_LENGTH, { error: `O motivo pode ter no máximo ${REASON_MAX_LENGTH} caracteres` });
