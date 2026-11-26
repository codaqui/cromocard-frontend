import { Icon } from '@/components/Icon/Icon';

import { handleOf } from '../../chat.format';
import { chatTexts, replyingTo } from '../../chat.labels';
import type { ChatMessage } from '../../chat.types';
import styles from './ReplyPreview.module.css';

interface ReplyPreviewProps {
  message: ChatMessage;
  onCancel: () => void;
}

export function ReplyPreview({ message, onCancel }: ReplyPreviewProps) {
  const handle = handleOf(message.author.username) || message.author.name;
  return (
    <div className={styles.preview}>
      <span className={styles.bar} aria-hidden="true" />
      <span className={styles.icon}>
        <Icon name="reply" size={14} />
      </span>
      <div className={styles.body}>
        <p className={styles.title}>{replyingTo(handle)}:</p>
        <p className={styles.quote}>"{message.content}"</p>
      </div>
      <button
        type="button"
        className={styles.cancel}
        aria-label={chatTexts.cancelReply}
        onClick={onCancel}
      >
        ×
      </button>
    </div>
  );
}
