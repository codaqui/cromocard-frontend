export type StripeAccountStatus = 'NOT_CONNECTED' | 'PENDING' | 'VERIFYING' | 'READY';

export type StripePendingReason = 'NOT_SUBMITTED' | 'MORE_INFO_REQUIRED' | 'REJECTED';

export interface StripeAccount {
  status: StripeAccountStatus;
  pendingReason: StripePendingReason | null;
}

export interface OnboardingLink {
  url: string;
}
