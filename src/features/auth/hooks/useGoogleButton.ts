import { type RefObject, useEffect, useEffectEvent, useRef, useState } from 'react';

import { type GoogleButtonOptions, loadGoogleIdentity } from '@/lib/google-identity';

const GOOGLE_BUTTON_WIDTH_IN_PX = 400;

const buttonOptions: GoogleButtonOptions = {
  theme: 'filled_black',
  size: 'large',
  text: 'continue_with',
  shape: 'rectangular',
  locale: 'pt-BR',
  width: GOOGLE_BUTTON_WIDTH_IN_PX,
};

export function useGoogleButton(
  clientId: string,
  onCredential: (idToken: string) => void,
): { containerRef: RefObject<HTMLDivElement | null>; unavailable: boolean } {
  const containerRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const handleCredential = useEffectEvent(onCredential);

  useEffect(() => {
    loadGoogleIdentity()
      .then((accountsId) => {
        accountsId.initialize({
          client_id: clientId,
          callback: ({ credential }) => handleCredential(credential),
        });
        if (containerRef.current) accountsId.renderButton(containerRef.current, buttonOptions);
      })
      .catch(() => setUnavailable(true));
  }, [clientId]);

  return { containerRef, unavailable };
}
