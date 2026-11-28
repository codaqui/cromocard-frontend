import { render } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useRunOnce } from './useRunOnce';

function RunOnce({ action }: { action: () => void }) {
  useRunOnce(action);
  return null;
}

describe('useRunOnce', () => {
  it('roda a ação uma vez só, mesmo com o efeito duplo do StrictMode', () => {
    const action = vi.fn();

    render(
      <StrictMode>
        <RunOnce action={action} />
      </StrictMode>,
    );

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('não roda de novo quando o componente renderiza outra vez', () => {
    const action = vi.fn();
    const { rerender } = render(<RunOnce action={action} />);

    rerender(<RunOnce action={vi.fn()} />);

    expect(action).toHaveBeenCalledTimes(1);
  });
});
