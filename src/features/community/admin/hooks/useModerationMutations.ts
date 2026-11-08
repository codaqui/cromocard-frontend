import {
  useDeleteGroup,
  useDismissReport,
  useReactivateGroup,
  useRemoveReportedMessage,
  useSuspendGroup,
} from '../community-admin.queries';

export function useModerationMutations() {
  return {
    suspend: useSuspendGroup(),
    reactivate: useReactivateGroup(),
    delete: useDeleteGroup(),
    removeMessage: useRemoveReportedMessage(),
    dismiss: useDismissReport(),
  };
}
