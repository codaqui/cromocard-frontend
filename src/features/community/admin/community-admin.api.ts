import { api } from '@/lib/http';

import type { ModerationAction } from './community-admin.schemas';
import type {
  AdminGroupDetail,
  AdminGroupSummary,
  CommunitySummary,
  GroupMessageReport,
  ListGroupMessageReportsParams,
  ListGroupsParams,
  ReportResolution,
} from './community-admin.types';

const GROUPS = '/admin/groups';
const REPORTS = '/admin/reports';

export const communityAdminApi = {
  listGroups: (params: ListGroupsParams) => api.getPage<AdminGroupSummary>(GROUPS, params),
  getSummary: () => api.get<CommunitySummary>(`${GROUPS}/summary`),
  getGroup: (id: string) => api.get<AdminGroupDetail>(`${GROUPS}/${id}`),
  suspendGroup: ({ id, reason }: ModerationAction) =>
    api.post<AdminGroupDetail>(`${GROUPS}/${id}/suspend`, { reason }),
  reactivateGroup: ({ id, reason }: ModerationAction) =>
    api.post<AdminGroupDetail>(`${GROUPS}/${id}/reactivate`, { reason }),
  deleteGroup: ({ id, reason }: ModerationAction) => api.delete(`${GROUPS}/${id}`, { reason }),
  listGroupMessageReports: (params: ListGroupMessageReportsParams) =>
    api.getPage<GroupMessageReport>(`${REPORTS}/group-messages`, params),
  removeReportedMessage: ({ id, reason }: ModerationAction) =>
    api.post<ReportResolution>(`${REPORTS}/${id}/remove-message`, { reason }),
  dismissReport: ({ id, reason }: ModerationAction) =>
    api.post<ReportResolution>(`${REPORTS}/${id}/dismiss`, { reason }),
};
