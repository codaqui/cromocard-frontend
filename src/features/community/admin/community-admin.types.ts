import type { PaginationParams } from '@/types/api';

export type GroupAccessType = 'OPEN' | 'CLOSED';

export type GroupStatus = 'ACTIVE' | 'SUSPENDED';

export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface AdminGroupSummary {
  id: string;
  name: string;
  accessType: GroupAccessType;
  status: GroupStatus;
  membersCount: number;
  creatorName: string;
}

export interface AdminGroupDetail extends AdminGroupSummary {
  description: string | null;
  coverImageUrl: string | null;
  createdAt: string;
}

export interface CommunitySummary {
  activeGroups: number;
  messagesLast7Days: number;
  pendingReports: number;
}

export interface ReportedMessage {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  groupName: string;
}

export interface GroupMessageReport {
  id: string;
  reason: string;
  description: string | null;
  reporterName: string;
  message: ReportedMessage | null;
}

export interface ReportResolution {
  id: string;
  status: ReportStatus;
}

export interface ListGroupsParams extends PaginationParams {
  q?: string;
  status?: GroupStatus;
}

export interface ListGroupMessageReportsParams extends PaginationParams {
  status?: ReportStatus;
}
