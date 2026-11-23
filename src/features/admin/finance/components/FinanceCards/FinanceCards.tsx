import { useId } from 'react';

import { Button } from '@/components/Button/Button';
import { Icon } from '@/components/Icon/Icon';

import { formatCount, formatCurrency, splitCurrency } from '../../finance.format';
import type { FinanceSummary } from '../../finance.types';
import styles from './FinanceCards.module.css';

interface FinanceCardsProps {
  summary: FinanceSummary;
  isToday: boolean;
  onOpenLedger: () => void;
}

function SettledValue({ cents }: { cents: number }) {
  const { whole, fraction } = splitCurrency(cents);

  return (
    <p className={styles.value}>
      {whole}
      <span className={styles.fraction}>{fraction}</span>
    </p>
  );
}

function settledDescription({ hasMovement, settledOrders }: FinanceSummary, isToday: boolean) {
  if (!hasMovement) return 'Não houve movimentação no período.';
  const orders = settledOrders === 1 ? 'pedido liberado' : 'pedidos liberados';
  return `${formatCount(settledOrders)} ${orders} aos vendedores ${isToday ? 'hoje' : 'no período'}.`;
}

function Retained({ cents }: { cents: number }) {
  return (
    <div className={styles.retained}>
      <span className={styles.retainedLabel}>
        <Icon name="history" size={18} />
        Retido em Garantia
      </span>
      <span className={styles.retainedValue}>{formatCurrency(cents)}</span>
    </div>
  );
}

function CustodyHeading({ titleId }: { titleId: string }) {
  return (
    <header className={styles.heading}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name="accountBalance" size={18} />
      </span>
      <h2 id={titleId} className={styles.label}>
        Valor em custódia
      </h2>
    </header>
  );
}

export function FinanceCards({ summary, isToday, onOpenLedger }: FinanceCardsProps) {
  const titleId = useId();

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <CustodyHeading titleId={titleId} />
      <p className={styles.value}>{formatCurrency(summary.custodyCents)}</p>
      <p className={styles.description}>
        Pagamentos recebidos e ainda não liberados aos vendedores.
      </p>
      <h3 className={styles.subLabel}>{isToday ? 'Liquidado hoje' : 'Liquidado no período'}</h3>
      <SettledValue cents={summary.settledCents} />
      <p className={styles.description}>{settledDescription(summary, isToday)}</p>
      <Retained cents={summary.retainedCents} />
      <Button variant="secondary" className={styles.ledgerButton} onClick={onOpenLedger}>
        <Icon name="reports" size={16} />
        Ver Livro Razão de Hoje
      </Button>
    </section>
  );
}
