import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { usersApi } from './users.api';
import type { ListUsersParams } from './users.types';

export const usersKeys = {
  all: ['users'] as const,
  me: () => [...usersKeys.all, 'me'] as const,
  list: (params: ListUsersParams) => [...usersKeys.all, 'list', params] as const,
};

export function useUsersList(params: ListUsersParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  });
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
