import { cn } from '@/utils/cn';

import { timeOf } from '../../chat.format';
import type { ChatMessage } from '../../chat.types';
import { ContactAvatar } from '../ContactAvatar/ContactAvatar';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: ChatMessage;
  mine: boolean;
  unread: boolean;
}

export function MessageBubble({ message, mine, unread }: MessageBubbleProps) {
  return (
    <li className={cn(styles.row, mine && styles.mine)}>
      <ContactAvatar name={message.author.name} avatarUrl={null} size="small" />
      <div className={cn(styles.bubble, unread && styles.unread)}>
        {unread && <span className={styles.srOnly}>Não lida</span>}
        <p className={styles.text}>{message.content}</p>
        <time className={styles.time} dateTime={message.createdAt}>
          {timeOf(message.createdAt)}
        </time>
      </div>
    </li>
  );
}
