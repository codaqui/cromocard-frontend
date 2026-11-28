import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import { Icon } from '@/components/Icon/Icon';
import { Modal } from '@/components/Modal/Modal';

import { handleOrName } from '../../chat.format';
import { moderationOptions, moderationTexts } from '../../moderation/contact-moderation.labels';
import styles from './ContactModerationDialog.module.css';
import { ContactCard } from './ContactCard';
import { DialogBadge } from './DialogBadge';
import type { ContactModerationDialogProps } from './dialog-props';
import { ModerationFields } from './ModerationFields';
import { UnblockPanel } from './UnblockPanel';
import { useContactModeration } from './useContactModeration';

function ModerationFooter({
  props,
  moderation,
}: {
  props: ContactModerationDialogProps;
  moderation: ReturnType<typeof useContactModeration>;
}) {
  return (
    <>
      <p className={styles.footerNote}>{moderationTexts.footer}</p>
      <Button variant="secondary" className={styles.footerButton} onClick={props.onClose}>
        {moderationTexts.cancel}
      </Button>
      <Button
        variant="danger"
        className={styles.dangerButton}
        disabled={moderation.pending}
        onClick={() => void moderation.submit()}
      >
        <Icon name="block" size={14} />
        {moderationOptions[moderation.form.watch('option')].action}
      </Button>
    </>
  );
}

function ModerationDialog(props: ContactModerationDialogProps) {
  const { conversation, onClose, onDone } = props;
  const moderation = useContactModeration(conversation, onDone);
  return (
    <Modal
      open
      variant="dense"
      size="narrow"
      icon={<DialogBadge />}
      title={moderationTexts.title(handleOrName(conversation.contact))}
      subtitle={moderationTexts.subtitle}
      onClose={onClose}
      footer={<ModerationFooter props={props} moderation={moderation} />}
    >
      <div className={styles.body}>
        <ContactCard conversation={conversation} />
        <ModerationFields moderation={moderation} />
        <FormError message={moderation.failure} />
      </div>
    </Modal>
  );
}

export type { ContactModerationDialogProps };

export function ContactModerationDialog(props: ContactModerationDialogProps) {
  if (props.conversation.block === 'BY_ME') return <UnblockPanel {...props} />;
  return <ModerationDialog {...props} />;
}
