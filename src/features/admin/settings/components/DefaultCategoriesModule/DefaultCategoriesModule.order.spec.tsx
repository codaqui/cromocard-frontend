import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { settingsApi } from '../../settings.api';
import { defaultCategory } from '../../test/fixtures';
import { renderSettings } from '../../test/renderSettings';
import { DefaultCategoriesModule } from './DefaultCategoriesModule';

vi.mock('../../settings.api', () => ({
  settingsApi: {
    listDefaultCategories: vi.fn(),
    updateDefaultCategories: vi.fn(),
    listCategoryOptions: vi.fn(),
    uploadImage: vi.fn(),
  },
}));

const POKEMON = defaultCategory('c-pokemon', 'Pokémon', { badge: 'TRENDING', cardsCount: 18240 });
const MAGIC = defaultCategory('c-magic', 'Magic: The Gathering', {
  badge: 'STANDARD',
  cardsCount: 1,
});
const FUTEBOL = defaultCategory('c-futebol', 'Futebol', { cardsCount: 0 });

const dragData = () => ({ setData: vi.fn(), effectAllowed: '', dropEffect: '' });
const saveButton = () => screen.getByRole('button', { name: 'Salvar ordem' });
const rowOf = (name: string) => screen.getByText(name).closest('li') as HTMLElement;
const namesInOrder = () =>
  within(screen.getByRole('list'))
    .getAllByRole('listitem')
    .map(
      (row) => within(row).getAllByText(/^(Pokémon|Magic: The Gathering|Futebol)$/)[0]?.textContent,
    );
const savedPayload = () => vi.mocked(settingsApi.updateDefaultCategories).mock.calls[0]?.[0];

async function renderModule(categories = [POKEMON, MAGIC, FUTEBOL]) {
  vi.mocked(settingsApi.listDefaultCategories).mockReset().mockResolvedValue(categories);
  vi.mocked(settingsApi.updateDefaultCategories).mockReset().mockResolvedValue(categories);
  renderSettings(<DefaultCategoriesModule notify={vi.fn()} />);
  await screen.findByText(categories[0]?.name ?? '');
  return userEvent.setup();
}

