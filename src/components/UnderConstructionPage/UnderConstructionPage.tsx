import { EmptyState } from '@/components/EmptyState/EmptyState';

import styles from './UnderConstructionPage.module.css';

interface UnderConstructionPageProps {
  title: string;
  story: string;
}

export function UnderConstructionPage({ title, story }: UnderConstructionPageProps) {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <EmptyState title="Em construção" message={`Esta tela chega com a user story ${story}.`} />
    </section>
  );
}
