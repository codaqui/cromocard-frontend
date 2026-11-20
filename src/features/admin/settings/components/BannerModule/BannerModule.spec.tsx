import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { settingsApi } from '../../settings.api';
import { settingsNotices } from '../../settings.labels';
import { LINK_ERROR } from '../../settings.schemas';
import { imageFile, renderSettings, validationError } from '../../test/renderSettings';
import { BannerModule } from './BannerModule';

vi.mock('../../settings.api', () => ({
  settingsApi: { list: vi.fn(), updateBanner: vi.fn(), uploadImage: vi.fn() },
}));

const BANNER = {
  enabled: true,
  title: 'Semana de Cartas Raras: Pokémon & Magic',
  subtitle: 'Cartas raras de Pokémon e Magic cadastradas no catálogo esta semana.',
  ctaText: 'Ver cartas',
  ctaUrl: 'https://cromocard.com.br/catalogo?semana=raras',
  imageUrl: null,
};

const UPLOADED_URL = 'https://hml-api.cromocard.com.br/uploads/banners/semana.webp';

function renderBanner() {
  const notify = vi.fn();
  renderSettings(<BannerModule banner={BANNER} notify={notify} />);
  return { notify, user: userEvent.setup({ applyAccept: false }) };
}

const field = (label: string) => screen.getByRole('textbox', { name: label });

beforeEach(() => {
  vi.mocked(settingsApi.list).mockResolvedValue([]);
  vi.mocked(settingsApi.updateBanner).mockReset();
  vi.mocked(settingsApi.uploadImage).mockReset();
});

describe('BannerModule', () => {
  it('CA1: mostra a pré-visualização, os campos e "Exibir Banner na Home"', () => {
    renderBanner();

    expect(screen.getByText('Pré-visualização (1920×600 px)')).toBeInTheDocument();
    expect(screen.getAllByText(BANNER.title)).toHaveLength(1);
    expect(field('Título')).toHaveValue(BANNER.title);
    expect(field('Subtítulo')).toHaveValue(BANNER.subtitle);
    expect(field('Texto do botão')).toHaveValue(BANNER.ctaText);
    expect(field('Link do botão')).toHaveValue(BANNER.ctaUrl);
    expect(screen.getByRole('switch', { name: /Exibir Banner na Home/ })).toBeChecked();
    expect(screen.getByLabelText(/Imagem do banner/)).toBeInTheDocument();
  });

  it('CA2: troca o título e a imagem, salva e a tela confirma', async () => {
    vi.mocked(settingsApi.uploadImage).mockResolvedValue({ key: 'k', url: UPLOADED_URL });
    vi.mocked(settingsApi.updateBanner).mockResolvedValue({} as never);
    const { notify, user } = renderBanner();

    await user.clear(field('Título'));
    await user.type(field('Título'), 'Semana dos Álbuns');
    await user.upload(
      screen.getByLabelText(/Imagem do banner/),
      imageFile('semana.webp', 'image/webp'),
    );
    await waitFor(() =>
      expect(settingsApi.uploadImage).toHaveBeenCalledWith('banners', expect.any(File)),
    );
    await user.click(screen.getByRole('button', { name: /Salvar banner/ }));

    await waitFor(() => expect(notify).toHaveBeenCalledWith(settingsNotices.banner));
    expect(vi.mocked(settingsApi.updateBanner).mock.calls[0]?.[0]).toEqual({
      ...BANNER,
      title: 'Semana dos Álbuns',
      imageUrl: UPLOADED_URL,
    });
    expect(screen.getByText('Semana dos Álbuns')).toBeInTheDocument();
  });

  it('CA3: link sem https:// é apontado no campo e não chama a API', async () => {
    const { user } = renderBanner();

    await user.clear(field('Link do botão'));
    await user.type(field('Link do botão'), 'cromocard catalogo raras');
    await user.click(screen.getByRole('button', { name: /Salvar banner/ }));

    expect(await screen.findByText(LINK_ERROR)).toBeInTheDocument();
    expect(field('Link do botão')).toHaveAttribute('aria-invalid', 'true');
    expect(settingsApi.updateBanner).not.toHaveBeenCalled();
  });

  it('CA3: o 400 da API aparece no campo que ela apontou', async () => {
    vi.mocked(settingsApi.updateBanner).mockRejectedValue(
      validationError([{ field: 'value.ctaUrl', message: 'Link recusado pela API' }]),
    );
    const { notify, user } = renderBanner();

    await user.click(screen.getByRole('button', { name: /Salvar banner/ }));

    expect(await screen.findByText('Link recusado pela API')).toBeInTheDocument();
    expect(notify).not.toHaveBeenCalled();
  });

  it('CA5: Cancelar volta os valores carregados', async () => {
    const { user } = renderBanner();

    await user.clear(field('Título'));
    await user.type(field('Título'), 'Rascunho');
    await user.click(screen.getByRole('switch', { name: /Exibir Banner na Home/ }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(field('Título')).toHaveValue(BANNER.title);
    expect(screen.getByRole('switch', { name: /Exibir Banner na Home/ })).toBeChecked();
  });

  it('R9: desligar o banner grava enabled: false', async () => {
    vi.mocked(settingsApi.updateBanner).mockResolvedValue({} as never);
    const { user } = renderBanner();

    await user.click(screen.getByRole('switch', { name: /Exibir Banner na Home/ }));
    await user.click(screen.getByRole('button', { name: /Salvar banner/ }));

    await waitFor(() =>
      expect(vi.mocked(settingsApi.updateBanner).mock.calls[0]?.[0]).toMatchObject({
        enabled: false,
      }),
    );
    expect(screen.getByRole('switch', { name: /Inativo/ })).not.toBeChecked();
  });

  it('R20: recusa imagem JPG sem enviar', async () => {
    const { user } = renderBanner();

    await user.upload(
      screen.getByLabelText(/Imagem do banner/),
      imageFile('banner.jpg', 'image/jpeg'),
    );

    expect(await screen.findByText('Envie uma imagem WEBP ou PNG')).toBeInTheDocument();
    expect(settingsApi.uploadImage).not.toHaveBeenCalled();
  });

  it('R12: falha no upload aparece no campo da imagem', async () => {
    vi.mocked(settingsApi.uploadImage).mockRejectedValue(new Error('Arquivo grande demais'));
    const { user } = renderBanner();

    await user.upload(
      screen.getByLabelText(/Imagem do banner/),
      imageFile('banner.png', 'image/png'),
    );

    expect(await screen.findByText('Arquivo grande demais')).toBeInTheDocument();
  });

  it('R12: mostra Enviando… enquanto a imagem sobe e Salvando… enquanto grava', async () => {
    vi.mocked(settingsApi.uploadImage).mockReturnValue(new Promise(() => undefined));
    vi.mocked(settingsApi.updateBanner).mockReturnValue(new Promise(() => undefined));
    const { user } = renderBanner();

    await user.upload(
      screen.getByLabelText(/Imagem do banner/),
      imageFile('banner.png', 'image/png'),
    );
    expect(await screen.findByText('Enviando…')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Salvar banner/ }));

    expect(await screen.findByRole('button', { name: /Salvando…/ })).toBeDisabled();
  });

  it('R12: fechar a janela de arquivo sem escolher nada não envia', () => {
    renderBanner();

    fireEvent.change(screen.getByLabelText(/Imagem do banner/), { target: { files: [] } });

    expect(settingsApi.uploadImage).not.toHaveBeenCalled();
  });
});
