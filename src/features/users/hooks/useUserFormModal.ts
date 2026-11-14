import { useState } from 'react';

import { userActionMessages } from '../users.labels';
import type { EditableUser, UserSummary } from '../users.types';
type FormModalTarget = EditableUser | 'new' | null;

function userFor(target: FormModalTarget): EditableUser | null {
  return target === 'new' || target === null ? null : target;
}

export interface UserFormSavedResult {
  user: UserSummary;
  sendActivation: boolean;
}

function updatedMessageFor(activationResent: boolean): string {
  return activationResent ? userActionMessages.activationResent : userActionMessages.updated;
}

export function useUserFormModal() {
  const [target, setTarget] = useState<FormModalTarget>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const saved = ({ user, sendActivation }: UserFormSavedResult) => {
    setToastMessage(
      target === 'new'
        ? userActionMessages.created(user.email, sendActivation)
        : updatedMessageFor(sendActivation),
    );
    setTarget(null);
  };

  return {
    isOpen: target !== null,
    editingUser: userFor(target),
    openCreate: () => setTarget('new'),
    openEdit: (user: EditableUser) => setTarget(user),
    close: () => setTarget(null),
    saved,
    toastMessage,
    dismissToast: () => setToastMessage(null),
  };
}
