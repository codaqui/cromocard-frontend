import { cn } from '@/utils/cn';

import { useDownloadChecklist } from '../../catalog-requests.queries';
import type { CatalogRequest, ChecklistItem } from '../../catalog-requests.types';
import { SuggestionPanel } from '../SuggestionPanel/SuggestionPanel';
import styles from './AlbumChecklist.module.css';

const COLUMNS = ['Nº', 'Código', 'Nome da carta', 'Raridade', 'Variantes'];

function ChecklistRow({ item, rarest }: { item: ChecklistItem; rarest?: string }) {
  return (
    <tr>
      <td className={styles.mono}>{item.number}</td>
      <td className={styles.code}>{item.code}</td>
      <td>{item.name}</td>
      <td>
        {item.rarity && (
          <span className={cn(styles.rarity, item.rarity === rarest && styles.rarest)}>
            {item.rarity}
          </span>
        )}
      </td>
      <td className={styles.variant}>{item.variants}</td>
    </tr>
  );
}

function ChecklistTable({ checklist, rarest }: { checklist: ChecklistItem[]; rarest?: string }) {
  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {checklist.map((item) => (
            <ChecklistRow key={`${item.number}-${item.code}`} item={item} rarest={rarest} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DownloadButton({ request }: { request: CatalogRequest }) {
  const download = useDownloadChecklist();

  return (
    <>
      <button
        type="button"
        className={styles.link}
        disabled={download.isPending}
        onClick={() => download.mutate(request)}
      >
        Baixar Planilha .CSV
      </button>
      {download.isError && (
        <span role="alert" className={styles.error}>
          Não foi possível baixar a planilha. Tente de novo.
        </span>
      )}
    </>
  );
}

export function AlbumChecklist({ request }: { request: CatalogRequest }) {
  const checklist = request.data.checklist ?? [];
  if (checklist.length === 0) return null;

  return (
    <SuggestionPanel
      label="Checklist"
      icon="filterList"
      title={`Checklist (${checklist.length} cartas)`}
      aside={<DownloadButton request={request} />}
    >
      <ChecklistTable checklist={checklist} rarest={request.checklistSummary?.rarities[0]?.name} />
    </SuggestionPanel>
  );
}
