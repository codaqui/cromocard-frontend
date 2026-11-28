import { EmptyState } from '@/components/EmptyState/EmptyState';

import type { HelpQuestion } from '../../help.types';
import { useOpenQuestions } from '../../hooks/useOpenQuestions';
import { FaqItem } from '../FaqItem/FaqItem';
import styles from './FaqList.module.css';

interface FaqListProps {
  questions: HelpQuestion[];
  term: string;
}

export function FaqList({ questions, term }: FaqListProps) {
  const { isOpen, toggle } = useOpenQuestions();

  if (questions.length === 0) {
    return (
      <div className={styles.panel}>
        <EmptyState title={`Nenhuma pergunta encontrada para “${term.trim()}”.`} />
      </div>
    );
  }

  return (
    <ul className={styles.panel} aria-label="Perguntas frequentes">
      {questions.map((item) => (
        <FaqItem
          key={item.id}
          item={item}
          open={isOpen(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </ul>
  );
}
