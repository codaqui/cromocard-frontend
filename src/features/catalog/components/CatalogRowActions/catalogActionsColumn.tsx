import type { DataTableColumn } from '@/components/DataTable/DataTable';

import type { CatalogItemKind } from '../../catalog.types';
import type { CatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { CatalogRowActions } from './CatalogRowActions';

const DUPLICABLE_KINDS = new Set<CatalogItemKind>(['card']);

type RowDialogs<T> = Pick<CatalogItemDialogs<T>, 'openEdit' | 'openDelete'> &
  Partial<Pick<CatalogItemDialogs<T>, 'openDuplicate'>>;

export function catalogActionsColumn<T extends { id: string }>(
  kind: CatalogItemKind,
  nameOf: (row: T) => string,
  dialogs: RowDialogs<T>,
): DataTableColumn<T> {
  const openDuplicate = DUPLICABLE_KINDS.has(kind) ? dialogs.openDuplicate : undefined;

  return {
    key: 'actions',
    header: 'Ações',
    render: (row) => (
      <CatalogRowActions
        name={nameOf(row)}
        onEdit={() => dialogs.openEdit(row)}
        onDuplicate={openDuplicate && (() => openDuplicate(row))}
        onDelete={() => dialogs.openDelete({ kind, id: row.id, name: nameOf(row) })}
      />
    ),
  };
}
