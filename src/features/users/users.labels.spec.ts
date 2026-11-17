import { describe, expect, it } from 'vitest';

import { warningsLabel } from './users.labels';

describe('warningsLabel', () => {
  it('usa o singular para uma advertência', () => {
    expect(warningsLabel(1)).toBe('1 advertência anterior');
  });

  it('usa o plural para nenhuma ou várias advertências', () => {
    expect(warningsLabel(0)).toBe('0 advertências anteriores');
    expect(warningsLabel(3)).toBe('3 advertências anteriores');
  });
});
