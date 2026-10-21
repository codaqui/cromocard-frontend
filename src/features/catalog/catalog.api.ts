import { api } from '@/lib/http';

import type {
  AlbumInput,
  AlbumView,
  CardInput,
  CardView,
  Language,
  ListAlbumsParams,
  ListCardsParams,
  Rarity,
  StoredFile,
  UploadFolder,
} from './catalog.types';

export const cardsApi = {
  list: (params: ListCardsParams) => api.getPage<CardView>('/cards', params),
  getById: (id: string) => api.get<CardView>(`/cards/${id}`),
  create: (input: CardInput) => api.post<CardView>('/cards', input),
  update: (id: string, input: Partial<CardInput>) => api.patch<CardView>(`/cards/${id}`, input),
  remove: (id: string) => api.delete(`/cards/${id}`),
};

export const albumsApi = {
  list: (params: ListAlbumsParams) => api.getPage<AlbumView>('/albums', params),
  getById: (id: string) => api.get<AlbumView>(`/albums/${id}`),
  create: (input: AlbumInput) => api.post<AlbumView>('/albums', input),
  update: (id: string, input: Partial<AlbumInput>) => api.patch<AlbumView>(`/albums/${id}`, input),
  remove: (id: string) => api.delete(`/albums/${id}`),
};

export const referenceDataApi = {
  rarities: () => api.get<Rarity[]>('/reference-data/rarities'),
  languages: () => api.get<Language[]>('/reference-data/languages'),
};

export function uploadImage(file: File, folder: UploadFolder): Promise<StoredFile> {
  const form = new FormData();
  form.append('file', file);
  return api.postForm<StoredFile>('/uploads', form, { folder });
}
