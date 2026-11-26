import { Navigate } from 'react-router';

import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useRunOnce } from '@/hooks/useRunOnce';
import { paths } from '@/routes/paths';

import { useRefreshStripeAccount } from '../../seller-account.queries';

export function StripeReturnPage() {
  const { mutate, isIdle, isPending } = useRefreshStripeAccount();
  useRunOnce(mutate);

  if (isIdle || isPending) return <LoadingState message="Conferindo o seu cadastro na Stripe…" />;
  return <Navigate to={paths.seller.overview} replace />;
}
