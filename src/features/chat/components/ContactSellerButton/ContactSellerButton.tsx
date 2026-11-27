import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api-error';

import { listingContactTexts } from '../../chat.labels';
import type { ContactListing } from '../../chat.types';
import { useContactSeller } from '../../hooks/useContactSeller';
import { moderationTexts } from '../../moderation/contact-moderation.labels';
import styles from './ContactSellerButton.module.css';

export interface ContactSellerButtonProps {
  listing: ContactListing;
  seller: { id: string; username: string };
  onLoginRequired: () => void;
}

function failureOf(error: unknown, username: string): string | undefined {
  if (!error) return undefined;
  const code = error instanceof ApiError ? error.code : null;
  if (code === 'CONTACT_BLOCKED') return moderationTexts.blockedByMe(`@${username}`);
  if (code === 'SELLER_UNAVAILABLE') return listingContactTexts.sellerUnavailable;
  return listingContactTexts.failure;
}

export function ContactSellerButton({
  listing,
  seller,
  onLoginRequired,
}: ContactSellerButtonProps) {
  const { user } = useAuth();
  const contact = useContactSeller(listing);
  if (user?.id === seller.id) return null;
  const start = () => (user ? contact.mutate() : onLoginRequired());
  return (
    <div className={styles.contact}>
      <Button variant="secondary" onClick={start} disabled={contact.isPending}>
        {listingContactTexts.button}
      </Button>
      <FormError message={failureOf(contact.error, seller.username)} />
    </div>
  );
}
