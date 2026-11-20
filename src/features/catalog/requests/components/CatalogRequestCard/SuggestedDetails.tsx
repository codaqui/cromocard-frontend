import { itemNameOf } from '../../catalog-requests.format';
import { CATEGORY_TYPE_LABELS, requestTypeTexts } from '../../catalog-requests.labels';
import type { CatalogRequest } from '../../catalog-requests.types';
import styles from './CatalogRequestCard.module.css';

interface Fact {
  label: string;
  value?: string | number;
}

function Facts({ facts }: { facts: Fact[] }) {
  const shown = facts.filter(({ value }) => value !== undefined && value !== '');
  return (
    <dl className={styles.facts}>
      {shown.map(({ label, value }) => (
        <div key={label} className={styles.fact}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SentImages({ request }: { request: CatalogRequest }) {
  const images = [
    { label: 'Frente', url: request.data.frontImageUrl },
    { label: 'Verso', url: request.data.backImageUrl },
  ].filter((image): image is { label: string; url: string } => Boolean(image.url));

  if (images.length === 0) return null;
  return (
    <section className={styles.media} aria-label="Imagens enviadas">
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

function factsOf({ type, data, references }: CatalogRequest): Fact[] {
  if (type === 'CARD') {
    return [
      { label: 'Álbum / Edição', value: references.album },
      { label: 'Número', value: data.number },
      { label: 'Franquia', value: references.category },
      { label: 'Raridade', value: references.rarity },
      { label: 'Idioma', value: references.language },
    ];
  }
  if (type === 'ALBUM') return [{ label: 'Franquia', value: references.category }];
  return [{ label: 'Tipo', value: data.type && CATEGORY_TYPE_LABELS[data.type] }];
}

function albumLine({ type, data }: CatalogRequest): string | null {
  if (type !== 'ALBUM') return null;
  const parts = [data.publisher && `Editora: ${data.publisher}`, data.year && `Ano: ${data.year}`];
  return parts.filter(Boolean).join(' • ') || null;
}

export function SuggestedDetails({ request }: { request: CatalogRequest }) {
  const line = albumLine(request);

  return (
    <div className={styles.body}>
      <SentImages request={request} />
      <div className={styles.details}>
        <p className={styles.section}>{requestTypeTexts[request.type].section}</p>
        <h2 className={styles.title}>{itemNameOf(request)}</h2>
        {line && <p className={styles.subtitle}>{line}</p>}
        <Facts facts={factsOf(request)} />
      </div>
    </div>
  );
}
