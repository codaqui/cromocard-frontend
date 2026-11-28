import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SupportCard } from './SupportCard';

vi.mock('@/config/env', () => ({ env: { SUPPORT_EMAIL: 'ajuda@cromocard.com.br' } }));

describe('SupportCard', () => {
  it('CA4: "Enviar e-mail" abre o e-mail com o endereço do suporte da configuração', () => {
    render(<SupportCard />);

    expect(
      screen.getByRole('complementary', { name: 'Não encontrou o que procurava?' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Enviar e-mail' })).toHaveAttribute(
      'href',
      'mailto:ajuda@cromocard.com.br',
    );
  });

  it('R17: mostra o prazo de resposta e o horário de atendimento', () => {
    render(<SupportCard />);

    expect(screen.getByText('Nossa equipe responde em até 24h úteis.')).toBeInTheDocument();
    expect(screen.getByText('Seg. a sex., 9h às 18h')).toBeInTheDocument();
  });
});
