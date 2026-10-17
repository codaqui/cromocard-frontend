import axios from 'axios';

import { env } from '@/config/env';
import { accessTokenStore } from '@/lib/access-token';
import { toApiError } from '@/lib/api-error';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

const HTTP_UNAUTHORIZED = 401;

let notifyUnauthorized: () => void = () => undefined;

export function onUnauthorized(listener: () => void): () => void {
  notifyUnauthorized = listener;
  return () => {
    notifyUnauthorized = () => undefined;
  };
}

const http = axios.create({
  baseURL: `${env.API_URL}/api/v1`,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = accessTokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(undefined, (error: unknown) => {
  const apiError = toApiError(error);
  if (apiError.status === HTTP_UNAUTHORIZED) notifyUnauthorized();
  return Promise.reject(apiError);
});

export const api = {
  async get<T>(url: string, params?: object): Promise<T> {
    const response = await http.get<ApiResponse<T>>(url, { params });
    return response.data.data;
  },

  async getPage<T>(url: string, params?: object): Promise<PaginatedResponse<T>> {
    const response = await http.get<PaginatedResponse<T>>(url, { params });
    return response.data;
  },

  async post<T>(url: string, body?: unknown): Promise<T> {
    const response = await http.post<ApiResponse<T>>(url, body);
    return response.data.data;
  },

  async patch<T>(url: string, body: unknown): Promise<T> {
    const response = await http.patch<ApiResponse<T>>(url, body);
    return response.data.data;
  },

  async delete(url: string): Promise<void> {
    await http.delete(url);
  },
};
