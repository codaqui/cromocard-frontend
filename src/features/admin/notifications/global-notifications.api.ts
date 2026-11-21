import { api } from '@/lib/http';

import type {
  DispatchNotificationInput,
  GlobalNotification,
  ListDispatchesParams,
  RecipientsCount,
} from './global-notifications.types';

const BASE = '/global-notifications';

export const globalNotificationsApi = {
  list: (params: ListDispatchesParams) => api.getPage<GlobalNotification>(BASE, params),
  recipientsCount: () => api.get<RecipientsCount>(`${BASE}/recipients-count`),
  dispatch: (input: DispatchNotificationInput) => api.post<GlobalNotification>(BASE, input),
  cancel: (id: string) => api.post<GlobalNotification>(`${BASE}/${id}/cancel`),
};
