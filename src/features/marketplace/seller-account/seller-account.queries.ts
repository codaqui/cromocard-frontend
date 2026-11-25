import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { sellerAccountApi } from './seller-account.api';

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

export function useStripeOnboarding(redirect: (url: string) => void) {
  return useMutation({
    mutationFn: sellerAccountApi.createOnboardingLink,
    onSuccess: ({ url }) => redirect(url),
  });
}

export const isStripeAccountReady = (status?: string) => status === 'READY';
