import { EmptyState } from '@/components/EmptyState/EmptyState';

import styles from './UnderConstruction.module.css';

interface UnderConstructionProps {
  title: string;
  userStory: string;
}

export function UnderConstruction({ title, userStory }: UnderConstructionProps) {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <EmptyState
        title="Em construção"
        message={`Esta tela faz parte da ${userStory}. Veja as tasks no Azure DevOps.`}
      />
    </section>
  );
}
