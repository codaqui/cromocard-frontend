import { useId } from 'react';

import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { ButtonLink } from '@/components/Button/ButtonLink';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { listingDetailPathFor, paths } from '@/routes/paths';
import { EMPTY_VALUE, formatCurrency } from '@/utils/formatCurrency';

import { initialsOf } from '../../listings.format';
import { useCardListings } from '../../listings.queries';
import type { ListingSummary } from '../../listings.types';
import styles from './CardListingsList.module.css';

export const CARD_LISTINGS_SECTION_ID = 'anuncios';

interface CardListingsListProps {
  cardId: string;
  count: number;
  canCreateListing: boolean;
}

function SellerCell({ username }: { username: string | null }) {
  return (
    <span className={styles.seller}>
      <span className={styles.avatar} aria-hidden="true">
        {initialsOf(username)}
      </span>
      <span className={styles.username}>{username ?? EMPTY_VALUE}</span>
    </span>
  );
}

function ConditionCell({ condition }: { condition: ListingSummary['condition'] }) {
  return (
    <span className={styles.condition}>
      <span className={styles.cellLabel}>Condição</span>
      {condition ? (
        <Badge shape="tag" tone="info">
          {condition.name}
        </Badge>
      ) : (
        EMPTY_VALUE
      )}
    </span>
  );
}

function ListingRow({ listing, highlighted }: { listing: ListingSummary; highlighted: boolean }) {
  return (
    <li className={styles.row}>
      <SellerCell username={listing.seller.username} />
      <ConditionCell condition={listing.condition} />
      <span className={styles.price}>
        <span className={styles.cellLabel}>Preço</span>
        <span>{formatCurrency(listing.price)}</span>
      </span>
      <ButtonLink
        to={listingDetailPathFor(listing.id)}
        variant={highlighted ? 'primary' : 'secondary'}
        className={styles.view}
      >
        Ver anúncio
      </ButtonLink>
    </li>
  );
}

function EmptyListings({ canCreateListing }: { canCreateListing: boolean }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyText}>Ainda não há anúncios ativos para esta carta.</p>
      {canCreateListing && <ButtonLink to={paths.newListing}>Anunciar esta carta</ButtonLink>}
    </div>
  );
}

function SortSelect() {
  const id = useId();
  return (
    <div className={styles.sort}>
      <label htmlFor={id} className={styles.sortLabel}>
        Ordenar:
      </label>
      <select id={id} className={styles.sortSelect} defaultValue="price">
        <option value="price">Menor preço</option>
      </select>
    </div>
  );
}

function ListingsHeader({ count }: { count: number }) {
  return (
    <header className={styles.header}>
      <div>
        <h2 className={styles.title}>Anúncios disponíveis ({count})</h2>
        <p className={styles.subtitle}>Pagamento retido pela CromoCard até você receber a carta</p>
      </div>
      <SortSelect />
    </header>
  );
}

function ListingsColumns() {
  return (
    <div className={styles.columns} aria-hidden="true">
      <span>Vendedor</span>
      <span>Condição</span>
      <span>Preço</span>
      <span />
    </div>
  );
}

function LoadMoreButton({ loading, onLoad }: { loading: boolean; onLoad: () => void }) {
  return (
    <Button variant="secondary" className={styles.more} disabled={loading} onClick={onLoad}>
      Carregar mais
    </Button>
  );
}

function ListingsTable({ cardId }: { cardId: string }) {
  const { data, isPending, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCardListings(cardId);
  if (isPending) return <LoadingState message="Carregando anúncios…" />;
  if (isError) return <ErrorState message="Não foi possível carregar os anúncios." />;
  const listings = data.pages.flatMap((page) => page.data);

  return (
    <>
      <div className={styles.table}>
        <ListingsColumns />
        <ul className={styles.list} aria-label="Anúncios disponíveis">
          {listings.map((listing, index) => (
            <ListingRow key={listing.id} listing={listing} highlighted={index === 0} />
          ))}
        </ul>
      </div>
      {hasNextPage && (
        <LoadMoreButton loading={isFetchingNextPage} onLoad={() => void fetchNextPage()} />
      )}
    </>
  );
}

function useTotalFromListOrProfile(cardId: string, profileCount: number): number {
  const { data } = useCardListings(cardId);
  return data?.pages[0]?.meta.total ?? profileCount;
}

export function CardListingsList({
  cardId,
  count: profileCount,
  canCreateListing,
}: CardListingsListProps) {
  const count = useTotalFromListOrProfile(cardId, profileCount);
  return (
    <section id={CARD_LISTINGS_SECTION_ID} className={styles.section}>
      <ListingsHeader count={count} />
      {count === 0 ? (
        <EmptyListings canCreateListing={canCreateListing} />
      ) : (
        <ListingsTable cardId={cardId} />
      )}
    </section>
  );
}
