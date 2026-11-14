export const SELLER_VERIFICATION_STATUSES = [
  'UNDER_REVIEW',
  'PENDING',
  'APPROVED',
  'REJECTED',
] as const;

export type SellerVerificationStatus = (typeof SELLER_VERIFICATION_STATUSES)[number];
