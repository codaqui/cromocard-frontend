import { z } from '@/lib/zod';
import { type AuthenticatedUser, USER_ROLES } from '@/types/authenticated-user';

const MILLISECONDS_PER_SECOND = 1000;

const accessTokenPayloadSchema = z.object({
  sub: z.string(),
  role: z.enum(USER_ROLES),
  exp: z.number(),
});

type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;

function decodeBase64Url(value: string): string {
  try {
    return atob(value.replace(/-/g, '+').replace(/_/g, '/'));
  } catch {
    return '';
  }
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readPayload(token: string): AccessTokenPayload | null {
  const encodedPayload = token.split('.')[1] ?? '';
  const result = accessTokenPayloadSchema.safeParse(parseJson(decodeBase64Url(encodedPayload)));
  return result.success ? result.data : null;
}

function isExpired({ exp }: AccessTokenPayload): boolean {
  return exp * MILLISECONDS_PER_SECOND <= Date.now();
}

export function decodeAccessToken(token: string): AuthenticatedUser | null {
  const payload = readPayload(token);

  if (!payload || isExpired(payload)) return null;

  return { id: payload.sub, role: payload.role };
}
