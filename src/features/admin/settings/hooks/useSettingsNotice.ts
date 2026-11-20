import { useState } from 'react';

import type { ApiError } from '@/lib/api-error';

import { failureNoticeOf, type SettingsNotice } from '../settings.labels';

export type Notify = (notice: SettingsNotice) => void;

export function useSettingsNotice() {
  const [notice, setNotice] = useState<SettingsNotice | null>(null);

  return { notice, notify: setNotice, dismiss: () => setNotice(null) };
}

export function notifyFailure(notify: Notify) {
  return (error: ApiError) => {
    const notice = failureNoticeOf(error);
    if (notice) notify(notice);
  };
}
