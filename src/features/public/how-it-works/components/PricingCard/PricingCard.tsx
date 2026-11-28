import { useId } from 'react';

import { ButtonLink } from '@/components/ButtonLink/ButtonLink';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

import styles from './PricingCard.module.css';

function Rate({ label, value, tone }: { label: string; value: string; tone: 'buy' | 'sell' }) {
  return (
    <div className={styles.rate}>
      <dt className={styles.rateLabel}>{label}</dt>
      <dd className={cn(styles.rateValue, styles[tone])}>{value}</dd>
    </div>
  );
}

export function PricingCard() {
  const titleId = useId();

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <div className={styles.copy}>
        <h2 id={titleId} className={styles.title}>
          Quanto custa?
        </h2>
        <p className={styles.text}>
          Criar conta e anunciar é grátis. Cobramos 5% do valor da carta em cada venda concluída,
          descontados do vendedor.
        </p>
      </div>
      <dl className={styles.rates}>
        <Rate label="Para comprar" value="0%" tone="buy" />
        <Rate label="Por venda" value="5%" tone="sell" />
      </dl>
      <ButtonLink to={paths.register}>Criar conta grátis</ButtonLink>
    </section>
  );
}
