import { z } from '@/lib/zod';

export const MESSAGE_MAX_LENGTH = 2000;

export const messageContentSchema = z
  .string()
  .trim()
  .min(1, { error: 'Escreva a mensagem' })
  .max(MESSAGE_MAX_LENGTH, {
    error: `A mensagem pode ter no máximo ${MESSAGE_MAX_LENGTH} caracteres`,
  });
