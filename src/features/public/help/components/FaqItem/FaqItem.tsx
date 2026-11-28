import { useId } from 'react';
import { Link } from 'react-router';

import { Icon } from '@/components/Icon/Icon';

import type { HelpQuestion } from '../../help.types';
import styles from './FaqItem.module.css';

interface FaqItemProps {
  item: HelpQuestion;
  open: boolean;
  onToggle: () => void;
}

function FaqAnswer({ id, item }: { id: string; item: HelpQuestion }) {
  return (
    <div id={id} className={styles.answer}>
      <p>{item.answer}</p>
      {item.link && (
        <Link to={item.link.to} className={styles.link}>
          {item.link.label}
          <Icon name="arrowForward" size={14} />
        </Link>
      )}
    </div>
  );
}

export function FaqItem({ item, open, onToggle }: FaqItemProps) {
  const answerId = useId();

  return (
    <li className={styles.item}>
      <h3 className={styles.heading}>
        <button
          type="button"
          className={styles.question}
          aria-expanded={open}
          aria-controls={answerId}
          onClick={onToggle}
        >
          {item.question}
          <Icon name={open ? 'remove' : 'add'} size={16} />
        </button>
      </h3>
      {open && <FaqAnswer id={answerId} item={item} />}
    </li>
  );
}
