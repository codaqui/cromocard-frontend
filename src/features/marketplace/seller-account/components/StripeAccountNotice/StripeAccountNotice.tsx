import { useId } from 'react';

import { Button } from '@/components/Button/Button';
import { cn } from '@/utils/cn';

import type { NoticeContent } from '../../seller-account.labels';
import styles from './StripeAccountNotice.module.css';

interface StripeAccountNoticeProps {
  notice: NoticeContent;
  /** Id da ajuda, para o "Criar Novo Anúncio" desabilitado apontar o motivo com `aria-describedby`. */
  helpId: string;
  isRedirecting: boolean;
  onAction: () => void;
}

type NoticeActionProps = Omit<StripeAccountNoticeProps, 'helpId'>;

function NoticeAction({ notice, isRedirecting, onAction }: NoticeActionProps) {
  if (notice.kind === 'badge') return <span className={styles.badge}>{notice.badge}</span>;

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

export function StripeAccountNotice({ helpId, ...props }: StripeAccountNoticeProps) {
  const { notice } = props;
  const titleId = useId();

  return (
    <section className={cn(styles.notice, styles[notice.tone])} aria-labelledby={titleId}>
      <div className={styles.text}>
        <h2 id={titleId} className={styles.title}>
          {notice.title}
        </h2>
        <p id={helpId} className={styles.help}>
          {notice.help}
        </p>
      </div>
      <NoticeAction {...props} />
    </section>
  );
}
