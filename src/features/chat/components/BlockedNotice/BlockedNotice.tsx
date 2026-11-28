import { FormError } from '@/components/FormError/FormError';
import { Icon } from '@/components/Icon/Icon';

import type { ContactBlock } from '../../chat.types';
import { moderationTexts } from '../../moderation/contact-moderation.labels';
import { useUnblockContact } from '../../moderation/contact-moderation.queries';
import styles from './BlockedNotice.module.css';

interface BlockedNoticeProps {
  block: NonNullable<ContactBlock>;
  contactId: string;
  handle: string;
}

function UnblockButton({ contactId }: { contactId: string }) {
  const unblock = useUnblockContact();
  return (
    <>
      <button
        type="button"
        className={styles.unblock}
        disabled={unblock.isPending}
        onClick={() => unblock.mutate(contactId)}
      >
        {moderationTexts.unblock}
      </button>
      {unblock.isError && <FormError message={moderationTexts.failure} />}
    </>
  );
}

export function BlockedNotice({ block, contactId, handle }: BlockedNoticeProps) {
  const byMe = block === 'BY_ME';
  return (
    <div className={styles.area}>
      <div className={styles.notice} role="status">
        <Icon name="block" size={16} />
        <p className={styles.text}>
          {byMe ? moderationTexts.blockedByMe(handle) : moderationTexts.blockedByContact(handle)}
        </p>
        {byMe && <UnblockButton contactId={contactId} />}
      </div>
    </div>
  );
}
