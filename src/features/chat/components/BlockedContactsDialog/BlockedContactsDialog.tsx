import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { FormError } from '@/components/FormError/FormError';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Modal } from '@/components/Modal/Modal';
import { Pagination } from '@/components/Pagination/Pagination';

import { handleOf } from '../../chat.format';
import { moderationTexts } from '../../moderation/contact-moderation.labels';
import { useBlockedContacts, useUnblockContact } from '../../moderation/contact-moderation.queries';
import type { BlockedContact } from '../../moderation/contact-moderation.types';
import { DialogBadge } from '../ContactModerationDialog/DialogBadge';
import styles from './BlockedContactsDialog.module.css';

export interface BlockedContactsDialogProps {
  onClose: () => void;
}

function BlockedRow({ contact }: { contact: BlockedContact }) {
  const unblock = useUnblockContact();
  return (
    <li className={styles.row}>
      <span className={styles.identity}>
        <span className={styles.name}>{contact.name}</span>
        <span className={styles.handle}>{handleOf(contact.username)}</span>
      </span>
      <Button
        variant="secondary"
        className={styles.unblock}
        disabled={unblock.isPending}
        aria-label={`${moderationTexts.unblock} ${contact.name}`}
        onClick={() => unblock.mutate(contact.userId)}
      >
        {moderationTexts.unblock}
      </Button>
      {unblock.isError && <FormError message={moderationTexts.failure} />}
    </li>
  );
}

function BlockedList() {
  const [page, setPage] = useState(1);
  const query = useBlockedContacts(page);
  if (query.isError) return <ErrorState message={moderationTexts.blockedContactsError} />;
  if (!query.data) return <LoadingState />;
  const { data, meta } = query.data;
  if (data.length === 0) return <p className={styles.empty}>{moderationTexts.noBlockedContacts}</p>;
  return (
    <>
      <p className={styles.count}>{moderationTexts.blockedCount(meta.total)}</p>
      <ul className={styles.list}>
        {data.map((contact) => (
          <BlockedRow key={contact.userId} contact={contact} />
        ))}
      </ul>
      {meta.totalPages > 1 && (
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
      )}
    </>
  );
}

export function BlockedContactsDialog({ onClose }: BlockedContactsDialogProps) {
  return (
    <Modal
      open
      variant="dense"
      size="narrow"
      icon={<DialogBadge />}
      title={moderationTexts.blockedContacts}
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          {moderationTexts.close}
        </Button>
      }
    >
      <BlockedList />
    </Modal>
  );
}
