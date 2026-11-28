import { useId } from 'react';

import type { HowItWorksItem } from '../../how-it-works.content';
import styles from './GuaranteeList.module.css';

interface GuaranteeListProps {
  title: string;
  items: HowItWorksItem[];
}

export function GuaranteeList({ title, items }: GuaranteeListProps) {
  const titleId = useId();

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.heading}>
        {title}
      </h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.title} className={styles.item}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.text}>{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
