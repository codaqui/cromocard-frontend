import { z } from '@/lib/zod';

const baseUrl = z.url().transform((url) => url.replace(/\/+$/, ''));

const envSchema = z.object({
  API_URL: baseUrl,
  WS_URL: baseUrl,
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  SUPPORT_EMAIL: z.email().default('suporte@cromocard.dev'),
});

const parsedEnv = envSchema.safeParse({
  API_URL: window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL,
  WS_URL: window.__ENV__?.WS_URL ?? import.meta.env.VITE_WS_URL,
  GOOGLE_CLIENT_ID:
    window.__ENV__?.GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined,
  SUPPORT_EMAIL: window.__ENV__?.SUPPORT_EMAIL || import.meta.env.VITE_SUPPORT_EMAIL || undefined,
});

if (!parsedEnv.success) {
  throw new Error(`Variáveis de ambiente inválidas:\n${z.prettifyError(parsedEnv.error)}`);
}

export const env = parsedEnv.data;
