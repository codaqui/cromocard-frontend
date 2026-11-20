import {
  useDeleteGroup,
  useDismissReport,
  useReactivateGroup,
  useRemoveAndWarn,
  useRemoveReportedMessage,
  useSuspendGroup,
  useWarnGroup,
} from '../community-admin.queries';

export function useModerationMutations() {
  return {
    warn: useWarnGroup(),
    suspend: useSuspendGroup(),
    reactivate: useReactivateGroup(),
    delete: useDeleteGroup(),
    removeMessage: useRemoveReportedMessage(),
    removeAndWarn: useRemoveAndWarn(),
    dismiss: useDismissReport(),
  };
}
