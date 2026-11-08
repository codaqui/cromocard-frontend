import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { communityAdminApi } from './community-admin.api';
import type { ModerationAction } from './community-admin.schemas';
import type { ListGroupMessageReportsParams, ListGroupsParams } from './community-admin.types';

export const communityAdminKeys = {
  all: ['admin', 'community'] as const,
  summary: () => [...communityAdminKeys.all, 'summary'] as const,
  groups: () => [...communityAdminKeys.all, 'groups'] as const,
  groupList: (params: ListGroupsParams) =>
    [...communityAdminKeys.groups(), 'list', params] as const,
  reports: () => [...communityAdminKeys.all, 'reports'] as const,
  reportList: (params: ListGroupMessageReportsParams) =>
    [...communityAdminKeys.reports(), 'list', params] as const,
};

type ModerationRequest = (action: ModerationAction) => Promise<unknown>;

function useModeration(request: ModerationRequest, affected: () => readonly string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: request,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: affected() }),
        queryClient.invalidateQueries({ queryKey: communityAdminKeys.summary() }),
      ]),
  });
}

export function useCommunitySummary() {
  return useQuery({
    queryKey: communityAdminKeys.summary(),
    queryFn: communityAdminApi.getSummary,
  });
}

export function useAdminGroups(params: ListGroupsParams) {
  return useQuery({
    queryKey: communityAdminKeys.groupList(params),
    queryFn: () => communityAdminApi.listGroups(params),
    placeholderData: keepPreviousData,
  });
}

export function useGroupMessageReports(params: ListGroupMessageReportsParams) {
  return useQuery({
    queryKey: communityAdminKeys.reportList(params),
    queryFn: () => communityAdminApi.listGroupMessageReports(params),
    placeholderData: keepPreviousData,
  });
}

export function useSuspendGroup() {
  return useModeration(communityAdminApi.suspendGroup, communityAdminKeys.groups);
}

export function useReactivateGroup() {
  return useModeration(communityAdminApi.reactivateGroup, communityAdminKeys.groups);
}

export function useDeleteGroup() {
  return useModeration(communityAdminApi.deleteGroup, communityAdminKeys.groups);
}

export function useRemoveReportedMessage() {
  return useModeration(communityAdminApi.removeReportedMessage, communityAdminKeys.reports);
}

export function useDismissReport() {
  return useModeration(communityAdminApi.dismissReport, communityAdminKeys.reports);
}
