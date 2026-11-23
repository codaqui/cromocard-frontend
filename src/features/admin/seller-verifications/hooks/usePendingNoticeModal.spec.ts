import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { SellerVerificationDetail } from '../seller-verifications.types';
import { usePendingNoticeModal } from './usePendingNoticeModal';

const detail = {
  id: 'ver-1',
  cnpj: '45.291.802/0001-93',
  seller: { id: 'seller-1', name: 'Fábio TCG Store', email: 'fabio@cromocard.dev' },
} as SellerVerificationDetail;

describe('usePendingNoticeModal', () => {
  it('começa fechado', () => {
    const { result } = renderHook(() => usePendingNoticeModal());

    expect(result.current.target).toBeNull();
  });

  it('CA1: abre com o destinatário do dossiê e fecha depois', () => {
    const { result } = renderHook(() => usePendingNoticeModal());

    act(() => result.current.openFor(detail));
    expect(result.current.target).toEqual({
      id: 'ver-1',
      cnpj: '45.291.802/0001-93',
      sellerId: 'seller-1',
      sellerName: 'Fábio TCG Store',
      sellerEmail: 'fabio@cromocard.dev',
    });

    act(() => result.current.close());
    expect(result.current.target).toBeNull();
  });
});
