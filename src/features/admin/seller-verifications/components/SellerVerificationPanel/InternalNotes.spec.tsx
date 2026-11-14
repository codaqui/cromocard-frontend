import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InternalNotes } from './InternalNotes';

describe('InternalNotes', () => {
  it('lista as anotações registradas, com autor e data', () => {
    render(
      <InternalNotes
        notes={[
          {
            id: 'note-1',
            content: 'Lojista já atua há 2 anos',
            createdAt: '2026-11-13T12:00:00Z',
            author: { id: 'admin-1', name: 'Admin' },
          },
        ]}
        isSaving={false}
        onAdd={vi.fn()}
      />,
    );

    expect(screen.getByText('Lojista já atua há 2 anos')).toBeInTheDocument();
    expect(screen.getByText(/Admin ·/)).toBeInTheDocument();
  });

  it('sem anotações mostra a mensagem vazia', () => {
    render(<InternalNotes notes={[]} isSaving={false} onAdd={vi.fn()} />);

    expect(screen.getByText('Nenhuma anotação registrada.')).toBeInTheDocument();
  });
});
