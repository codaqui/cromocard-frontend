import { Icon } from '@/components/Icon/Icon';

import { countWithShare } from '../../catalog-request-votes.format';
import { quorumHeadline } from '../../catalog-requests.format';
import type { CatalogRequest, QuorumVotes } from '../../catalog-requests.types';
import extras from './CardExtras.module.css';

const FULL = 100;

function QuorumCounts({ votes }: { votes: QuorumVotes }) {
  const counts = [
    { label: 'A favor', value: votes.for, tone: extras.for },
    { label: 'Neutros', value: votes.neutral, tone: extras.neutral },
    { label: 'Contra', value: votes.against, tone: extras.against },
  ];
  return (
    <dl className={extras.counts}>
      {counts.map(({ label, value, tone }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd className={tone}>{countWithShare(value, votes.total)}</dd>
        </div>
      ))}
    </dl>
  );
}

function Quorum({ votes }: { votes: QuorumVotes }) {
  const filled = Math.min(votes.goalPercent, FULL);
  return (
    <section className={extras.panel} aria-label="Votação da comunidade">
      <header className={extras.panelHeader}>
        <h3 className={extras.panelTitle}>
          <Icon name="howToVote" size={14} />
          Votação da comunidade (meta: {votes.goal} votos)
        </h3>
        <strong className={extras.goal}>{quorumHeadline(votes)}</strong>
      </header>
      <div
        className={extras.bar}
        role="progressbar"
        aria-label="Votos em relação à meta"
        aria-valuemin={0}
        aria-valuemax={FULL}
        aria-valuenow={filled}
      >
        <span style={{ width: `${filled}%` }} />
      </div>
      <QuorumCounts votes={votes} />
    </section>
  );
}

/** Descrição, quórum e subcategorias da sugestão de categoria (CCD103, R5, R12). */
export function CategoryQuorum({ request: { data, votes } }: { request: CatalogRequest }) {
  const subcategories = data.subcategories ?? [];
  return (
    <>
      {votes && <Quorum votes={votes} />}
      {subcategories.length > 0 && (
        <section className={extras.subcategories} aria-label="Subcategorias a criar">
          <h3>Subcategorias a criar:</h3>
          <ul>
            {subcategories.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
