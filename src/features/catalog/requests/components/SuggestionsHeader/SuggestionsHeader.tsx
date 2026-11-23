import { Icon } from '@/components/Icon/Icon';

import { countLabel } from '../../catalog-request-votes.format';
import styles from './SuggestionsHeader.module.css';

interface SuggestionsHeaderProps {
  open?: number;
  myVotes?: number;
}

function HeaderChips({ open, myVotes }: { open: number; myVotes?: number }) {
  return (
    <ul className={styles.chips} aria-label="Resumo da votação">
      <li className={styles.openChip}>
        <span className={styles.dot} aria-hidden="true" />
        {open} em votação
      </li>
      {myVotes !== undefined && myVotes > 0 && (
        <li className={styles.chip}>
          <Icon name="howToVote" size={14} />
          {countLabel(myVotes, 'voto seu', 'votos seus')}
        </li>
      )}
    </ul>
  );
}

export function SuggestionsHeader({ open, myVotes }: SuggestionsHeaderProps) {
  return (
    <header className={styles.header}>
      <p className={styles.eyebrow}>
        <Icon name="howToVote" size={16} />
        Curadoria da comunidade • votação aberta
      </p>
      <h1 className={styles.title}>Sugestões da comunidade</h1>
      <p className={styles.description}>
        Vote a favor, neutro ou contra as novas categorias sugeridas pelos colecionadores. O
        resultado ajuda a equipe do CromoCard a decidir o que entra no catálogo.
      </p>
      {open !== undefined && <HeaderChips open={open} myVotes={myVotes} />}
    </header>
  );
}
