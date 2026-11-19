import type {
  AlbumStatus,
  CatalogItemKind,
  CatalogNotice,
  CategoryBadge,
  CategoryType,
} from './catalog.types';

export const categoryTypeLabels: Record<CategoryType, string> = {
  ALBUM: 'Álbum',
  CARD: 'Carta',
};

export const categoryBadgeLabels: Record<CategoryBadge, string> = {
  STANDARD: 'Padrão',
  TRENDING: 'Em alta',
};

export const albumStatusLabels: Record<AlbumStatus, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
};

export const EMPTY_VALUE_LABEL = '—';

const AUDIT_NOTE = 'Alterações registradas no log de auditoria.';
const SAVE_CHANGES = 'Salvar alterações';
const editSubtitleOf = (name: string) => `Altere os dados de ${name}.`;

/** Textos de cada tipo de item, como nos frames do catálogo (278-3246, 832-5744, 833-9661, 833-10832). */
interface CatalogItemTexts {
  createTitle: string;
  createSubtitle: string;
  createLabel: string;
  /** Completa "Corrija os campos destacados para …" no cadastro. */
  createAction: string;
  createNote?: string;
  editTitle: string;
  editSubtitle: (name: string) => string;
  confirmSave: string;
  created: (name: string) => CatalogNotice;
  updated: (name: string) => CatalogNotice;
  deleted: (name: string) => CatalogNotice;
  deleteTitle: string;
  blockedTitle: string;
  blockedMessage: (name: string) => string;
}

export const catalogItemTexts: Record<CatalogItemKind, CatalogItemTexts> = {
  card: {
    createTitle: 'Cadastrar nova carta',
    createSubtitle: 'Preencha os dados e envie as imagens da carta.',
    createLabel: 'Cadastrar Carta no Catálogo',
    createAction: 'cadastrar a carta',
    editTitle: 'Editar carta',
    editSubtitle: editSubtitleOf,
    confirmSave: 'Confirma salvar os dados da carta?',
    created: (name) => ({
      title: 'Carta cadastrada no catálogo',
      detail: `${name} foi publicada e já aparece nas buscas.`,
    }),
    updated: (name) => ({
      title: 'Carta atualizada no catálogo',
      detail: `${name}: ${AUDIT_NOTE}`,
    }),
    deleted: (name) => ({
      title: 'Carta excluída do catálogo',
      detail: `${name} saiu das buscas.`,
    }),
    deleteTitle: 'Excluir carta',
    blockedTitle: 'Não é possível excluir esta carta',
    blockedMessage: (name) =>
      `${name} está em coleções de usuários. Uma carta usada em coleções não pode ser excluída do catálogo.`,
  },
  album: {
    createTitle: 'Novo álbum',
    createSubtitle:
      'Preencha os dados do álbum. O total de cartas é calculado pelas cartas cadastradas nele.',
    createLabel: 'Cadastrar álbum',
    createAction: 'cadastrar o álbum',
    createNote: 'O total de cartas é calculado pelas cartas do álbum.',
    editTitle: 'Editar álbum',
    editSubtitle: editSubtitleOf,
    confirmSave: 'Confirma salvar os dados do álbum?',
    created: (name) => ({
      title: 'Álbum cadastrado no catálogo',
      detail: `${name} já aparece na lista de álbuns.`,
    }),
    updated: (name) => ({
      title: 'Álbum atualizado no catálogo',
      detail: `${name}: ${AUDIT_NOTE}`,
    }),
    deleted: (name) => ({
      title: 'Álbum excluído do catálogo',
      detail: `${name} saiu das buscas.`,
    }),
    deleteTitle: 'Excluir álbum',
    blockedTitle: 'Não é possível excluir este álbum',
    blockedMessage: (name) =>
      `${name} tem cartas cadastradas. Um álbum com cartas não pode ser excluído do catálogo.`,
  },
  category: {
    createTitle: 'Nova categoria',
    createSubtitle:
      'O slug é gerado a partir do nome. A ordem das categorias padrão fica em Configurações.',
    createLabel: 'Cadastrar categoria',
    createAction: 'cadastrar a categoria',
    editTitle: 'Editar categoria',
    editSubtitle: editSubtitleOf,
    confirmSave: 'Confirma salvar os dados da categoria?',
    created: (name) => ({
      title: 'Categoria cadastrada no catálogo',
      detail: `${name} já pode ser usada em álbuns e cartas.`,
    }),
    updated: (name) => ({
      title: 'Categoria atualizada no catálogo',
      detail: `${name}: ${AUDIT_NOTE}`,
    }),
    deleted: (name) => ({
      title: 'Categoria excluída do catálogo',
      detail: `${name} saiu das buscas.`,
    }),
    deleteTitle: 'Excluir categoria',
    blockedTitle: 'Não é possível excluir esta categoria',
    blockedMessage: (name) =>
      `${name} tem álbuns, cartas ou subcategorias. Uma categoria em uso não pode ser excluída do catálogo.`,
  },
};

/** "Corrija os 5 campos destacados para cadastrar a carta.", como no frame 832-7170. */
function invalidNoteOf(action: string) {
  return (count: number) =>
    count === 1
      ? `Corrija o campo destacado para ${action}.`
      : `Corrija os ${count} campos destacados para ${action}.`;
}

export const DRAFT_LABEL = 'Salvar como Rascunho';

export function duplicateModalTextsOf(sourceName: string) {
  const texts = catalogItemTexts.card;
  return {
    title: 'Duplicar carta',
    subtitle: `Dados copiados de ${sourceName}. Informe a numeração, o código e as imagens da nova carta.`,
    submitLabel: texts.createLabel,
    draftLabel: DRAFT_LABEL,
    invalidNote: invalidNoteOf(texts.createAction),
    confirmMessage: texts.confirmSave,
  };
}

/** Textos do modal de cadastro ou, com o nome do item, de edição. */
export function formModalTextsOf(kind: CatalogItemKind, editingName?: string) {
  const texts = catalogItemTexts[kind];
  const confirmMessage = texts.confirmSave;
  if (editingName === undefined) {
    const { createTitle: title, createSubtitle: subtitle, createLabel: submitLabel } = texts;
    const invalidNote = invalidNoteOf(texts.createAction);
    const draftLabel = kind === 'card' ? DRAFT_LABEL : undefined;
    const note = texts.createNote;
    return { title, subtitle, submitLabel, note, draftLabel, invalidNote, confirmMessage };
  }
  return {
    title: texts.editTitle,
    subtitle: texts.editSubtitle(editingName),
    submitLabel: SAVE_CHANGES,
    note: AUDIT_NOTE,
    invalidNote: invalidNoteOf('salvar as alterações'),
    confirmMessage,
  };
}
