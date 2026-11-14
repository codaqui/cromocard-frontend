import { useId } from 'react';

import { SELLER_REGISTRATIONS_ANCHOR } from '../SellerRegistrationsTable/SellerRegistrationsTable';
import styles from './SellerCredentialingCard.module.css';

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
});

interface SellerCredentialingCardProps {
  approved: number;
  pending: number;
  conversionRate: number;
}

function Metrics({ approved, pending }: { approved: number; pending: number }) {
  return (
    <div className={styles.metrics}>
      <div>
        <p className={styles.metricLabel}>Aprovados</p>
        <p className={styles.metricValue}>{approved}</p>
      </div>
      <div>
        <p className={styles.metricLabel}>Pendentes</p>
        <p className={styles.metricValue}>{pending}</p>
      </div>
    </div>
  );
}

export function SellerCredentialingCard({
  approved,
  pending,
  conversionRate,
}: SellerCredentialingCardProps) {
  const labelId = useId();

  return (
    <section className={styles.card} aria-labelledby={labelId}>
      <h2 id={labelId} className={styles.label}>
        Lojistas &amp; Credenciamento
      </h2>
      <p className={styles.value}>
        {percentFormatter.format(conversionRate)}
        <span className={styles.unit}> de conversão</span>
      </p>
      <Metrics approved={approved} pending={pending} />
      <a href={`#${SELLER_REGISTRATIONS_ANCHOR}`} className={styles.link}>
        Analisar Fila
      </a>
    </section>
  );
}
