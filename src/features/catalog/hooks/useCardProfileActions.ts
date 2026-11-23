import { useState } from 'react';

import { CARD_LISTINGS_SECTION_ID } from '@/features/marketplace';
import { useAuth } from '@/hooks/useAuth';

export const COMING_SOON_MESSAGE = 'Disponível em breve.';

function scrollToListings() {
  document.getElementById(CARD_LISTINGS_SECTION_ID)?.scrollIntoView({ behavior: 'smooth' });
}

export function useCardProfileActions() {
  const { user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const requireLogin = () => (user ? setNotice(COMING_SOON_MESSAGE) : setLoginOpen(true));

  return {
    user,
    loginOpen,
    closeLogin: () => setLoginOpen(false),
    notice,
    dismissNotice: () => setNotice(null),
    onSeeListings: scrollToListings,
    onAddToCollection: requireLogin,
    onFavorite: requireLogin,
  };
}
