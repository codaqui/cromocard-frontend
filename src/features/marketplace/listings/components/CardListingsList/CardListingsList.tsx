import { useId } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/Button/Button';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { listingDetailPathFor, paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

import { EMPTY_VALUE, formatPrice, initialsOf } from '../../listings.format';
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

function ListingRow({ listing, highlighted }: { listing: ListingSummary; highlighted: boolean }) {
  return (
    <li className={styles.row}>
      <SellerCell username={listing.seller.username} />
      <span className={styles.condition}>
        {listing.condition ? (
          <span className={styles.conditionBadge}>{listing.condition.name}</span>
        ) : (
          EMPTY_VALUE
        )}
      </span>
      <span className={styles.price}>{formatPrice(listing.price)}</span>
      <Link
        to={listingDetailPathFor(listing.id)}
        className={cn(styles.view, highlighted && styles.viewPrimary)}
      >
        Ver anúncio
      </Link>
    </li>
  );
}

function EmptyListings({ canCreateListing }: { canCreateListing: boolean }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyText}>Ainda não há anúncios ativos para esta carta.</p>
      {canCreateListing && (
        <Link to={paths.newListing} className={cn(styles.view, styles.viewPrimary)}>
          Anunciar esta carta
        </Link>
      )}
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
      <span className={styles.actionColumn}>Ver anúncio</span>
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
      <ListingsColumns />
      <ul className={styles.list} aria-label="Anúncios disponíveis">
        {listings.map((listing, index) => (
          <ListingRow key={listing.id} listing={listing} highlighted={index === 0} />
        ))}
      </ul>
      {hasNextPage && (
        <LoadMoreButton loading={isFetchingNextPage} onLoad={() => void fetchNextPage()} />
      )}
    </>
  );
}

export function CardListingsList({ cardId, count, canCreateListing }: CardListingsListProps) {
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
