import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import { Modal } from '@/components/Modal/Modal';

import type { ConversationSummary } from '../../chat.types';
import { handleOrName } from '../../chat.format';
import { moderationTexts } from '../../moderation/contact-moderation.labels';
import { useUnblockContact } from '../../moderation/contact-moderation.queries';
import { ContactCard } from './ContactCard';
import styles from './ContactModerationDialog.module.css';
import { DialogBadge } from './DialogBadge';
import type { ContactModerationDialogProps } from './dialog-props';

interface UnblockFooterProps {
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function UnblockFooter({ pending, onCancel, onConfirm }: UnblockFooterProps) {
  return (
    <>
      <Button variant="secondary" className={styles.footerButton} onClick={onCancel}>
        {moderationTexts.cancel}
      </Button>
      <Button className={styles.footerButton} disabled={pending} onClick={onConfirm}>
        {moderationTexts.unblock}
      </Button>
    </>
  );
}

function UnblockBody({
  conversation,
  failed,
}: {
  conversation: ConversationSummary;
  failed: boolean;
}) {
  return (
    <div className={styles.body}>
      <ContactCard conversation={conversation} />
      <p className={styles.blockedState}>
        <strong>{moderationTexts.blockedTitle(handleOrName(conversation.contact))}</strong>
        {moderationTexts.blockedMessage}
      </p>
      <FormError message={failed ? moderationTexts.failure : undefined} />
    </div>
  );
}

export function UnblockPanel({ conversation, onClose, onDone }: ContactModerationDialogProps) {
  const unblock = useUnblockContact();
  const confirm = () =>
    unblock.mutate(conversation.contact.id, {
      onSuccess: () =>
        onDone({ title: moderationTexts.unblocked, detail: moderationTexts.unblockedDetail }),
    });
  const footer = (
    <UnblockFooter pending={unblock.isPending} onCancel={onClose} onConfirm={confirm} />
  );
  return (
    <Modal
      open
      variant="dense"
      size="narrow"
      icon={<DialogBadge />}
      title={moderationTexts.title(handleOrName(conversation.contact))}
      subtitle={moderationTexts.subtitle}
      onClose={onClose}
      footer={footer}
    >
      <UnblockBody conversation={conversation} failed={unblock.isError} />
    </Modal>
  );
}
