import { useState } from 'react';

export function useSellerVerificationDrawer() {
  const [openId, setOpenId] = useState<string | null>(null);

  return {
    openId,
    isOpen: openId !== null,
    open: (id: string) => setOpenId(id),
    close: () => setOpenId(null),
  };
}
