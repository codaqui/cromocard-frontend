import type { PaginationParams } from '@/types/api';

export type GroupAccessType = 'OPEN' | 'CLOSED';

export type GroupStatus = 'ACTIVE' | 'WARNED' | 'SUSPENDED';

export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export type ReportSeverity = 'CRITICAL' | 'SPAM';

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
  authorId: string;
  authorName: string;
  groupName: string;
  authorAccountAgeDays: number;
  authorWarnings: number;
  reportersCount: number;
}

export interface ReportedUser {
  id: string;
  name: string;
  username: string | null;
  accountAgeDays: number;
  warnings: number;
}

export type ReportOrigin = 'GROUP' | 'CHAT';

export interface GroupMessageReport {
  id: string;
  reason: string;
  description: string | null;
  origin: ReportOrigin;
  reporterName: string;
  reporterUsername: string | null;
  message: ReportedMessage | null;
  reportedUser: ReportedUser | null;
  evidences: ReportEvidence[];
}

export interface ReportEvidence {
  id: string;
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
  severity?: ReportSeverity;
}

export type GroupToggleAction = 'suspend' | 'reactivate';

export type GroupAction = GroupToggleAction | 'warn' | 'delete';

export type ReportAction = 'removeMessage' | 'removeAndWarn' | 'dismiss';

export type ModerationKind = GroupAction | ReportAction;

export type CommunityAction =
  | { kind: 'group'; action: GroupAction; group: AdminGroupSummary }
  | { kind: 'report'; action: ReportAction; report: GroupMessageReport };

export type OnCommunityAction = (action: CommunityAction) => void;
