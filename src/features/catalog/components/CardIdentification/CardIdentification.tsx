import { EMPTY_VALUE } from '@/utils/emptyValue';
import type { CardProfile } from '../../card-profile.types';
import styles from './CardIdentification.module.css';

interface CardIdentificationProps {
  identification: CardProfile['identification'];
}

export function CardIdentification({ identification }: CardIdentificationProps) {
  const fields = [
    { label: 'Número', value: identification.number },
    { label: 'Coleção', value: identification.album?.title },
    { label: 'Categoria', value: identification.category?.name },
    { label: 'Raridade', value: identification.rarity?.name },
    { label: 'Idioma', value: identification.language?.name },
  ];

  return (
    <dl className={styles.grid} aria-label="Identificação da carta">
      {fields.map(({ label, value }) => (
        <div key={label} className={styles.field}>
          <dt className={styles.label}>{label}</dt>
          <dd className={styles.value}>{value ?? EMPTY_VALUE}</dd>
        </div>
      ))}
    </dl>
  );
}
