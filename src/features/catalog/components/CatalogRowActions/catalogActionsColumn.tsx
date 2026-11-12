import type { DataTableColumn } from '@/components/DataTable/DataTable';

import type { CatalogItemKind } from '../../catalog.types';
import type { CatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { CatalogRowActions } from './CatalogRowActions';

export function catalogActionsColumn<T extends { id: string }>(
  kind: CatalogItemKind,
  nameOf: (row: T) => string,
  dialogs: Pick<CatalogItemDialogs<T>, 'openEdit' | 'openDelete'>,
): DataTableColumn<T> {
  return {
    key: 'actions',
    header: 'Ações de gestão',
    render: (row) => (
      <CatalogRowActions
        name={nameOf(row)}
        onEdit={() => dialogs.openEdit(row)}
        onDelete={() => dialogs.openDelete({ kind, id: row.id, name: nameOf(row) })}
      />
    ),
  };
}
