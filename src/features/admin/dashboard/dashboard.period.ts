import type { Period } from '@/components/PeriodFilter/PeriodFilter';

import type { DashboardPeriodParams } from './dashboard.types';

const BRASILIA_OFFSET = '-03:00';

export const DEFAULT_DASHBOARD_PERIOD: Period = { preset: '30d' };

export function toPeriodParams(period: Period): DashboardPeriodParams {
  if ('preset' in period) return { period: period.preset };

  return {
    from: `${period.from}T00:00:00${BRASILIA_OFFSET}`,
    to: `${period.to}T23:59:59${BRASILIA_OFFSET}`,
  };
}
