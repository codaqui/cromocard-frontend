import { type ReactNode, useState } from 'react';
import { Link } from 'react-router';

import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { paths } from '@/routes/paths';

import {
  useBackImageUpload,
  useDefaultCategoriesDraft,
  useSaveDefaultCategories,
} from '../../hooks/useDefaultCategoriesEditor';
import type { Notify } from '../../hooks/useSettingsNotice';
import { savedSetKeyOf } from '../../settings.format';
import { canMoveCategory } from '../../settings.order';
import { useDefaultCategories } from '../../settings.queries';
import { DEFAULT_CATEGORIES_MAX } from '../../settings.schemas';
import type { CategoryOption, DefaultCategory } from '../../settings.types';
import { AddDefaultCategoryDialog } from '../AddDefaultCategoryDialog/AddDefaultCategoryDialog';
import { ModuleActions } from '../ModuleActions/ModuleActions';
import { SettingsModule } from '../SettingsModule/SettingsModule';
import styles from './DefaultCategoriesModule.module.css';
import { DefaultCategoryRow, type RowDrag } from '../DefaultCategoryRow/DefaultCategoryRow';

function DefaultCategoriesShell({
  actions,
  children,
}: {
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SettingsModule
      icon="sort"
      title="Módulo 2: Categorias padrão"
      subtitle="Ordem das franquias no menu, nos filtros e na vitrine, e o verso padrão de cada uma."
      actions={actions}
    >
      {children}
    </SettingsModule>
  );
}

type Draft = ReturnType<typeof useDefaultCategoriesDraft>;

function useRowDrag(draft: Draft) {
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  return (position: number): RowDrag => ({
    isDragging: dragFrom === position,
    onStart: () => setDragFrom(position),
    onOver: (event) => {
      if (dragFrom !== null) event.preventDefault();
    },
    onDrop: () => {
      if (dragFrom !== null) draft.moveTo(dragFrom, position);
      setDragFrom(null);
    },
    onEnd: () => setDragFrom(null),
  });
}

function rowActionsOf(draft: Draft, { id }: DefaultCategory, position: number) {
  return {
    onMoveUp: () => draft.moveUp(position),
    onMoveDown: () => draft.moveDown(position),
    onTogglePin: () => draft.togglePin(id),
    onRemove: () => draft.remove(id),
  };
}

function CategoryRows({ draft, notify }: { draft: Draft; notify: Notify }) {
  const back = useBackImageUpload(draft.setBack, notify);
  const dragOf = useRowDrag(draft);

  return (
    <ul className={styles.list}>
      {draft.draft.map((category, position) => (
        <DefaultCategoryRow
          key={category.id}
          category={category}
          position={position + 1}
          canMoveUp={canMoveCategory(draft.draft, position, position - 1)}
          canMoveDown={canMoveCategory(draft.draft, position, position + 1)}
          drag={dragOf(position)}
          isUploading={back.uploadingId === category.id}
          onChoose={(file) => back.choose(category.id, file)}
          {...rowActionsOf(draft, category, position)}
        />
      ))}
    </ul>
  );
}

function CategoryList({ draft, notify }: { draft: Draft; notify: Notify }) {
  if (draft.draft.length > 0) return <CategoryRows draft={draft} notify={notify} />;

  return (
    <p className={styles.empty}>
      Nenhuma categoria padrão. Adicione as franquias que aparecem primeiro na plataforma.
    </p>
  );
}

const CATEGORIES_LIMIT_HINT = `Limite de ${DEFAULT_CATEGORIES_MAX} categorias padrão: remova uma para adicionar outra.`;

function ModuleLinks({ onAdd, isFull }: { onAdd: () => void; isFull: boolean }) {
  return (
    <div className={styles.links}>
      <button
        type="button"
        className={styles.add}
        disabled={isFull}
        title={isFull ? CATEGORIES_LIMIT_HINT : undefined}
        onClick={onAdd}
      >
        <Icon name="add" size={16} />
        Adicionar categoria padrão
      </button>
      <Link to={paths.backoffice.catalog} className={styles.catalogLink}>
        Gerenciar categorias no Catálogo
      </Link>
    </div>
  );
}

function CategoryAdder({ draft }: { draft: Draft }) {
  const [isAdding, setAdding] = useState(false);
  const add = (category: CategoryOption) => {
    draft.add(category);
    setAdding(false);
  };

  return (
    <>
      <ModuleLinks
        onAdd={() => setAdding(true)}
        isFull={draft.draft.length >= DEFAULT_CATEGORIES_MAX}
      />
      {isAdding && (
        <AddDefaultCategoryDialog
          excludedIds={draft.draft.map(({ id }) => id)}
          onAdd={add}
          onClose={() => setAdding(false)}
        />
      )}
    </>
  );
}

interface DefaultCategoriesEditorProps {
  categories: DefaultCategory[];
  notify: Notify;
}

function DefaultCategoriesEditor({ categories, notify }: DefaultCategoriesEditorProps) {
  const draft = useDefaultCategoriesDraft(categories);
  const { save, isSaving } = useSaveDefaultCategories(notify);
  const actions = { saveLabel: 'Salvar ordem', isSaving, onCancel: draft.reset };

  return (
    <DefaultCategoriesShell
      actions={<ModuleActions {...actions} onSave={() => save(draft.draft)} />}
    >
      <CategoryList draft={draft} notify={notify} />
      <CategoryAdder draft={draft} />
    </DefaultCategoriesShell>
  );
}

export function DefaultCategoriesModule({ notify }: { notify: Notify }) {
  const query = useDefaultCategories();
  if (query.isPending) {
    return (
      <DefaultCategoriesShell>
        <LoadingState message="Carregando as categorias padrão…" />
      </DefaultCategoriesShell>
    );
  }
  if (query.isError) {
    return (
      <DefaultCategoriesShell>
        <ErrorState
          title="Não foi possível carregar as categorias padrão"
          message={query.error.message}
        />
      </DefaultCategoriesShell>
    );
  }

  const editor = { categories: query.data, notify };
  return <DefaultCategoriesEditor key={savedSetKeyOf(query.data)} {...editor} />;
}
