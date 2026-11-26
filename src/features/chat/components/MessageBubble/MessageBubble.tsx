import type { KeyboardEvent } from 'react';

import { cn } from '@/utils/cn';

import { timeOf } from '../../chat.format';
import type { ChatMessage } from '../../chat.types';
import { ContactAvatar } from '../ContactAvatar/ContactAvatar';
import { MessageMenu } from '../MessageMenu/MessageMenu';
import { MessageQuote } from '../MessageQuote/MessageQuote';
import styles from './MessageBubble.module.css';

export interface MessageBubbleProps {
  message: ChatMessage;
  mine: boolean;
  unread: boolean;
  menuOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onReply: (message: ChatMessage) => void;
}

const opensMenu = (event: KeyboardEvent) => event.key === 'Enter' || event.key === ' ';

type BubbleContentProps = Pick<MessageBubbleProps, 'message' | 'unread' | 'mine'>;

function BubbleContent({ message, unread, mine }: BubbleContentProps) {
  return (
    <>
      {unread && <span className={styles.srOnly}>Não lida</span>}
      {message.replyTo && <MessageQuote quote={message.replyTo} mine={mine} />}
      <p className={styles.text}>{message.content}</p>
      <time className={styles.time} dateTime={message.createdAt}>
        {timeOf(message.createdAt)}
      </time>
    </>
  );
}

type BubbleButtonProps = Omit<MessageBubbleProps, 'onCloseMenu' | 'onReply'>;

function BubbleButton({ message, unread, mine, menuOpen, onOpenMenu }: BubbleButtonProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      className={cn(styles.bubble, unread && styles.unread, menuOpen && styles.selected)}
      onClick={onOpenMenu}
      onKeyDown={(event) => {
        if (!opensMenu(event)) return;
        event.preventDefault();
        onOpenMenu();
      }}
    >
      <BubbleContent message={message} unread={unread} mine={mine} />
    </div>
  );
}

export function MessageBubble({ onCloseMenu, onReply, ...bubble }: MessageBubbleProps) {
  const { message, menuOpen, mine } = bubble;
  return (
    <li className={cn(styles.row, mine && styles.mine)}>
      <ContactAvatar name={message.author.name} avatarUrl={null} size="small" />
      <div className={styles.anchor}>
        <BubbleButton {...bubble} />
        {menuOpen && (
          <MessageMenu mine={mine} onReply={() => onReply(message)} onClose={onCloseMenu} />
        )}
      </div>
    </li>
  );
}
