import { createElement } from 'react';
import type { RouteObject } from 'react-router';

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
  return {
    path,
    lazy: async () => {
      const { UnderConstructionPage } = await import('./UnderConstructionPage');
      return { element: createElement(UnderConstructionPage, { title, story }) };
    },
  };
}
