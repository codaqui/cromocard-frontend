import type { DataTableColumn } from '@/components/DataTable/DataTable';

import type { Card } from '../../catalog.types';
import type { CardSelection } from '../../hooks/useCardSelection';
import { SelectionCheckbox } from './SelectionCheckbox';

export function cardSelectionColumn(selection: CardSelection, rows: Card[]): DataTableColumn<Card> {
  return {
    key: 'select',
    header: (
      <SelectionCheckbox
        label="Selecionar as cartas da página"
        checked={selection.areAllSelected(rows)}
        onChange={() => selection.togglePage(rows)}
      />
    ),
    render: (card) => (
      <SelectionCheckbox
        label={`Selecionar ${card.name}`}
        checked={selection.isSelected(card.id)}
        onChange={() => selection.toggle(card)}
      />
    ),
  };
}
