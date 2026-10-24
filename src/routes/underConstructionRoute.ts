import { createElement } from 'react';
import type { RouteObject } from 'react-router';

import { UnderConstructionPage } from '@/components/UnderConstructionPage/UnderConstructionPage';

interface UnderConstructionRouteOptions {
  path: string;
  title: string;
  story: string;
}

export function underConstructionRoute({
  path,
  title,
  story,
}: UnderConstructionRouteOptions): RouteObject {
  return { path, element: createElement(UnderConstructionPage, { title, story }) };
}
