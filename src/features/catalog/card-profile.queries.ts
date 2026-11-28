import { useQuery } from '@tanstack/react-query';

import { cardProfileApi } from './card-profile.api';

export const cardProfileKeys = {
  all: ['card-profile'] as const,
  detail: (id: string) => [...cardProfileKeys.all, id] as const,
};

export function useCardProfile(id: string) {
  return useQuery({ queryKey: cardProfileKeys.detail(id), queryFn: () => cardProfileApi.get(id) });
}
