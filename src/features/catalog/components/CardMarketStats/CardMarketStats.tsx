import { Button } from '@/components/Button/Button';
import { formatPrice } from '@/features/marketplace';

import type { CardProfile } from '../../card-profile.types';
import styles from './CardMarketStats.module.css';

interface CardMarketStatsProps {
  market: CardProfile['market'];
  isGuest: boolean;
  onSeeListings: () => void;
  onAddToCollection: () => void;
  onFavorite: () => void;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={styles.stat}>
      <dt className={styles.label}>{label}</dt>
      <dd className={accent ? styles.accent : styles.value}>{value}</dd>
    </div>
  );
}

const GUEST_NOTICE =
  'Ainda não tem conta? Você pode ver tudo nesta página; para comprar, favoritar ou adicionar à coleção, basta entrar.';

export function CardMarketStats({ market, isGuest, ...actions }: CardMarketStatsProps) {
  return (
    <section className={styles.market} aria-label="Mercado">
      <dl className={styles.stats}>
        <Stat label="Preço médio de mercado" value={formatPrice(market.averagePrice)} />
        <Stat label="Menor anúncio" value={formatPrice(market.lowestListingPrice)} accent />
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
