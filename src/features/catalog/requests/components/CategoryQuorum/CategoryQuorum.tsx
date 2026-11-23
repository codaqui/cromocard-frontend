import { quorumHeadline } from '../../catalog-requests.format';
import type { CatalogRequest, QuorumVotes } from '../../catalog-requests.types';
import { SuggestionPanel } from '../SuggestionPanel/SuggestionPanel';
import { VoteBreakdown } from '../VoteBreakdown/VoteBreakdown';
import styles from './CategoryQuorum.module.css';

const FULL = 100;

function Quorum({ votes }: { votes: QuorumVotes }) {
  const filled = Math.min(votes.goalPercent, FULL);
  return (
    <SuggestionPanel
      label="Votação da comunidade"
      icon="howToVote"
      title={`Votação da comunidade (meta: ${votes.goal} votos)`}
      aside={<strong className={styles.goal}>{quorumHeadline(votes)}</strong>}
    >
      <div
        className={styles.bar}
        role="progressbar"
        aria-label="Votos em relação à meta"
        aria-valuemin={0}
        aria-valuemax={FULL}
        aria-valuenow={filled}
      >
        <span style={{ width: `${filled}%` }} />
      </div>
      <VoteBreakdown votes={votes} variant="quorum" />
    </SuggestionPanel>
  );
}

export function CategoryQuorum({ request: { data, votes } }: { request: CatalogRequest }) {
  const subcategories = data.subcategories ?? [];
  return (
    <>
      {votes && <Quorum votes={votes} />}
      {subcategories.length > 0 && (
        <section className={styles.subcategories} aria-label="Subcategorias a criar">
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
