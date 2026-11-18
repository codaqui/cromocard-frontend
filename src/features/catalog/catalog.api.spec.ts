import { describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/http';

import { catalogApi } from './catalog.api';
import type { AlbumInput, CardInput, CategoryInput } from './catalog.schemas';

vi.mock('@/lib/http', () => ({
  api: {
    get: vi.fn(),
    getPage: vi.fn(),
    getBlob: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const PAGE = { page: 1, pageSize: 20 };

const albumInput: AlbumInput = {
  title: 'Copa 2026',
  publisher: null,
  year: 2026,
  description: null,
  coverUrl: null,
  categoryId: null,
  status: 'ACTIVE',
};

const cardInput: CardInput = {
  name: 'Pelé',
  number: '10',
  description: null,
  frontImageUrl: 'https://hml-api.cromocard.com.br/uploads/cards/pele.webp',
  backImageUrl: null,
  albumId: null,
  categoryId: 'franquia',
  rarityId: 'raridade',
  languageId: 'idioma',
};

const categoryInput: CategoryInput = {
  name: 'Futebol',
  type: 'ALBUM',
  parentCategoryId: null,
  description: null,
  badge: null,
};

function callsOf(method: keyof typeof api) {
  return vi.mocked(api)[method].mock.calls;
}

function sentForm(): FormData {
  const [, body] = callsOf('post')[0] ?? [];
  if (!(body instanceof FormData)) throw new Error('O corpo enviado não é um FormData');
  return body;
}

describe('catalogApi: álbuns', () => {
  it('R3: lista a página de álbuns com os filtros', () => {
    void catalogApi.listAlbums({ ...PAGE, year: 2026 });
    expect(callsOf('getPage')[0]).toEqual(['/admin/catalog/albums', { ...PAGE, year: 2026 }]);
  });

  it('R4: cadastra e edita o álbum', () => {
    void catalogApi.createAlbum(albumInput);
    void catalogApi.updateAlbum('album-1', albumInput);

    expect(callsOf('post')[0]).toEqual(['/admin/catalog/albums', albumInput]);
    expect(callsOf('patch')[0]).toEqual(['/admin/catalog/albums/album-1', albumInput]);
  });
});

describe('catalogApi: cartas', () => {
  it('R3: lista a página de cartas com os filtros', () => {
    void catalogApi.listCards({ ...PAGE, rarityId: 'raridade' });
    expect(callsOf('getPage')[0]).toEqual([
      '/admin/catalog/cards',
      { ...PAGE, rarityId: 'raridade' },
    ]);
  });

  it('R4: cadastra e edita a carta', () => {
    void catalogApi.createCard(cardInput);
    void catalogApi.updateCard('card-1', cardInput);

    expect(callsOf('post')[0]).toEqual(['/admin/catalog/cards', cardInput]);
    expect(callsOf('patch')[0]).toEqual(['/admin/catalog/cards/card-1', cardInput]);
  });

  it('R13: envia o CSV no campo file, sem pasta', () => {
    const file = new File(['album_title;number'], 'cartas.csv', { type: 'text/csv' });

    void catalogApi.importCards(file);

    expect(callsOf('post')[0]?.[0]).toBe('/admin/catalog/cards/import');
    expect(sentForm().get('file')).toBe(file);
    expect(sentForm().has('folder')).toBe(false);
  });

  it('R13: baixa o modelo do CSV', () => {
    void catalogApi.downloadImportTemplate();
    expect(callsOf('getBlob')[0]).toEqual(['/admin/catalog/cards/import/template']);
  });
});

describe('catalogApi: categorias e referências', () => {
  it('R15: lista, cadastra e edita a categoria', () => {
    void catalogApi.listCategories({ ...PAGE, type: 'CARD' });
    void catalogApi.createCategory(categoryInput);
    void catalogApi.updateCategory('categoria-1', categoryInput);

    expect(callsOf('getPage')[0]).toEqual(['/admin/catalog/categories', { ...PAGE, type: 'CARD' }]);
    expect(callsOf('post')[0]).toEqual(['/admin/catalog/categories', categoryInput]);
    expect(callsOf('patch')[0]).toEqual(['/admin/catalog/categories/categoria-1', categoryInput]);
  });

  it('R15: lista as raridades e os idiomas do seed', () => {
    void catalogApi.listRarities();
    void catalogApi.listLanguages();

    expect(callsOf('get')).toEqual([['/admin/catalog/rarities'], ['/admin/catalog/languages']]);
  });
});

describe('catalogApi: exclusão e upload', () => {
  it.each([
    ['card', '/admin/catalog/cards/item-1'],
    ['album', '/admin/catalog/albums/item-1'],
    ['category', '/admin/catalog/categories/item-1'],
  ] as const)('R10: exclui o item do tipo %s pelo caminho dele', (kind, path) => {
    void catalogApi.deleteItem(kind, 'item-1');
    expect(callsOf('delete')[0]).toEqual([path]);
  });

  it('R12: envia a imagem para /uploads com a pasta', () => {
    const file = new File(['png'], 'frente.png', { type: 'image/png' });

    void catalogApi.uploadImage('cards', file);

    expect(callsOf('post')[0]?.[0]).toBe('/uploads');
    expect(sentForm().get('folder')).toBe('cards');
    expect(sentForm().get('file')).toBe(file);
  });
});
