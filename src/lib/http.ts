import axios, { type InternalAxiosRequestConfig } from 'axios';

import { env } from '@/config/env';
import { accessTokenStore } from '@/lib/access-token';
import { toApiError } from '@/lib/api-error';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

const HTTP_UNAUTHORIZED = 401;
const AUTH_ROUTES_PREFIX = '/auth/';

type SessionRefresher = () => Promise<boolean>;

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  retriedAfterRefresh?: boolean;
}

const noSession: SessionRefresher = () => Promise.resolve(false);
let refreshSession: SessionRefresher = noSession;
let refreshInFlight: Promise<boolean> | null = null;
let notifyUnauthorized: () => void = () => undefined;

export function onUnauthorized(listener: () => void): () => void {
  notifyUnauthorized = listener;
  return () => {
    notifyUnauthorized = () => undefined;
  };
}

export function setSessionRefresher(refresher: SessionRefresher): () => void {
  refreshSession = refresher;
  return () => {
    refreshSession = noSession;
  };
}

export function refreshSessionOnce(): Promise<boolean> {
  refreshInFlight ??= refreshSession().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

function retriableAfterRefresh(error: unknown): RetriableRequestConfig | undefined {
  if (!axios.isAxiosError(error) || error.response?.status !== HTTP_UNAUTHORIZED) return undefined;

  const config = error.config as RetriableRequestConfig | undefined;
  const isAuthRoute = config?.url?.startsWith(AUTH_ROUTES_PREFIX) ?? false;
  return config && !config.retriedAfterRefresh && !isAuthRoute ? config : undefined;
}

export const http = axios.create({
  baseURL: `${env.API_URL}/api/v1`,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = accessTokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function retryAfterRefresh(config: RetriableRequestConfig, error: unknown) {
  config.retriedAfterRefresh = true;
  if (await refreshSessionOnce()) return http(config);

  notifyUnauthorized();
  return Promise.reject(toApiError(error));
}

http.interceptors.response.use(undefined, (error: unknown) => {
  const config = retriableAfterRefresh(error);
  if (config) return retryAfterRefresh(config, error);

  return Promise.reject(toApiError(error));
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
