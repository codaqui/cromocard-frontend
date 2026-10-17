import { env } from '@/config/env';

let accessToken: string | null = env.DEV_ACCESS_TOKEN ?? null;

export const accessTokenStore = {
  get: (): string | null => accessToken,
  set: (token: string | null): void => {
    accessToken = token;
  },
};
