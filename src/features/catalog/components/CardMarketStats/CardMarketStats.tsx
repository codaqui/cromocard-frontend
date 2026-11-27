import { Button } from '@/components/Button/Button';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/formatCurrency';

import type { CardProfile } from '../../card-profile.types';
import styles from './CardMarketStats.module.css';

interface CardMarketStatsProps {
  market: CardProfile['market'];
  isGuest: boolean;
  onSeeListings: () => void;
  onAddToCollection: () => void;
  onFavorite: () => void;
}

interface StatProps {
  label: string;
  value: string;
  tone?: 'default' | 'highlight';
}

function Stat({ label, value, tone = 'default' }: StatProps) {
  return (
    <div className={styles.stat}>
      <dt className={styles.label}>{label}</dt>
      <dd className={cn(styles.value, styles[tone])}>{value}</dd>
    </div>
  );
}

const GUEST_NOTICE =
  'Ainda não tem conta? Você pode ver tudo nesta página; para comprar, favoritar ou adicionar à coleção, basta entrar.';

export function CardMarketStats({ market, isGuest, ...actions }: CardMarketStatsProps) {
  return (
    <section className={styles.market} aria-label="Mercado">
      <dl className={styles.stats}>
        <Stat label="Preço médio de mercado" value={formatCurrency(market.averagePrice)} />
        <Stat
          label="Menor anúncio"
          value={formatCurrency(market.lowestListingPrice)}
          tone="highlight"
        />
        <Stat label="Anúncios ativos" value={String(market.activeListingsCount)} />
      </dl>
      <div className={styles.actions}>
        <Button onClick={actions.onSeeListings}>Ver anúncios ({market.activeListingsCount})</Button>
        <Button variant="secondary" onClick={actions.onAddToCollection}>
          Adicionar à coleção
        </Button>
        <Button variant="secondary" onClick={actions.onFavorite}>
          Favoritar
        </Button>
      </div>
      {isGuest && <p className={styles.notice}>{GUEST_NOTICE}</p>}
    </section>
  );
}
