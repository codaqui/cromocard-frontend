import type { ReactNode } from 'react';

import { Icon } from '@/components/Icon/Icon';

import { itemNameOf } from '../../catalog-requests.format';
import type { CatalogRequest } from '../../catalog-requests.types';
import styles from './SuggestionMedia.module.css';

function SentImages({ request }: { request: CatalogRequest }) {
  const images = [
    { label: 'Frente', url: request.data.frontImageUrl },
    { label: 'Verso', url: request.data.backImageUrl },
  ].filter((image): image is { label: string; url: string } => Boolean(image.url));

  if (images.length === 0) return null;
  return (
    <section data-media="" aria-label="Imagens enviadas">
      <h3 className={styles.mediaTitle}>Imagens enviadas</h3>
      <div className={styles.images}>
        {images.map(({ label, url }) => (
          <figure key={label} className={styles.image}>
            <img src={url} alt={`${label} de ${itemNameOf(request)}`} loading="lazy" />
            <figcaption>{label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

interface SuggestedImageProps {
  title: string;
  url: string;
  name: string;
  tag?: string;
  children?: ReactNode;
}

function SuggestedImage({ title, url, name, tag, children }: SuggestedImageProps) {
  return (
    <section data-media="" aria-label={title}>
      <h3 className={styles.mediaTitle}>{title}</h3>
      <figure className={styles.cover}>
        <img src={url} alt={`${title}: ${name}`} loading="lazy" />
        <figcaption>
          <span>{name}</span>
          {tag && <span className={styles.coverTag}>{tag}</span>}
        </figcaption>
      </figure>
      {children}
    </section>
  );
}

function AlbumCover({ request }: { request: CatalogRequest }) {
  const { data, checklistSummary } = request;
  if (!data.coverImageUrl) return null;
  const tag = [data.publisher, data.year].filter(Boolean).join(' ').toUpperCase();
  return (
    <SuggestedImage
      title="Capa sugerida"
      url={data.coverImageUrl}
      name={itemNameOf(request)}
      tag={tag || undefined}
    >
      {checklistSummary && (
        <p className={styles.volume}>
          <span>
            <Icon name="bookOutline" size={16} />
            Volume Total:
          </span>
          <strong>{checklistSummary.total} Cartas no Checklist</strong>
        </p>
      )}
    </SuggestedImage>
  );
}

function CategoryLogo({ request }: { request: CatalogRequest }) {
  const { data } = request;
  if (!data.logoUrl) return null;
  return (
    <SuggestedImage
      title="Logo enviado"
      url={data.logoUrl}
      name={itemNameOf(request)}
      tag={data.publisher?.toUpperCase()}
    />
  );
}

const MEDIA = { CARD: SentImages, ALBUM: AlbumCover, CATEGORY: CategoryLogo };

export function SuggestionMedia({ request }: { request: CatalogRequest }) {
  const Media = MEDIA[request.type];
  return <Media request={request} />;
}
