import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Toast } from '@/components/Toast/Toast';
import { useMe } from '@/features/users';

import { ChannelCards } from '../../components/ChannelCards/ChannelCards';
import { EventPreferences } from '../../components/EventPreferences/EventPreferences';
import { SettingsHeader } from '../../components/SettingsHeader/SettingsHeader';
import { usePreferencesDraft } from '../../hooks/usePreferencesDraft';
import { settingsTexts as t } from '../../notifications.labels';
import {
  useNotificationPreferences,
  useRestoreNotificationPreferences,
  useSaveNotificationPreferences,
} from '../../notifications.queries';
import type { NotificationPreferences } from '../../notifications.types';
import styles from './NotificationSettingsPage.module.css';

interface Feedback {
  message: string;
  tone: 'success' | 'danger';
}

type Notify = (feedback: Feedback) => void;

function useSettingsActions(notify: Notify) {
  const save = useSaveNotificationPreferences();
  const restore = useRestoreNotificationPreferences();
  const fail = () => notify({ message: t.saveError, tone: 'danger' });
  return {
    isBusy: save.isPending || restore.isPending,
    save: (draft: NotificationPreferences) =>
      save.mutate(draft, {
        onSuccess: () => notify({ message: t.saved, tone: 'success' }),
        onError: fail,
      }),
    restore: () =>
      restore.mutate(undefined, {
        onSuccess: () => notify({ message: t.restored, tone: 'success' }),
        onError: fail,
      }),
  };
}

function SettingsForm({ initial, notify }: { initial: NotificationPreferences; notify: Notify }) {
  const { draft, setChannel, setEvent, activeChannels, reset } = usePreferencesDraft(initial);
  const actions = useSettingsActions(notify);
  const { data: me } = useMe();
  return (
    <>
      <SettingsHeader
        activeChannels={activeChannels}
        isRestoring={actions.isBusy}
        onRestore={actions.restore}
      />
      <ChannelCards channels={draft.channels} email={me?.email} onChange={setChannel} />
      <EventPreferences preferences={draft} onChange={setEvent} />
      <footer className={styles.footer}>
        <p className={styles.footerHint}>{t.footerHint}</p>
        <Button variant="secondary" onClick={reset}>
          {t.cancel}
        </Button>
        <Button disabled={actions.isBusy} onClick={() => actions.save(draft)}>
          {t.save}
        </Button>
      </footer>
    </>
  );
}

export function NotificationSettingsPage() {
  const query = useNotificationPreferences();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  return (
    <div className={styles.page}>
      {query.isPending && <LoadingState message={t.loading} />}
      {query.isError && <ErrorState title={t.loadError} message="" />}
      {query.data && (
        <SettingsForm key={query.dataUpdatedAt} initial={query.data} notify={setFeedback} />
      )}
      <Toast
        message={feedback?.message ?? null}
        tone={feedback?.tone}
        placement="top"
        onDismiss={() => setFeedback(null)}
      />
    </div>
  );
}
