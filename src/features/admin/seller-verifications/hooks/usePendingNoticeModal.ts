import { useState } from 'react';

import type { PendingNoticeTarget, SellerVerificationDetail } from '../seller-verifications.types';

function targetOf({ id, cnpj, seller }: SellerVerificationDetail): PendingNoticeTarget {
  return { id, cnpj, sellerId: seller.id, sellerName: seller.name, sellerEmail: seller.email };
}

export function usePendingNoticeModal() {
  const [target, setTarget] = useState<PendingNoticeTarget | null>(null);

  return {
    target,
    openFor: (detail: SellerVerificationDetail) => setTarget(targetOf(detail)),
    close: () => setTarget(null),
  };
}
