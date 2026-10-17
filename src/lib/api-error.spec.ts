import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';

import { ApiError, toApiError } from '@/lib/api-error';

function axiosErrorWithResponse(status: number, data: unknown): AxiosError {
  const response = { status, data, headers: {}, config: { headers: new AxiosHeaders() } };
  return new AxiosError('falhou', undefined, undefined, undefined, response as AxiosResponse);
}

describe('toApiError', () => {
  it('converte o corpo de erro da API em ApiError', () => {
    const error = toApiError(
      axiosErrorWithResponse(404, { error: 'USER_NOT_FOUND', message: 'Usuário não encontrado' }),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      code: 'USER_NOT_FOUND',
      message: 'Usuário não encontrado',
    });
  });

  it('mantém os detalhes de validação', () => {
    const details = [{ field: 'name', message: 'Muito curto' }];
    const error = toApiError(
      axiosErrorWithResponse(400, {
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details,
      }),
    );

    expect(error.details).toEqual(details);
  });

  it('retorna NETWORK_ERROR quando a API não responde', () => {
    expect(toApiError(new AxiosError('Network Error')).code).toBe('NETWORK_ERROR');
  });

  it('retorna UNEXPECTED_ERROR quando o corpo não segue o contrato da API', () => {
    const error = toApiError(axiosErrorWithResponse(502, '<html>Bad Gateway</html>'));

    expect(error).toMatchObject({ status: 502, code: 'UNEXPECTED_ERROR' });
  });

  it('retorna UNEXPECTED_ERROR para erros que não vêm do axios', () => {
    expect(toApiError(new TypeError('quebrou')).code).toBe('UNEXPECTED_ERROR');
  });
});
