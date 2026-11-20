import { Checkbox } from '@/components/Checkbox/Checkbox';
import type { DataTableColumn } from '@/components/DataTable/DataTable';

import type { Card } from '../../catalog.types';
import type { CardSelection } from '../../hooks/useCardSelection';

export function cardSelectionColumn(selection: CardSelection, rows: Card[]): DataTableColumn<Card> {
  return {
    key: 'select',
    header: (
      <Checkbox
        hideLabel
        label="Selecionar as cartas da página"
        checked={selection.areAllSelected(rows)}
        onChange={() => selection.togglePage(rows)}
      />
    ),
    render: (card) => (
      <Checkbox
        hideLabel
        label={`Selecionar ${card.name}`}
        checked={selection.isSelected(card.id)}
        onChange={() => selection.toggle(card)}
      />
    ),
  };
}
