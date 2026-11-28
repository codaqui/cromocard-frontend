import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { sellerAccountApi } from './seller-account.api';
import { isStripeAccountReady, trustedOnboardingUrl } from './seller-account.status';

export const sellerAccountKeys = {
  all: ['seller', 'stripe-account'] as const,
};

export function useStripeAccount() {
  return useQuery({ queryKey: sellerAccountKeys.all, queryFn: sellerAccountApi.get });
}

export function useRefreshStripeAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sellerAccountApi.refresh,
    onSuccess: (account) => queryClient.setQueryData(sellerAccountKeys.all, account),
  });
}

async function createTrustedOnboardingLink() {
  const { url } = await sellerAccountApi.createOnboardingLink();
  return trustedOnboardingUrl(url);
}

export function useStripeOnboarding(redirect: (url: string) => void) {
  return useMutation({ mutationFn: createTrustedOnboardingLink, onSuccess: redirect });
}

/** Se o vendedor pode anunciar agora: só com a conta de recebimento pronta (CCD108, L2). */
export function useCanPublishListing() {
  const { data } = useStripeAccount();
  return data ? isStripeAccountReady(data.status) : false;
}
