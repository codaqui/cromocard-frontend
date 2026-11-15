import type { RouteObject } from 'react-router';

/**
 * Carrega antes os módulos das rotas `lazy()`. Sem isso, o primeiro `findBy*` de um spec paga a importação da página
 * e, com a suíte em paralelo e com cobertura, passa do tempo de espera, deixando o teste instável.
 */
export async function preloadLazyRoutes(routes: RouteObject[]): Promise<void> {
  const loaders = routes.flatMap((route) => [
    ...(typeof route.lazy === 'function' ? [route.lazy()] : []),
    preloadLazyRoutes(route.children ?? []),
  ]);
  await Promise.all(loaders);
}
