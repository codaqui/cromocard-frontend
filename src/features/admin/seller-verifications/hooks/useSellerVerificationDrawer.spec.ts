import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSellerVerificationDrawer } from './useSellerVerificationDrawer';

describe('useSellerVerificationDrawer', () => {
  it('começa fechado', () => {
    const { result } = renderHook(() => useSellerVerificationDrawer());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.openId).toBeNull();
  });

  it('abre com o id do credenciamento e fecha depois', () => {
    const { result } = renderHook(() => useSellerVerificationDrawer());

    act(() => result.current.open('ver-1'));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.openId).toBe('ver-1');

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.openId).toBeNull();
  });
});
