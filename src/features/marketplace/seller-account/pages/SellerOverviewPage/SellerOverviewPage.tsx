import { useId, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/Button/Button';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Toast } from '@/components/Toast/Toast';
import { paths } from '@/routes/paths';

import { StripeAccountNotice } from '../../components/StripeAccountNotice/StripeAccountNotice';
import { NOT_READY_REASON, noticeFor, ONBOARDING_ERROR } from '../../seller-account.labels';
import { useStripeAccount, useStripeOnboarding } from '../../seller-account.queries';
import { isStripeAccountReady } from '../../seller-account.status';
import type { StripeAccount } from '../../seller-account.types';
import styles from './SellerOverviewPage.module.css';

const goTo = (url: string) => window.location.assign(url);

/** Estado de navegação que a renovação do link (`StripeRefreshPage`) manda quando a Stripe falha. */
export interface SellerOverviewState {
  onboardingError?: boolean;
}

interface OverviewHeaderProps {
  isReady: boolean;
  /** Id do texto que explica por que o anúncio está bloqueado (a ajuda do aviso). */
  reasonId?: string;
}

function HeaderActions({ isReady, reasonId }: OverviewHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.actions}>
      <Button variant="secondary" onClick={() => void navigate(paths.seller.store)}>
        <Icon name="storefront" size={18} />
        Ver Loja Pública
      </Button>
      <Button
        className={styles.createListing}
        disabled={!isReady}
        title={isReady ? undefined : NOT_READY_REASON}
        aria-describedby={isReady ? undefined : reasonId}
      >
        <Icon name="addBox" size={18} />
        Criar Novo Anúncio
      </Button>
    </div>
  );
}

function OverviewHeader(props: OverviewHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>
          <span className={styles.dot} aria-hidden="true" />
          Vendedor
        </p>
        <h1 className={styles.title}>Visão geral</h1>
        <p className={styles.description}>Suas vendas, seus anúncios e o valor a receber.</p>
      </div>
      <HeaderActions {...props} />
    </header>
  );
}

function useInitialOnboardingError() {
  const state = useLocation().state as SellerOverviewState | null;
  return state?.onboardingError ? ONBOARDING_ERROR : null;
}

function AccountOverview({ account }: { account: StripeAccount }) {
  const helpId = useId();
  const [error, setError] = useState(useInitialOnboardingError);
  const onboarding = useStripeOnboarding(goTo);
  const notice = noticeFor(account);

  const start = () => onboarding.mutate(undefined, { onError: () => setError(ONBOARDING_ERROR) });

  return (
    <>
      <OverviewHeader isReady={isStripeAccountReady(account.status)} reasonId={helpId} />
      {notice && (
        <StripeAccountNotice
          notice={notice}
          helpId={helpId}
          isRedirecting={onboarding.isPending}
          onAction={start}
        />
      )}
      <Toast message={error} tone="danger" placement="top" onDismiss={() => setError(null)} />
    </>
  );
}

function AccountLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <>
      <OverviewHeader isReady={false} />
      <div className={styles.error}>
        <ErrorState
          title="Não foi possível carregar a sua conta de recebimento"
          message="Tente de novo em instantes."
        />
        <Button variant="secondary" onClick={onRetry}>
          Tentar de novo
        </Button>
      </div>
    </>
  );
}

function OverviewContent() {
  const query = useStripeAccount();

  if (query.isPending) return <LoadingState message="Carregando a sua conta de vendedor…" />;
  if (query.isError) return <AccountLoadError onRetry={() => void query.refetch()} />;
  return <AccountOverview account={query.data} />;
}

export function SellerOverviewPage() {
  return (
    <div className={styles.page}>
      <OverviewContent />
    </div>
  );
}
