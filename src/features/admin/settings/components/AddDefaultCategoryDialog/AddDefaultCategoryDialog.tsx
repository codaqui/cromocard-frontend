import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Modal } from '@/components/Modal/Modal';
import { TextField } from '@/components/TextField/TextField';
import { useDebounce } from '@/hooks/useDebounce';

import { useCategoryOptions } from '../../settings.queries';
import type { CategoryOption } from '../../settings.types';
import styles from './AddDefaultCategoryDialog.module.css';

const SEARCH_DELAY_MS = 300;

interface AddDefaultCategoryDialogProps {
  excludedIds: string[];
  onAdd: (category: CategoryOption) => void;
  onClose: () => void;
}

function useFranchiseOptions(term: string, excludedIds: string[]) {
  const q = useDebounce(term.trim(), SEARCH_DELAY_MS);
  const query = useCategoryOptions(q || undefined);
  const options = (query.data?.pages ?? [])
    .flatMap(({ data }) => data)
    .filter(({ id, parentCategoryId }) => parentCategoryId === null && !excludedIds.includes(id));
  return { options, query };
}

type OptionsQuery = ReturnType<typeof useCategoryOptions>;

function LoadMoreButton({ query }: { query: OptionsQuery }) {
  if (!query.hasNextPage) return null;

  return (
    <Button
      variant="secondary"
      className={styles.loadMore}
      disabled={query.isFetchingNextPage}
      onClick={() => void query.fetchNextPage()}
    >
      {query.isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
    </Button>
  );
}

interface OptionListProps {
  options: CategoryOption[];
  onAdd: (category: CategoryOption) => void;
}

function OptionList({ options, onAdd }: OptionListProps) {
  if (options.length === 0) return <p className={styles.empty}>Nenhuma franquia encontrada.</p>;

  return (
    <ul className={styles.list}>
      {options.map((option) => (
        <li key={option.id} className={styles.option}>
          <span className={styles.name}>{option.name}</span>
          <Button
            variant="secondary"
            aria-label={`Adicionar ${option.name}`}
            onClick={() => onAdd(option)}
          >
            Adicionar
          </Button>
        </li>
      ))}
    </ul>
  );
}

function FranchiseResults({
  term,
  excludedIds,
  onAdd,
}: { term: string } & Omit<AddDefaultCategoryDialogProps, 'onClose'>) {
  const { options, query } = useFranchiseOptions(term, excludedIds);
  if (query.error) {
    return (
      <p className={styles.error} role="alert">
        {query.error.message}
      </p>
    );
  }
  if (query.isPending) return <LoadingState message="Buscando franquias…" />;
  return (
    <>
      <OptionList options={options} onAdd={onAdd} />
      <LoadMoreButton query={query} />
    </>
  );
}

export function AddDefaultCategoryDialog({ onClose, ...results }: AddDefaultCategoryDialogProps) {
  const [term, setTerm] = useState('');

  return (
    <Modal open title="Adicionar categoria padrão" onClose={onClose}>
      <p className={styles.subtitle}>
        Só franquias, categorias sem categoria pai, podem ser padrão.
      </p>
      <TextField
        label="Buscar franquia"
        icon="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
      />
      <FranchiseResults term={term} {...results} />
    </Modal>
  );
}
