import { Link, useParams } from 'react-router';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Toast } from '@/components/Toast/Toast';
import { LoginRequiredDialog } from '@/features/auth';
import { CardListingsList } from '@/features/marketplace';
import { ApiError } from '@/lib/api-error';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

import { badgesOf, breadcrumbOf, galleryImagesOf, subtitleOf } from '../../card-profile.format';
import { useCardProfile } from '../../card-profile.queries';
import type { CardProfile } from '../../card-profile.types';
import { CardGallery } from '../../components/CardGallery/CardGallery';
import { CardIdentification } from '../../components/CardIdentification/CardIdentification';
import { CardMarketStats } from '../../components/CardMarketStats/CardMarketStats';
import { useCardProfileActions } from '../../hooks/useCardProfileActions';
import styles from './CardProfilePage.module.css';

const HTTP_NOT_FOUND = 404;

function CardNotFound() {
  return (
    <EmptyState
      title="Carta não encontrada"
      message="Esta carta não existe ou não está disponível."
    >
      <Link to={paths.home}>Voltar para o marketplace</Link>
    </EmptyState>
  );
}

function CardHeading({ card }: { card: CardProfile }) {
  return (
    <div className={styles.heading}>
      <ul className={styles.badges} aria-label="Selos">
        {badgesOf(card).map(({ kind, label }) => (
          <li key={kind} className={cn(styles.badge, kind === 'rarity' && styles.rarity)}>
            {label}
          </li>
        ))}
      </ul>
      <h1 className={styles.name}>{card.name}</h1>
      <p className={styles.subtitle}>{subtitleOf(card)}</p>
    </div>
  );
}

function PriceHistoryPlaceholder() {
  return (
    <section className={styles.history} aria-labelledby="historico-de-precos">
      <h2 id="historico-de-precos" className={styles.sectionTitle}>
        Histórico de preços
      </h2>
      <p className={styles.muted}>Em breve, o histórico de preços desta carta.</p>
    </section>
  );
}

type CardProfileActions = ReturnType<typeof useCardProfileActions>;

function CardProfileOverlays({ actions }: { actions: CardProfileActions }) {
  return (
    <>
      <LoginRequiredDialog open={actions.loginOpen} onClose={actions.closeLogin} />
      <Toast message={actions.notice} tone="warning" onDismiss={actions.dismissNotice} />
    </>
  );
}

function CardDetails({ card, actions }: { card: CardProfile; actions: CardProfileActions }) {
  return (
    <div className={styles.details}>
      <CardHeading card={card} />
      <CardMarketStats
        market={card.market}
        isGuest={!actions.user}
        onSeeListings={actions.onSeeListings}
        onAddToCollection={actions.onAddToCollection}
        onFavorite={actions.onFavorite}
      />
      <CardIdentification identification={card.identification} />
    </div>
  );
}

function CardProfileContent({ card }: { card: CardProfile }) {
  const actions = useCardProfileActions();

  return (
    <article className={styles.page}>
      <nav aria-label="Caminho" className={styles.breadcrumb}>
        {breadcrumbOf(card).join(' / ')}
      </nav>
      <div className={styles.top}>
        <CardGallery name={card.name} images={galleryImagesOf(card)} />
        <CardDetails card={card} actions={actions} />
      </div>
      <PriceHistoryPlaceholder />
      <CardListingsList
        cardId={card.id}
        count={card.market.activeListingsCount}
        canCreateListing={actions.user?.role === 'SELLER'}
      />
      <CardProfileOverlays actions={actions} />
    </article>
  );
}

export function CardProfilePage() {
  const { id = '' } = useParams();
  const { data, isPending, error } = useCardProfile(id);

  if (isPending) return <LoadingState message="Carregando carta…" />;
  if (error instanceof ApiError && error.status === HTTP_NOT_FOUND) return <CardNotFound />;
  if (!data) return <ErrorState message="Não foi possível carregar a carta." />;
  return <CardProfileContent card={data} />;
}
