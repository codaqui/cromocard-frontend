import { useEffect } from 'react';
import { Navigate } from 'react-router';

import { LoadingState } from '@/components/LoadingState/LoadingState';
import { paths } from '@/routes/paths';

import { useStripeOnboarding } from '../../seller-account.queries';

const goTo = (url: string) => window.location.replace(url);

export function StripeRefreshPage() {
  const { mutate, isError } = useStripeOnboarding(goTo);

  useEffect(() => {
    mutate();
  }, [mutate]);

  if (isError) return <Navigate to={paths.seller.overview} replace />;
  return <LoadingState message="Abrindo de novo o cadastro na Stripe…" />;
}
