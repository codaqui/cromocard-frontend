import { useMemo, useRef, useState } from 'react';

import { toApiError } from '@/lib/api-error';

import { CancelScheduleDialog } from '../../components/CancelScheduleDialog/CancelScheduleDialog';
import { DispatchHistory } from '../../components/DispatchHistory/DispatchHistory';
import { DispatchResultDialog } from '../../components/DispatchResultDialog/DispatchResultDialog';
import { NotificationForm } from '../../components/NotificationForm/NotificationForm';
import { NotificationPreview } from '../../components/NotificationPreview/NotificationPreview';
import { NotificationsHeader } from '../../components/NotificationsHeader/NotificationsHeader';
import {
  useCancelSchedule,
  useDispatchNotification,
  useRecipientsCount,
} from '../../global-notifications.queries';
import type { GlobalNotification, RecipientsCount } from '../../global-notifications.types';
import { useNotificationForm } from '../../hooks/useNotificationForm';
import styles from './GlobalNotificationPage.module.css';

function useScheduleCancellation() {
  const cancel = useCancelSchedule();
  const [target, setTarget] = useState<GlobalNotification | null>(null);
  const close = () => {
    setTarget(null);
    cancel.reset();
  };
  return {
    dispatch: target,
    open: setTarget,
    onClose: close,
    isCanceling: cancel.isPending,
    errorMessage: cancel.error?.message,
    onConfirm: () => target && cancel.mutate(target.id, { onSuccess: close }),
  };
}

/** Disparo: o formulário, o envio e o modal de sucesso. */
function useDispatchFlow(counts: RecipientsCount | undefined) {
  const dispatch = useDispatchNotification();
  const apiError = useMemo(
    () => (dispatch.error ? toApiError(dispatch.error) : null),
    [dispatch.error],
  );
  const [result, setResult] = useState<GlobalNotification | null>(null);
  const form = useNotificationForm({
    counts,
    apiError,
    onSubmit: (input) =>
      dispatch.mutate(input, {
        onSuccess: (created) => {
          setResult(created);
          form.clear();
        },
      }),
  });
  return { form, result, closeResult: () => setResult(null), isSending: dispatch.isPending };
}

/** Fecha o modal e leva ao histórico, depois que o modal devolve o foco ao botão de envio. */
function useSeeHistory(closeResult: () => void) {
  const historyRef = useRef<HTMLElement>(null);
  const seeHistory = () => {
    closeResult();
    requestAnimationFrame(() => {
      historyRef.current?.scrollIntoView({ behavior: 'smooth' });
      historyRef.current?.focus({ preventScroll: true });
    });
  };
  return { historyRef, seeHistory };
}

/** Notificação Global em /backoffice/notifications (CCD060, com a CCD100 e a CCD101). */
export function GlobalNotificationPage() {
  const counts = useRecipientsCount().data;
  const { form, result, closeResult, isSending } = useDispatchFlow(counts);
  const cancellation = useScheduleCancellation();
  const { historyRef, seeHistory } = useSeeHistory(closeResult);

  return (
    <div className={styles.page}>
      <NotificationsHeader />
      <div className={styles.columns}>
        <div className={styles.formCard}>
          <NotificationForm form={form} counts={counts} isSending={isSending} />
        </div>
        <NotificationPreview title={form.values.title} content={form.values.content} />
      </div>
      <DispatchHistory ref={historyRef} counts={counts} onCancelSchedule={cancellation.open} />
      <DispatchResultDialog dispatch={result} onSeeHistory={seeHistory} onClose={closeResult} />
      <CancelScheduleDialog {...cancellation} />
    </div>
  );
}
