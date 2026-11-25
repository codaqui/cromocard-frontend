import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Toast } from '@/components/Toast/Toast';

import { StripeAccountNotice } from '../../components/StripeAccountNotice/StripeAccountNotice';
import { NOT_READY_REASON, noticeFor, ONBOARDING_ERROR } from '../../seller-account.labels';
import {
  isStripeAccountReady,
  useStripeAccount,
  useStripeOnboarding,
} from '../../seller-account.queries';
import type { StripeAccount } from '../../seller-account.types';
import styles from './SellerOverviewPage.module.css';

const goTo = (url: string) => window.location.assign(url);

function OverviewHeader({ isReady }: { isReady: boolean }) {
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
      <Button disabled={!isReady} title={isReady ? undefined : NOT_READY_REASON}>
        <Icon name="addCircle" size={18} />
        Criar Novo Anúncio
      </Button>
    </header>
  );
}

function AccountNotice({ account }: { account: StripeAccount }) {
  const [error, setError] = useState<string | null>(null);
  const onboarding = useStripeOnboarding(goTo);
  const notice = noticeFor(account);
  if (!notice) return null;

  const start = () => onboarding.mutate(undefined, { onError: () => setError(ONBOARDING_ERROR) });

  return (
    <>
      <StripeAccountNotice notice={notice} isRedirecting={onboarding.isPending} onAction={start} />
      <Toast message={error} tone="danger" placement="top" onDismiss={() => setError(null)} />
    </>
  );
}

export function SellerOverviewPage() {
  const { data, isPending, isError } = useStripeAccount();

  if (isPending) return <LoadingState message="Carregando a sua conta de vendedor…" />;
  if (isError)
    return <ErrorState message="Não foi possível carregar a sua conta de recebimento." />;

  return (
    <div className={styles.page}>
      <OverviewHeader isReady={isStripeAccountReady(data.status)} />
      <AccountNotice account={data} />
    </div>
  );
}
