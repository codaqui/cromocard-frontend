import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';

import { usersApi } from './users.api';
import type { AdminUpdateUserInput, ReasonInput } from './users.schemas';
import type { ListUsersParams } from './users.types';

export const usersKeys = {
  all: ['users'] as const,
  me: () => [...usersKeys.all, 'me'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params: ListUsersParams) => [...usersKeys.lists(), params] as const,
  detail: (id: string) => [...usersKeys.all, 'detail', id] as const,
};

function invalidateAllUsers(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: usersKeys.all });
}

/** Depois de excluir, o detalhe responderia 404: recarrega só as listas e deixa o detalhe vencido, sem buscar. */
function invalidateAfterRemoval(queryClient: QueryClient, id: string) {
  void queryClient.invalidateQueries({ queryKey: usersKeys.detail(id), refetchType: 'none' });
  return queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
}

export function useUsersList(params: ListUsersParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string) {
  return useQuery({ queryKey: usersKeys.detail(id), queryFn: () => usersApi.getById(id) });
}

export function useMe() {
  return useQuery({ queryKey: usersKeys.me(), queryFn: usersApi.getMe });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: (user) => queryClient.setQueryData(usersKeys.me(), user),
  });
}

export function useDeleteMe() {
  return useMutation({ mutationFn: usersApi.deleteMe });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => invalidateAllUsers(queryClient),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdminUpdateUserInput }) =>
      usersApi.update(id, input),
    onSuccess: () => invalidateAllUsers(queryClient),
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReasonInput }) => usersApi.suspend(id, input),
    onSuccess: () => invalidateAllUsers(queryClient),
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.reactivate(id),
    onSuccess: () => invalidateAllUsers(queryClient),
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReasonInput }) => usersApi.remove(id, input),
    onSuccess: (_, { id }) => invalidateAfterRemoval(queryClient, id),
  });
}

export function useResendActivation() {
  return useMutation({ mutationFn: usersApi.resendActivation });
}
