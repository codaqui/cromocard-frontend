import {
  cardsLabel,
  itemNameOf,
  populationLabel,
  rarityPluralLabel,
} from '../../catalog-requests.format';
import { CATEGORY_TYPE_LABELS, requestTypeTexts } from '../../catalog-requests.labels';
import type { CatalogRequest } from '../../catalog-requests.types';
import { AlbumChecklist } from '../AlbumChecklist/AlbumChecklist';
import { CardSuggestionExtras } from '../CardSuggestionExtras/CardSuggestionExtras';
import styles from './CatalogRequestCard.module.css';
import { CategoryQuorum } from '../CategoryQuorum/CategoryQuorum';
import { SuggestionMedia } from '../SuggestionMedia/SuggestionMedia';

interface Fact {
  label: string;
  value?: string | number;
}

function Facts({ facts }: { facts: Fact[] }) {
  const shown = facts.filter(({ value }) => value !== undefined && value !== '');
  if (shown.length === 0) return null;
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

function cardFacts({ data, references }: CatalogRequest): Fact[] {
  return [
    { label: 'Álbum / Edição', value: references.album },
    { label: 'Número', value: data.number },
    { label: 'Franquia', value: references.category },
    { label: 'Raridade', value: references.rarity },
    { label: 'Idioma', value: references.language },
    { label: 'Ilustrador', value: data.illustrator },
    {
      label: 'População estimada',
      value:
        data.estimatedPopulation === undefined
          ? undefined
          : populationLabel(data.estimatedPopulation),
    },
  ];
}

function albumFacts({ references, checklistSummary }: CatalogRequest): Fact[] {
  const summary: Fact[] = checklistSummary
    ? [
        { label: 'Total', value: cardsLabel(checklistSummary.total) },
        ...checklistSummary.rarities.map(({ name, count }) => ({
          label: rarityPluralLabel(name),
          value: cardsLabel(count),
        })),
      ]
    : [];
  return [...summary, { label: 'Franquia', value: references.category }];
}

function factsOf(request: CatalogRequest): Fact[] {
  if (request.type === 'CARD') return cardFacts(request);
  if (request.type === 'ALBUM') return albumFacts(request);
  return [{ label: 'Tipo', value: request.data.type && CATEGORY_TYPE_LABELS[request.data.type] }];
}

function albumLine({ type, data }: CatalogRequest): string | null {
  if (type !== 'ALBUM') return null;
  const parts = [data.publisher && `Editora: ${data.publisher}`, data.year && `Ano: ${data.year}`];
  return parts.filter(Boolean).join(' • ') || null;
}

const EXTRAS = { CARD: CardExtras, ALBUM: AlbumChecklist, CATEGORY: CategoryQuorum };

function CardExtras({ request }: { request: CatalogRequest }) {
  return <CardSuggestionExtras data={request.data} />;
}

export function SuggestedDetails({ request }: { request: CatalogRequest }) {
  const line = albumLine(request);
  const Extras = EXTRAS[request.type];
  const description = request.type === 'CATEGORY' ? request.data.description : undefined;

  return (
    <div className={styles.body}>
      <SuggestionMedia request={request} />
      <div className={styles.details}>
        <p className={styles.section}>{requestTypeTexts[request.type].section}</p>
        <h2 className={styles.title}>{itemNameOf(request)}</h2>
        {line && <p className={styles.subtitle}>{line}</p>}
        {description && <p className={styles.subtitle}>{description}</p>}
        <Facts facts={factsOf(request)} />
        <Extras request={request} />
      </div>
    </div>
  );
}
