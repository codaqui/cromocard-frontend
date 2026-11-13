import { useState } from 'react';

import { userActionMessages } from '../users.labels';
import type { UserSummary } from '../users.types';

type FormModalTarget = UserSummary | 'new' | null;

function userFor(target: FormModalTarget): UserSummary | null {
  return target === 'new' || target === null ? null : target;
}

export interface UserFormSavedResult {
  user: UserSummary;
  sendActivation: boolean;
}

export function useUserFormModal() {
  const [target, setTarget] = useState<FormModalTarget>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const saved = ({ user, sendActivation }: UserFormSavedResult) => {
    setToastMessage(
      target === 'new'
        ? userActionMessages.created(user.email, sendActivation)
        : userActionMessages.updated,
    );
    setTarget(null);
  };

  return {
    isOpen: target !== null,
    editingUser: userFor(target),
    openCreate: () => setTarget('new'),
    openEdit: (user: UserSummary) => setTarget(user),
    close: () => setTarget(null),
    saved,
    toastMessage,
    dismissToast: () => setToastMessage(null),
  };
}
