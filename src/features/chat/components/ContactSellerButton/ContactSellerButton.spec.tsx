import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { AuthenticatedUser } from '@/types/authenticated-user';

import { listingContactApi } from '../../listing-contact.api';
import { ContactSellerButton } from './ContactSellerButton';

vi.mock('../../listing-contact.api', () => ({ listingContactApi: { contact: vi.fn() } }));

const GABRIEL: AuthenticatedUser = { id: 'gabriel', role: 'CUSTOMER' };
const TIAGO: AuthenticatedUser = { id: 'tiago', role: 'SELLER' };
const listing = { id: 'anuncio-messi', cardName: 'Lionel Messi', price: 1750 };
const seller = { id: TIAGO.id, username: 'tiago_trocas' };
const onLoginRequired = vi.fn();

function OpenedConversation() {
  const { search, state } = useLocation() as { search: string; state: { draft: unknown } };
  return <p>{`Mensagens ${search} ${JSON.stringify(state.draft)}`}</p>;
}

function renderButton(user: AuthenticatedUser | null = GABRIEL) {
  const element = (
    <ContactSellerButton listing={listing} seller={seller} onLoginRequired={onLoginRequired} />
  );
  renderWithProviders({
    routes: [
      { path: '/anuncios/:id', element },
      { path: '/mensagens', element: <OpenedConversation /> },
    ],
    initialPath: '/anuncios/anuncio-messi',
    user,
  });
}

const contactButton = () => screen.getByRole('button', { name: 'Entrar em contato' });
const rejectWith = (code: string, status = 422) =>
  vi
    .mocked(listingContactApi.contact)
    .mockRejectedValue(new ApiError({ status, code, message: code }));

describe('ContactSellerButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CA1: abre Mensagens na conversa com o vendedor e o texto sugerido', async () => {
    vi.mocked(listingContactApi.contact).mockResolvedValue({ conversationId: 'c1', created: true });
    renderButton();

    await userEvent.click(contactButton());

    expect(listingContactApi.contact).toHaveBeenCalledWith('anuncio-messi');
    expect(
      await screen.findByText(
        'Mensagens ?conversa=c1 {"conversationId":"c1","text":"Olá! Tenho interesse no anúncio Lionel Messi (R$ 1.750)."}',
      ),
    ).toBeInTheDocument();
  });

  it('CA3: avisa que não foi possível iniciar a conversa com o vendedor indisponível', async () => {
    rejectWith('SELLER_UNAVAILABLE');
    renderButton();

    await userEvent.click(contactButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível iniciar a conversa com este vendedor.',
    );
  });

  it('CA4: avisa que o cliente bloqueou o vendedor', async () => {
    rejectWith('CONTACT_BLOCKED', 403);
    renderButton();

    await userEvent.click(contactButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Você bloqueou @tiago_trocas. Para conversar de novo, desbloqueie em Configurações › Privacidade.',
    );
  });

  it('CA5: não aparece no anúncio do próprio vendedor', () => {
    renderButton(TIAGO);

    expect(screen.queryByRole('button', { name: 'Entrar em contato' })).not.toBeInTheDocument();
  });

  it('CA6: com a API fora do ar, continua no anúncio, avisa e libera o botão de novo', async () => {
    vi.mocked(listingContactApi.contact).mockRejectedValue(new Error('fora do ar'));
    renderButton();

    await userEvent.click(contactButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível abrir a conversa. Tente de novo.',
    );
    expect(contactButton()).toBeEnabled();
  });

  it('CA9: o visitante sem login recebe o pedido de entrar, sem chamar a API', async () => {
    renderButton(null);

    await userEvent.click(contactButton());

    expect(onLoginRequired).toHaveBeenCalledOnce();
    expect(listingContactApi.contact).not.toHaveBeenCalled();
  });
});
