import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import { handleOf } from '../../chat.format';
import { chatTexts, replyingTo } from '../../chat.labels';
import type { QuotedMessage } from '../../chat.types';
import styles from './MessageQuote.module.css';

interface MessageQuoteProps {
  quote: QuotedMessage;
  mine: boolean;
}

export function MessageQuote({ quote, mine }: MessageQuoteProps) {
  const handle = handleOf(quote.authorUsername);
  return (
    <blockquote className={cn(styles.quote, mine && styles.mine)}>
      <span className={styles.bar} aria-hidden="true" />
      <div className={styles.body}>
        <p className={styles.title}>
          <Icon name="reply" size={10} />
          {handle ? replyingTo(handle) : chatTexts.reply}
        </p>
        <p className={styles.text}>
          {quote.unavailable ? chatTexts.quoteUnavailable : `"${quote.content}"`}
        </p>
      </div>
    </blockquote>
  );
}
