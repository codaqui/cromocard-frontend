import { api } from '@/lib/http';

import type { CardProfile } from './card-profile.types';

export const cardProfileApi = {
  get: (id: string) => api.get<CardProfile>(`/cards/${id}`),
};
