import { Icon } from '@/components/Icon/Icon';

import type { SuggestedData, SuggestionSource } from '../../catalog-requests.types';
import extras from './CardExtras.module.css';

function Justification({ text }: { text: string }) {
  return (
    <section className={extras.quote} aria-label="Justificativa">
      <h3 className={extras.label}>
        <Icon name="formatQuote" size={14} />
        Justificativa
      </h3>
      <p>“{text}”</p>
    </section>
  );
}

function Source({ label, url }: SuggestionSource) {
  if (!url) return <span className={extras.source}>{label}</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer" className={extras.source}>
      <Icon name="link" size={14} />
      {label}
      <Icon name="openInNew" size={14} />
    </a>
  );
}

function Sources({ sources }: { sources: SuggestionSource[] }) {
  return (
    <section aria-label="Fontes">
      <h3 className={extras.label}>Fontes</h3>
      <ul className={extras.sources}>
        {sources.map((source) => (
          <li key={source.label}>
            <Source {...source} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Justificativa e fontes da sugestão de carta (CCD103, R10). */
export function CardSuggestionExtras({ data }: { data: SuggestedData }) {
  const sources = data.sources ?? [];
  return (
    <>
      {data.justification && <Justification text={data.justification} />}
      {sources.length > 0 && <Sources sources={sources} />}
    </>
  );
}
