import { describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/http';

import { sellerVerificationsApi } from './seller-verifications.api';

vi.mock('@/lib/http', () => ({
  api: {
    get: vi.fn(),
    getPage: vi.fn(),
    post: vi.fn(),
    postEmpty: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

function callsOf(method: keyof typeof api) {
  return vi.mocked(api)[method].mock.calls;
}

describe('sellerVerificationsApi', () => {
  it('list busca a página de credenciamentos com os parâmetros', () => {
    void sellerVerificationsApi.list({ page: 1, pageSize: 20 });
    expect(callsOf('getPage')[0]).toEqual([
      '/admin/seller-verifications',
      { page: 1, pageSize: 20 },
    ]);
  });

  it('getSummary busca o resumo do período', () => {
    void sellerVerificationsApi.getSummary({ period: '30d' });
    expect(callsOf('get')[0]).toEqual(['/admin/seller-verifications/summary', { period: '30d' }]);
  });

  it('getById busca o dossiê pelo id', () => {
    void sellerVerificationsApi.getById('ver-1');
    expect(callsOf('get')[0]).toEqual(['/admin/seller-verifications/ver-1']);
  });

  it('validateDocument marca o documento como validado', () => {
    void sellerVerificationsApi.validateDocument('ver-1', 'doc-1');
    expect(callsOf('post')[0]).toEqual([
      '/admin/seller-verifications/ver-1/documents/doc-1/validate',
    ]);
  });

  it('addNote registra a anotação interna', () => {
    void sellerVerificationsApi.addNote('ver-1', { content: 'Documento ilegível' });
    expect(callsOf('post')[0]).toEqual([
      '/admin/seller-verifications/ver-1/notes',
      { content: 'Documento ilegível' },
    ]);
  });

  it('approve aprova o credenciamento', () => {
    void sellerVerificationsApi.approve('ver-1', {});
    expect(callsOf('post')[0]).toEqual(['/admin/seller-verifications/ver-1/approve', {}]);
  });

  it('reject rejeita o credenciamento com o motivo', () => {
    void sellerVerificationsApi.reject('ver-1', { reason: 'CNPJ inválido' });
    expect(callsOf('post')[0]).toEqual([
      '/admin/seller-verifications/ver-1/reject',
      { reason: 'CNPJ inválido' },
    ]);
  });
});
