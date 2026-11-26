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
});
