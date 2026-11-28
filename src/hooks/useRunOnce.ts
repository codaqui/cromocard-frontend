import { useEffect, useRef } from 'react';

/**
 * Roda `action` uma vez por montagem, mesmo com o efeito duplo do `StrictMode`. Serve para ação com
 * efeito fora do app (POST na API, redirecionamento), que não pode repetir.
 */
export function useRunOnce(action: () => void) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    action();
  }, [action]);
}
