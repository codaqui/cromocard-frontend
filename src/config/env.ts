import { z } from '@/lib/zod';

const envSchema = z.object({
  API_URL: z.url().transform((url) => url.replace(/\/+$/, '')),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
});

const parsedEnv = envSchema.safeParse({
  API_URL: window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL,
  GOOGLE_CLIENT_ID:
    window.__ENV__?.GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined,
});

if (!parsedEnv.success) {
  throw new Error(`Variáveis de ambiente inválidas:\n${z.prettifyError(parsedEnv.error)}`);
}

export const env = parsedEnv.data;
