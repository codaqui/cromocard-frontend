import { albumStatusLabels, EMPTY_VALUE_LABEL } from '../../catalog.labels';
import type { AlbumStatus } from '../../catalog.types';
import { formatAlbumNumber } from '../../catalog.format';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './CatalogCells.module.css';

interface ThumbnailProps {
  imageUrl: string | null;
  badge?: string | null;
}

export function Thumbnail({ imageUrl, badge }: ThumbnailProps) {
  return (
    <span className={styles.thumbnail}>
      {imageUrl ? (
        <img className={styles.image} src={imageUrl} alt="" />
      ) : (
        <span className={styles.placeholder}>
          <CatalogIcon name="image" size={20} />
        </span>
      )}
      {badge && <span className={styles.rarity}>{badge}</span>}
    </span>
  );
}

interface TitleCellProps {
  title: string;
  detail?: string | null;
  tags?: (string | null | undefined)[];
  /** Selo de exibição da categoria, em âmbar como no frame 833-10832. */
  badge?: string | null;
}

export function TitleCell({ title, detail, tags = [], badge }: TitleCellProps) {
  const visibleTags = tags.filter((tag): tag is string => Boolean(tag));

  return (
    <div className={styles.titleCell}>
      <span className={styles.title}>{title}</span>
      {detail && <span className={styles.detail}>{detail}</span>}
      {badge && <span className={styles.badge}>{badge}</span>}
      {visibleTags.length > 0 && (
        <span className={styles.tags}>
          {visibleTags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

export function EditionCell({ title, edition }: { title?: string; edition?: string | null }) {
  if (!title) return EMPTY_VALUE_LABEL;

  return (
    <div className={styles.edition}>
      <span className={styles.editionTitle}>{title}</span>
      {edition && <span className={styles.editionDetail}>{edition}</span>}
    </div>
  );
}

export function FranchiseBadge({ name }: { name?: string }) {
  return name ? <span className={styles.franchise}>{name}</span> : EMPTY_VALUE_LABEL;
}

export function AlbumNumberCell({ number, total }: { number: string | null; total?: number }) {
  if (!number) return EMPTY_VALUE_LABEL;

  return (
    <span className={styles.albumNumber}>
      <span>{formatAlbumNumber(number)}</span>
      {total !== undefined && (
        <>
          <span aria-hidden="true">/</span>
          <span>{formatAlbumNumber(String(total))}</span>
        </>
      )}
    </span>
  );
}

export function CountCell({ value }: { value: number }) {
  return <span className={styles.count}>{value}</span>;
}

export function AlbumStatusCell({ status }: { status: AlbumStatus }) {
  return (
    <span className={styles[status === 'ACTIVE' ? 'active' : 'inactive']}>
      {albumStatusLabels[status]}
    </span>
  );
}
