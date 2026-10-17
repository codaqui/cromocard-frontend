import axios from 'axios';

import { z } from '@/lib/zod';

const apiErrorDetailSchema = z.object({
  field: z.string(),
  message: z.string(),
});

const apiErrorBodySchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.array(apiErrorDetailSchema).optional(),
});

export type ApiErrorDetail = z.infer<typeof apiErrorDetailSchema>;

interface ApiErrorProps {
  status: number;
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetail[];

  constructor({ status, code, message, details }: ApiErrorProps) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function networkError(): ApiError {
  return new ApiError({
    status: 0,
    code: 'NETWORK_ERROR',
    message: 'Não foi possível conectar ao servidor. Tente novamente.',
  });
}

function unexpectedError(status = 0): ApiError {
  return new ApiError({
    status,
    code: 'UNEXPECTED_ERROR',
    message: 'Algo deu errado. Tente novamente.',
  });
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!axios.isAxiosError(error)) return unexpectedError();
  if (!error.response) return networkError();

  const body = apiErrorBodySchema.safeParse(error.response.data);

  if (!body.success) return unexpectedError(error.response.status);

  return new ApiError({
    status: error.response.status,
    code: body.data.error,
    message: body.data.message,
    details: body.data.details,
  });
}
