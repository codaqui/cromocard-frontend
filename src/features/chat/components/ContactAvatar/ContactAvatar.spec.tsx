import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ContactAvatar } from './ContactAvatar';

describe('ContactAvatar', () => {
  it('R19: sem foto, mostra a inicial do nome e não mostra o ponto se a presença não importa', () => {
    render(<ContactAvatar name="marcos" avatarUrl={null} />);

    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('R19: com foto, mostra a imagem no lugar da inicial', () => {
    const { container } = render(
      <ContactAvatar name="marcos" avatarUrl="/uploads/m.png" online={false} />,
    );

    expect(container.querySelector('img')).toHaveAttribute('src', '/uploads/m.png');
    expect(screen.queryByText('M')).not.toBeInTheDocument();
  });

  it('L17: no modal, a linha do contato mostra a foto e, sem ela, as iniciais do nome e sobrenome', () => {
    const { container, rerender } = render(
      <ContactAvatar name="Renata Valente" avatarUrl="/uploads/r.png" size="round" />,
    );
    expect(container.querySelector('img')).toHaveAttribute('src', '/uploads/r.png');

    rerender(<ContactAvatar name="Renata Valente" avatarUrl={null} size="round" />);
    expect(screen.getByText('RV')).toBeInTheDocument();
  });
});
