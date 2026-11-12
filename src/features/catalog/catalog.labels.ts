import type { CatalogItemKind, CategoryType } from './catalog.types';

export const categoryTypeLabels: Record<CategoryType, string> = {
  ALBUM: 'Álbum',
  CARD: 'Carta',
};

export const EMPTY_VALUE_LABEL = '—';

interface CatalogItemTexts {
  createTitle: string;
  editTitle: string;
  created: string;
  updated: string;
  deleted: string;
  deleteTitle: string;
  confirmSave: string;
}

export const catalogItemTexts: Record<CatalogItemKind, CatalogItemTexts> = {
  card: {
    createTitle: 'Cadastrar carta',
    editTitle: 'Editar carta',
    created: 'Carta cadastrada com sucesso.',
    updated: 'Carta atualizada com sucesso.',
    deleted: 'Carta excluída com sucesso.',
    deleteTitle: 'Excluir carta',
    confirmSave: 'Confirma salvar os dados da carta?',
  },
  album: {
    createTitle: 'Novo álbum',
    editTitle: 'Editar álbum',
    created: 'Álbum cadastrado com sucesso.',
    updated: 'Álbum atualizado com sucesso.',
    deleted: 'Álbum excluído com sucesso.',
    deleteTitle: 'Excluir álbum',
    confirmSave: 'Confirma salvar os dados do álbum?',
  },
  category: {
    createTitle: 'Nova categoria',
    editTitle: 'Editar categoria',
    created: 'Categoria cadastrada com sucesso.',
    updated: 'Categoria atualizada com sucesso.',
    deleted: 'Categoria excluída com sucesso.',
    deleteTitle: 'Excluir categoria',
    confirmSave: 'Confirma salvar os dados da categoria?',
  },
};

const importColumnLabels: Record<string, string> = {
  album_title: 'Álbum',
  number: 'Número',
  name: 'Nome',
  rarity: 'Raridade',
  language: 'Idioma',
  category: 'Categoria',
  columns: 'Colunas',
};

export function importErrorLocation(field: string): string {
  const [line, column] = field.split('.');
  if (!column) return 'Arquivo';
  return `Linha ${line} · ${importColumnLabels[column] ?? column}`;
}

export function importedCardsMessage(created: number): string {
  if (created === 1) return '1 carta importada com sucesso.';
  return `${created} cartas importadas com sucesso.`;
}
