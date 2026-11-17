import { useState } from 'react';

import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { Select } from '@/components/Select/Select';

import { useReactivateUser, useSuspendUser } from '../../users.queries';
import { SUSPENSION_DAY_OPTIONS, type SuspensionDays, type UserSummary } from '../../users.types';

const DEFAULT_SUSPENSION_DAYS: SuspensionDays = 7;
const suspensionDayOptions = SUSPENSION_DAY_OPTIONS.map((days) => ({
  value: String(days),
  label: `${days} dias`,
}));

interface SuspendUserDialogProps {
  user: UserSummary | null;
  onClose: () => void;
  onSaved: () => void;
}

interface SuspendCopy {
  title: string;
  message: string;
  confirmLabel: string;
  tone: 'primary' | 'danger';
}

function statusLabelFor(user: UserSummary): string {
  return user.status === 'BLOCKED' ? 'Bloqueado' : 'Suspenso';
}

function copyFor(user: UserSummary): SuspendCopy {
  if (user.status !== 'ACTIVE') {
    return {
      title: 'Reativar usuário?',
      message: `${user.name}${user.username ? ` (@${user.username})` : ''} está ${statusLabelFor(user)}. Ao reativar, o status volta para Ativo e a ação fica registrada no log de auditoria.`,
      confirmLabel: 'Reativar usuário',
      tone: 'primary',
    };
  }

  return {
    title: 'Suspender usuário',
    message: `${user.name} não poderá entrar enquanto estiver suspenso.`,
    confirmLabel: 'Suspender',
    tone: 'danger',
  };
}

interface SuspendUserDialogContentProps {
  user: UserSummary;
  onClose: () => void;
  onSaved: () => void;
}

function SuspensionDaysField({
  days,
  onChange,
}: {
  days: SuspensionDays;
  onChange: (days: SuspensionDays) => void;
}) {
  return (
    <Select
      label="Prazo da suspensão"
      options={suspensionDayOptions}
      value={String(days)}
      onChange={(event) => onChange(Number(event.target.value) as SuspensionDays)}
    />
  );
}

function useSuspendOrReactivate(user: UserSummary, onSaved: () => void) {
  const isReactivating = user.status !== 'ACTIVE';
  const [days, setDays] = useState<SuspensionDays>(DEFAULT_SUSPENSION_DAYS);
  const suspendUser = useSuspendUser();
  const reactivateUser = useReactivateUser();
  const mutation = isReactivating ? reactivateUser : suspendUser;

  const confirm = (reason = '') => {
    if (isReactivating) {
      reactivateUser.mutate(user.id, { onSuccess: onSaved });
      return;
    }
    suspendUser.mutate({ id: user.id, input: { reason, days } }, { onSuccess: onSaved });
  };

  return { isReactivating, mutation, confirm, days, setDays };
}

function SuspendUserDialogContent({ user, onClose, onSaved }: SuspendUserDialogContentProps) {
  const { isReactivating, mutation, confirm, days, setDays } = useSuspendOrReactivate(
    user,
    onSaved,
  );
  const copy = copyFor(user);

  return (
    <ConfirmDialog
      open
      title={copy.title}
      message={copy.message}
      confirmLabel={copy.confirmLabel}
      tone={copy.tone}
      requireReason={!isReactivating}
      extraFields={
        isReactivating ? undefined : <SuspensionDaysField days={days} onChange={setDays} />
      }
      isConfirming={mutation.isPending}
      errorMessage={mutation.error?.message}
      onConfirm={confirm}
      onCancel={onClose}
    />
  );
}

export function SuspendUserDialog({ user, ...props }: SuspendUserDialogProps) {
  if (!user) return null;
  return <SuspendUserDialogContent user={user} {...props} />;
}
