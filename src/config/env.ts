import { z } from '@/lib/zod';

const envSchema = z.object({
  API_URL: z.url().transform((url) => url.replace(/\/+$/, '')),
  DEV_ACCESS_TOKEN: z.string().min(1).optional(),
});

function readDevAccessToken(): string | undefined {
  if (!import.meta.env.DEV) return undefined;
  return import.meta.env.VITE_DEV_ACCESS_TOKEN || undefined;
}

const parsedEnv = envSchema.safeParse({
  API_URL: window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL,
  DEV_ACCESS_TOKEN: readDevAccessToken(),
});

if (!parsedEnv.success) {
  throw new Error(`Variáveis de ambiente inválidas:\n${z.prettifyError(parsedEnv.error)}`);
}

export const env = parsedEnv.data;
