import { useId } from 'react';

import { env } from '@/config/env';

import styles from './SupportCard.module.css';

export function SupportCard() {
  const titleId = useId();

  return (
    <aside className={styles.card} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        Não encontrou o que procurava?
      </h2>
      <p className={styles.text}>Nossa equipe responde em até 24h úteis.</p>
      <a className={styles.action} href={`mailto:${env.SUPPORT_EMAIL}`}>
        Enviar e-mail
      </a>
      <p className={styles.hours}>Seg. a sex., 9h às 18h</p>
    </aside>
  );
}
