import { api } from '@/lib/http';

import type { OnboardingLink, StripeAccount } from './seller-account.types';

const BASE = '/me/stripe-account';

export const sellerAccountApi = {
  get: () => api.get<StripeAccount>(BASE),
  createOnboardingLink: () => api.post<OnboardingLink>(`${BASE}/onboarding-link`),
  refresh: () => api.post<StripeAccount>(`${BASE}/refresh`),
};
