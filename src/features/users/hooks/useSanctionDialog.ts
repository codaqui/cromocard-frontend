import { useState } from 'react';

import type { SanctionSavedKind } from '../components/SanctionDialog/SanctionDialog';
import { userActionMessages } from '../users.labels';
import type { UserDetail } from '../users.types';

const savedMessageFor: Record<SanctionSavedKind, string> = {
  warn: userActionMessages.warned,
  suspend: userActionMessages.suspended,
  block: userActionMessages.blocked,
};

export function useSanctionDialog() {
  const [target, setTarget] = useState<UserDetail | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  return {
    target,
    open: (user: UserDetail) => setTarget(user),
    close: () => setTarget(null),
    saved: (kind: SanctionSavedKind) => {
      setToastMessage(savedMessageFor[kind]);
      setTarget(null);
    },
    toastMessage,
    dismissToast: () => setToastMessage(null),
  };
}
