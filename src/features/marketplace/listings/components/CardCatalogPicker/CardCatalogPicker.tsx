import { type ChangeEvent, useId, useState } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/utils/cn';

import { cardOptionLabel, catalogHelpOf } from '../../listings.labels';
import { MIN_CARD_SEARCH_LENGTH, useCardSearch } from '../../listings.queries';
import type { CardOption } from '../../listings.types';
import styles from './CardCatalogPicker.module.css';

const SEARCH_DELAY_MS = 300;

interface CardCatalogPickerProps {
  value: CardOption | null;
  onChange: (card: CardOption | null) => void;
  error?: string;
}

function useCardPicker({ value, onChange }: CardCatalogPickerProps) {
  const [query, setQuery] = useState('');
  const search = useCardSearch(useDebounce(query, SEARCH_DELAY_MS));
  const typing = !value && query.trim().length >= MIN_CARD_SEARCH_LENGTH;

  return {
    search,
    typing,
    text: value ? cardOptionLabel(value) : query,
    type: (event: ChangeEvent<HTMLInputElement>) => {
      if (value) onChange(null);
      setQuery(event.target.value);
    },
    choose: (card: CardOption) => {
      onChange(card);
      setQuery('');
    },
  };
}

type CardPicker = ReturnType<typeof useCardPicker>;

function SearchStatus({ search }: Pick<CardPicker, 'search'>) {
  if (search.isError) return <p className={styles.status}>Não foi possível buscar as cartas.</p>;
  if (search.isPending) return <p className={styles.status}>Buscando cartas…</p>;
  if (search.data.data.length === 0) {
    return <p className={styles.status}>Nenhuma carta encontrada no catálogo.</p>;
  }
  return null;
}

function CardOptions({ picker, listId }: { picker: CardPicker; listId: string }) {
  const cards = picker.search.data?.data ?? [];

  return (
    <div className={styles.results}>
      <SearchStatus search={picker.search} />
      {cards.length > 0 && (
        <ul id={listId} role="listbox" aria-label="Cartas do catálogo" className={styles.list}>
          {cards.map((card) => (
            <li key={card.id} role="option" aria-selected="false">
              <button type="button" className={styles.option} onClick={() => picker.choose(card)}>
                {cardOptionLabel(card)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PickerHelp({ value, error }: Pick<CardCatalogPickerProps, 'value' | 'error'>) {
  if (error) {
    return (
      <span className={styles.error} role="alert">
        {error}
      </span>
    );
  }
  if (!value) return null;
  return <span className={styles.help}>{catalogHelpOf(value)}</span>;
}

interface PickerInputProps {
  ids: { input: string; list: string };
  picker: CardPicker;
  field: CardCatalogPickerProps;
}

function PickerInput({ ids, picker, field }: PickerInputProps) {
  return (
    <div className={cn(styles.control, field.error && styles.invalid)}>
      <Icon name="search" size={20} />
      <input
        id={ids.input}
        role="combobox"
        aria-expanded={picker.typing}
        aria-controls={ids.list}
        aria-invalid={Boolean(field.error)}
        className={styles.input}
        placeholder="Busque a carta pelo nome"
        autoComplete="off"
        value={picker.text}
        onChange={picker.type}
      />
      {field.value && (
        <span className={styles.check} aria-label="Carta identificada no catálogo">
          <Icon name="verifiedUser" size={20} />
        </span>
      )}
    </div>
  );
}

export function CardCatalogPicker(props: CardCatalogPickerProps) {
  const ids = { input: useId(), list: useId() };
  const picker = useCardPicker(props);

  return (
    <div className={styles.field}>
      <label htmlFor={ids.input} className={styles.label}>
        Carta do catálogo
      </label>
      <PickerInput ids={ids} picker={picker} field={props} />
      {picker.typing && <CardOptions picker={picker} listId={ids.list} />}
      <PickerHelp value={props.value} error={props.error} />
    </div>
  );
}
