import { Navigate } from 'react-router';

import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useRunOnce } from '@/hooks/useRunOnce';
import { paths } from '@/routes/paths';

import { useStripeOnboarding } from '../../seller-account.queries';
import type { SellerOverviewState } from '../SellerOverviewPage/SellerOverviewPage';

const goTo = (url: string) => window.location.replace(url);

const onboardingFailed: SellerOverviewState = { onboardingError: true };

export function StripeRefreshPage() {
  const { mutate, isError } = useStripeOnboarding(goTo);
  useRunOnce(mutate);

  if (isError) return <Navigate to={paths.seller.overview} replace state={onboardingFailed} />;
  return <LoadingState message="Abrindo de novo o cadastro na Stripe…" />;
}
