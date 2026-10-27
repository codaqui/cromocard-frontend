import { vi } from 'vitest';

import type { GoogleAccountsId, GoogleCredentialResponse } from '@/lib/google-identity';

export function installFakeGoogleIdentity() {
  let callback: ((response: GoogleCredentialResponse) => void) | undefined;
  const initialize = vi.fn<GoogleAccountsId['initialize']>((config) => {
    callback = config.callback;
  });
  const renderButton = vi.fn<GoogleAccountsId['renderButton']>();
  window.google = { accounts: { id: { initialize, renderButton } } };

  return {
    initialize,
    renderButton,
    signInWith: (credential: string) => callback?.({ credential }),
  };
}
