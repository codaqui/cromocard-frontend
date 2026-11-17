import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import { useDownloadChecklist } from '../../catalog-requests.queries';
import type { CatalogRequest, ChecklistItem } from '../../catalog-requests.types';
import extras from './CardExtras.module.css';

const COLUMNS = ['Nº', 'Código', 'Nome da carta', 'Raridade', 'Variantes'];

/** A raridade mais alta do checklist fica em destaque, como "Lendária" no frame 228-1804. */
function ChecklistRow({ item, rarest }: { item: ChecklistItem; rarest?: string }) {
  return (
    <tr>
      <td className={extras.mono}>{item.number}</td>
      <td className={extras.code}>{item.code}</td>
      <td>{item.name}</td>
      <td>
        {item.rarity && (
          <span className={cn(extras.rarity, item.rarity === rarest && extras.rarest)}>
            {item.rarity}
          </span>
        )}
      </td>
      <td className={extras.variant}>{item.variants}</td>
    </tr>
  );
}

function ChecklistTable({ checklist, rarest }: { checklist: ChecklistItem[]; rarest?: string }) {
  return (
    <div className={extras.tableScroll}>
      <table className={extras.table}>
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

interface ChecklistHeaderProps {
  total: number;
  downloading: boolean;
  onDownload: () => void;
}

function ChecklistHeader({ total, downloading, onDownload }: ChecklistHeaderProps) {
  return (
    <header className={extras.panelHeader}>
      <h3 className={extras.panelTitle}>
        <Icon name="filterList" size={14} />
        Checklist ({total} cartas)
      </h3>
      <button type="button" className={extras.link} disabled={downloading} onClick={onDownload}>
        Baixar Planilha .CSV
      </button>
    </header>
  );
}

/** Checklist do álbum sugerido com "Baixar Planilha .CSV" (CCD103, R11). */
export function AlbumChecklist({ request }: { request: CatalogRequest }) {
  const download = useDownloadChecklist();
  const checklist = request.data.checklist ?? [];
  if (checklist.length === 0) return null;

  return (
    <section className={extras.panel} aria-label="Checklist">
      <ChecklistHeader
        total={checklist.length}
        downloading={download.isPending}
        onDownload={() => download.mutate(request)}
      />
      <ChecklistTable checklist={checklist} rarest={request.checklistSummary?.rarities[0]?.name} />
      {download.isError && (
        <p className={extras.error}>Não foi possível baixar a planilha. Tente de novo.</p>
      )}
    </section>
  );
}