describe('DefaultCategoriesModule · ordem (CCD104)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('CA1: cada linha mostra a posição, o nome, o selo, o slug e a quantidade de cartas', async () => {
    await renderModule();

    expect(within(rowOf('Pokémon')).getByText('Em alta')).toBeInTheDocument();
    expect(
      within(rowOf('Pokémon')).getByText('Slug: /pokemon • 18.240 cartas'),
    ).toBeInTheDocument();
    expect(within(rowOf('Magic: The Gathering')).getByText('Padrão')).toBeInTheDocument();
    expect(within(rowOf('Magic: The Gathering')).getByText(/• 1 carta$/)).toBeInTheDocument();
    expect(within(rowOf('Futebol')).getByText('Slug: /futebol • 0 cartas')).toBeInTheDocument();
    expect(namesInOrder()).toEqual(['Pokémon', 'Magic: The Gathering', 'Futebol']);
  });

  it('CA1: a categoria sem slug mostra "sem slug" em vez de uma barra solta', async () => {
    await renderModule([{ ...POKEMON, slug: null }]);

    expect(
      within(rowOf('Pokémon')).getByText('Slug: sem slug • 18.240 cartas'),
    ).toBeInTheDocument();
  });

  it('CA2: mover pelas setas e salvar envia a lista na nova ordem', async () => {
    const user = await renderModule();

    await user.click(screen.getByRole('button', { name: 'Mover Pokémon para baixo' }));
    await user.click(screen.getByRole('button', { name: 'Mover Futebol para cima' }));
    await user.click(saveButton());

    expect(namesInOrder()).toEqual(['Magic: The Gathering', 'Futebol', 'Pokémon']);
    await waitFor(() =>
      expect(savedPayload()?.map(({ id }) => id)).toEqual(['c-magic', 'c-futebol', 'c-pokemon']),
    );
  });

  it('CA2: arrastar pela alça leva a categoria para onde ela foi solta', async () => {
    const user = await renderModule();
    const handle = within(rowOf('Futebol')).getByTestId('drag-handle');

    fireEvent.dragStart(handle, { dataTransfer: dragData() });
    fireEvent.dragOver(rowOf('Pokémon'), { dataTransfer: dragData() });
    fireEvent.drop(rowOf('Pokémon'));
    fireEvent.dragEnd(handle);
    await user.click(saveButton());

    expect(namesInOrder()).toEqual(['Futebol', 'Pokémon', 'Magic: The Gathering']);
    await waitFor(() =>
      expect(savedPayload()?.map(({ id }) => id)).toEqual(['c-futebol', 'c-pokemon', 'c-magic']),
    );
  });

  it('CA2: soltar sem ter arrastado uma linha não muda a ordem', async () => {
    await renderModule();

    fireEvent.drop(rowOf('Pokémon'));

    expect(namesInOrder()).toEqual(['Pokémon', 'Magic: The Gathering', 'Futebol']);
  });

  it('CA3: fixar leva a categoria ao topo com o selo "Fixado no topo" e salva o isPinned', async () => {
    const user = await renderModule();

    await user.click(screen.getByRole('button', { name: 'Fixar Magic: The Gathering no topo' }));
    await user.click(saveButton());

    expect(namesInOrder()).toEqual(['Magic: The Gathering', 'Pokémon', 'Futebol']);
    expect(within(rowOf('Magic: The Gathering')).getByText('Fixado no topo')).toBeInTheDocument();
    await waitFor(() =>
      expect(savedPayload()).toEqual([
        { id: 'c-magic', backImageUrl: null, isPinned: true },
        { id: 'c-pokemon', backImageUrl: null, isPinned: false },
        { id: 'c-futebol', backImageUrl: null, isPinned: false },
      ]),
    );
  });

  it('CA8: fixar outra categoria tira o fixado da anterior', async () => {
    const user = await renderModule([{ ...POKEMON, isPinned: true }, MAGIC, FUTEBOL]);
    expect(within(rowOf('Pokémon')).getByText('Fixado no topo')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fixar Magic: The Gathering no topo' }));

    expect(namesInOrder()).toEqual(['Magic: The Gathering', 'Pokémon', 'Futebol']);
    expect(within(rowOf('Pokémon')).queryByText('Fixado no topo')).not.toBeInTheDocument();
    expect(screen.getAllByText('Fixado no topo')).toHaveLength(1);
  });

  it('CA9: o alfinete da fixada a desafixa e ela continua na primeira posição', async () => {
    const user = await renderModule([{ ...POKEMON, isPinned: true }, MAGIC, FUTEBOL]);

    const pin = screen.getByRole('button', { name: 'Fixar Pokémon no topo' });
    expect(pin).toHaveAttribute('aria-pressed', 'true');
    await user.click(pin);

    expect(namesInOrder()).toEqual(['Pokémon', 'Magic: The Gathering', 'Futebol']);
    expect(screen.queryByText('Fixado no topo')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fixar Pokémon no topo' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('CA10: a seta para cima da primeira e a para baixo da última linha ficam desabilitadas', async () => {
    await renderModule();

    expect(screen.getByRole('button', { name: 'Mover Pokémon para cima' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Mover Futebol para baixo' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Mover Pokémon para baixo' })).toHaveAttribute(
      'aria-disabled',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Mover Futebol para cima' })).toHaveAttribute(
      'aria-disabled',
      'false',
    );
  });

  it('CA4: "Cancelar" volta a ordem e o fixado carregados', async () => {
    const user = await renderModule();

    await user.click(screen.getByRole('button', { name: 'Mover Pokémon para baixo' }));
    await user.click(screen.getByRole('button', { name: 'Fixar Futebol no topo' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(namesInOrder()).toEqual(['Pokémon', 'Magic: The Gathering', 'Futebol']);
    expect(screen.queryByText('Fixado no topo')).not.toBeInTheDocument();
    expect(settingsApi.updateDefaultCategories).not.toHaveBeenCalled();
  });

  it('CA17: com Pokémon fixada, a seta para baixo dela e a para cima da segunda linha ficam desabilitadas', async () => {
    await renderModule([{ ...POKEMON, isPinned: true }, MAGIC, FUTEBOL]);

    expect(screen.getByRole('button', { name: 'Mover Pokémon para baixo' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'Mover Magic: The Gathering para cima' }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Mover Futebol para cima' })).toHaveAttribute(
      'aria-disabled',
      'false',
    );
  });

  it('CA17: arrastar outra categoria para cima da fixada não muda a ordem', async () => {
    await renderModule([{ ...POKEMON, isPinned: true }, MAGIC, FUTEBOL]);
    const handle = within(rowOf('Futebol')).getByTestId('drag-handle');

    fireEvent.dragStart(handle, { dataTransfer: dragData() });
    fireEvent.drop(rowOf('Pokémon'));

    expect(namesInOrder()).toEqual(['Pokémon', 'Magic: The Gathering', 'Futebol']);
  });

  it('CA4: sair da tela sem salvar descarta a ordem, e ao voltar vale a carregada', async () => {
    const user = await renderModule();
    await user.click(screen.getByRole('button', { name: 'Mover Pokémon para baixo' }));
    expect(namesInOrder()).toEqual(['Magic: The Gathering', 'Pokémon', 'Futebol']);

    cleanup();
    renderSettings(<DefaultCategoriesModule notify={vi.fn()} />);
    await screen.findByText('Pokémon');

    expect(namesInOrder()).toEqual(['Pokémon', 'Magic: The Gathering', 'Futebol']);
    expect(settingsApi.updateDefaultCategories).not.toHaveBeenCalled();
  });

  it('só aceita soltar sobre a linha enquanto uma categoria está sendo arrastada', async () => {
    await renderModule();
    const row = rowOf('Magic: The Gathering');

    const withoutDrag = fireEvent.dragOver(row);
    fireEvent.dragStart(within(rowOf('Futebol')).getByTestId('drag-handle'), {
      dataTransfer: dragData(),
    });
    const withDrag = fireEvent.dragOver(row, { dataTransfer: dragData() });

    expect(withoutDrag).toBe(true);
    expect(withDrag).toBe(false);
  });

  it('R3: o arraste começa com setData e effectAllowed move, como o Firefox exige', async () => {
    await renderModule();
    const dataTransfer = dragData();

    fireEvent.dragStart(within(rowOf('Futebol')).getByTestId('drag-handle'), { dataTransfer });

    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', '2');
    expect(dataTransfer.effectAllowed).toBe('move');
  });

  it('CA17: soltar sobre a fixada não é aceito, e sobre uma linha livre é', async () => {
    await renderModule([{ ...POKEMON, isPinned: true }, MAGIC, FUTEBOL]);
    fireEvent.dragStart(within(rowOf('Futebol')).getByTestId('drag-handle'), {
      dataTransfer: dragData(),
    });

    const overPinned = fireEvent.dragOver(rowOf('Pokémon'), { dataTransfer: dragData() });
    const overFree = fireEvent.dragOver(rowOf('Magic: The Gathering'), {
      dataTransfer: dragData(),
    });

    expect(overPinned).toBe(true);
    expect(overFree).toBe(false);
  });

  it('CA2: destaca só a linha livre sob o arraste e tira o destaque ao sair dela', async () => {
    await renderModule([{ ...POKEMON, isPinned: true }, MAGIC, FUTEBOL]);
    fireEvent.dragStart(within(rowOf('Futebol')).getByTestId('drag-handle'), {
      dataTransfer: dragData(),
    });

    fireEvent.dragOver(rowOf('Magic: The Gathering'), { dataTransfer: dragData() });
    expect(rowOf('Magic: The Gathering')).toHaveAttribute('data-drop-target', 'true');

    fireEvent.dragOver(rowOf('Pokémon'), { dataTransfer: dragData() });
    expect(rowOf('Magic: The Gathering')).not.toHaveAttribute('data-drop-target');
    expect(rowOf('Pokémon')).not.toHaveAttribute('data-drop-target');

    fireEvent.dragOver(rowOf('Magic: The Gathering'), { dataTransfer: dragData() });
    fireEvent.dragLeave(rowOf('Futebol'));
    expect(rowOf('Magic: The Gathering')).toHaveAttribute('data-drop-target', 'true');
    fireEvent.dragLeave(rowOf('Magic: The Gathering'));
    expect(rowOf('Magic: The Gathering')).not.toHaveAttribute('data-drop-target');
  });

  it('CA2: o destaque some quando o arraste termina', async () => {
    await renderModule();
    const handle = within(rowOf('Futebol')).getByTestId('drag-handle');
    fireEvent.dragStart(handle, { dataTransfer: dragData() });
    fireEvent.dragOver(rowOf('Pokémon'), { dataTransfer: dragData() });

    fireEvent.dragEnd(handle);

    expect(rowOf('Pokémon')).not.toHaveAttribute('data-drop-target');
  });

  it('CA2: a seta que chega ao limite mantém o foco no botão, que passa a aria-disabled', async () => {
    const user = await renderModule();
    const up = screen.getByRole('button', { name: 'Mover Magic: The Gathering para cima' });

    await user.click(up);

    expect(up).toHaveFocus();
    expect(up).toHaveAttribute('aria-disabled', 'true');
    await user.click(up);
    expect(namesInOrder()).toEqual(['Magic: The Gathering', 'Pokémon', 'Futebol']);
  });

  it('CA2: avisa o leitor de tela onde a categoria ficou', async () => {
    const user = await renderModule();

    await user.click(screen.getByRole('button', { name: 'Mover Pokémon para baixo' }));
    expect(screen.getByRole('status')).toHaveTextContent('Pokémon agora na posição 2 de 3');

    await user.click(screen.getByRole('button', { name: 'Fixar Futebol no topo' }));
    expect(screen.getByRole('status')).toHaveTextContent('Futebol fixada no topo');
  });

  it('CA9: a lista que chega com a fixada no meio começa com ela no topo', async () => {
    await renderModule([MAGIC, { ...POKEMON, isPinned: true }, FUTEBOL]);

    expect(namesInOrder()).toEqual(['Pokémon', 'Magic: The Gathering', 'Futebol']);
    expect(
      screen.getByRole('button', { name: 'Mover Magic: The Gathering para cima' }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('R12: sem nenhuma categoria padrão, mostra só "Adicionar categoria padrão"', async () => {
    vi.mocked(settingsApi.listDefaultCategories).mockReset().mockResolvedValue([]);
    renderSettings(<DefaultCategoriesModule notify={vi.fn()} />);

    expect(await screen.findByText(/Nenhuma categoria padrão/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adicionar categoria padrão/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salvar ordem' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
  });
});
