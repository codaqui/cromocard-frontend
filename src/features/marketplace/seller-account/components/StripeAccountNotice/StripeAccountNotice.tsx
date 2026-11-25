import { Button } from '@/components/Button/Button';
import { cn } from '@/utils/cn';

import type { NoticeContent } from '../../seller-account.labels';
import styles from './StripeAccountNotice.module.css';

interface StripeAccountNoticeProps {
  notice: NoticeContent;
  isRedirecting: boolean;
  onAction: () => void;
}

function NoticeAction({ notice, isRedirecting, onAction }: StripeAccountNoticeProps) {
  if (notice.badge) return <span className={styles.badge}>{notice.badge}</span>;

  return (
    <Button
      className={styles.action}
      onClick={onAction}
      disabled={isRedirecting}
      aria-busy={isRedirecting}
    >
      {isRedirecting ? 'Abrindo a Stripe…' : notice.action}
    </Button>
  );
}

export function StripeAccountNotice(props: StripeAccountNoticeProps) {
  const { notice } = props;

  return (
    <section
      className={cn(styles.notice, styles[notice.tone])}
      aria-labelledby="stripe-account-notice"
    >
      <div className={styles.text}>
        <h2 id="stripe-account-notice" className={styles.title}>
          {notice.title}
        </h2>
        <p className={styles.help}>{notice.help}</p>
      </div>
      <NoticeAction {...props} />
    </section>
  );
}
