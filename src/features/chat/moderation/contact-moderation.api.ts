import { api } from '@/lib/http';

import type {
  BlockedContact,
  ContactReportInput,
  CreatedContactReport,
} from './contact-moderation.types';

const BLOCKS = '/me/blocks';

function reportForm({ userId, reason, description, block, evidences }: ContactReportInput) {
  const form = new FormData();
  form.append('userId', userId);
  form.append('reason', reason);
  if (description) form.append('description', description);
  form.append('block', String(block));
  evidences.forEach((file) => form.append('evidences', file));
  return form;
}

export const contactModerationApi = {
  block: (userId: string) => api.post<{ userId: string; blockedAt: string }>(BLOCKS, { userId }),
  unblock: (userId: string) => api.delete(`${BLOCKS}/${userId}`),
  listBlocks: (page: number) => api.getPage<BlockedContact>(BLOCKS, { page }),
  report: (input: ContactReportInput) =>
    api.post<CreatedContactReport>('/me/contact-reports', reportForm(input)),
};
