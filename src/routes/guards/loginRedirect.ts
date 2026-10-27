import type { Location } from 'react-router';

import { paths } from '@/routes/paths';

export function loginPathFor({ pathname, search }: Pick<Location, 'pathname' | 'search'>): string {
  const params = new URLSearchParams({ redirect: `${pathname}${search}` });
  return `${paths.login}?${params.toString()}`;
}
