import { type ChangeEvent, type DragEvent, useId } from 'react';

import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { type CategoryBadge, categoryBadgeLabels } from '@/features/catalog';

import type { DefaultCategory } from '../../settings.types';
import styles from './DefaultCategoryRow.module.css';

interface BackImagePickerProps {
  category: DefaultCategory;
  isUploading: boolean;
  onChoose: (file: File) => void;
}

function backActionOf({ backImageUrl }: DefaultCategory, isUploading: boolean): string {
  if (isUploading) return 'Enviando…';
  return backImageUrl ? 'Trocar verso' : 'Enviar verso';
}

function BackThumb({ url }: { url: string | null }) {
  if (url) return <img className={styles.backThumb} src={url} alt="" />;
  return <span className={styles.backEmpty} aria-hidden="true" />;
}

function chosenFile(event: ChangeEvent<HTMLInputElement>): File | undefined {
  const file = event.target.files?.[0];
  event.target.value = '';
  return file;
}

interface BackFileInputProps {
  inputId: string;
  label: string;
  disabled: boolean;
  onChoose: (file: File) => void;
}

function BackFileInput({ inputId, label, disabled, onChoose }: BackFileInputProps) {
  return (
    <input
      id={inputId}
      type="file"
      accept="image/png,image/jpeg,image/webp"
      className={styles.fileInput}
      aria-label={label}
      disabled={disabled}
      onChange={(event) => {
        const file = chosenFile(event);
        if (file) onChoose(file);
      }}
    />
  );
}

function BackImagePicker({ category, isUploading, onChoose }: BackImagePickerProps) {
  const inputId = useId();
  const action = backActionOf(category, isUploading);
  const input = {
    inputId,
    label: `${action} de ${category.name}`,
    disabled: isUploading,
    onChoose,
  };

  return (
    <>
      <label htmlFor={inputId} className={styles.back}>
        <BackThumb url={category.backImageUrl} />
        {action}
      </label>
      <BackFileInput {...input} />
    </>
  );
}

export interface RowDrag {
  isDragging: boolean;
  onStart: (event: DragEvent<HTMLElement>) => void;
  onOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: () => void;
  onEnd: () => void;
}

interface DefaultCategoryRowProps extends BackImagePickerProps {
  position: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  drag: RowDrag;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onTogglePin: () => void;
  onRemove: () => void;
}

const badgeClasses: Record<CategoryBadge, string | undefined> = {
  STANDARD: styles.standard,
  TRENDING: styles.trending,
};

function cardsLabelOf(count: number): string {
  return `${count.toLocaleString('pt-BR')} ${count === 1 ? 'carta' : 'cartas'}`;
}

function CategoryIdentity({ category }: { category: DefaultCategory }) {
  const { name, slug, badge, isPinned, cardsCount } = category;

  return (
    <div className={styles.identity}>
      <p className={styles.nameLine}>
        <span className={styles.name}>{name}</span>
        {isPinned && <span className={styles.pinnedBadge}>Fixado no topo</span>}
        {badge && <span className={badgeClasses[badge]}>{categoryBadgeLabels[badge]}</span>}
      </p>
      <p className={styles.meta}>
        Slug: {slug ? `/${slug}` : 'sem slug'} • {cardsLabelOf(cardsCount)}
      </p>
    </div>
  );
}

function RowHandle({ position, drag }: { position: number; drag: RowDrag }) {
  return (
    <>
      <span
        aria-hidden="true"
        data-testid="drag-handle"
        className={styles.handle}
        draggable
        onDragStart={drag.onStart}
        onDragEnd={drag.onEnd}
      >
        <Icon name="dragIndicator" size={20} />
      </span>
      <span className={styles.position} aria-hidden="true">
        {position}
      </span>
    </>
  );
}

interface IconControlProps {
  icon: IconName;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
}

function IconControl({ icon, label, onClick, disabled, pressed }: IconControlProps) {
  const active = pressed ? styles.pinned : styles.control;

  return (
    <button
      type="button"
      className={active}
      aria-label={label}
      aria-pressed={pressed}
      aria-disabled={disabled}
      onClick={() => !disabled && onClick()}
    >
      <Icon name={icon} size={18} />
    </button>
  );
}

interface OrderControlsProps {
  name: string;
  isPinned: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onTogglePin: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function OrderControls(props: OrderControlsProps) {
  const { name } = props;

  return (
    <div className={styles.order}>
      <IconControl
        icon="pushPin"
        label={`Fixar ${name} no topo`}
        pressed={props.isPinned}
        onClick={props.onTogglePin}
      />
      <IconControl
        icon="expandLess"
        label={`Mover ${name} para cima`}
        disabled={!props.canMoveUp}
        onClick={props.onMoveUp}
      />
      <IconControl
        icon="expandMore"
        label={`Mover ${name} para baixo`}
        disabled={!props.canMoveDown}
        onClick={props.onMoveDown}
      />
    </div>
  );
}

function orderPropsOf(props: DefaultCategoryRowProps): OrderControlsProps {
  const { name, isPinned } = props.category;
  const { canMoveUp, canMoveDown, onTogglePin, onMoveUp, onMoveDown } = props;
  return { name, isPinned, canMoveUp, canMoveDown, onTogglePin, onMoveUp, onMoveDown };
}

export function DefaultCategoryRow(props: DefaultCategoryRowProps) {
  const { category, position, drag, onRemove, isUploading, onChoose } = props;
  const className = drag.isDragging ? `${styles.row} ${styles.dragging}` : styles.row;

  return (
    <li className={className} onDragOver={drag.onOver} onDrop={drag.onDrop}>
      <RowHandle position={position} drag={drag} />
      <CategoryIdentity category={category} />
      <div className={styles.rowActions}>
        <BackImagePicker category={category} isUploading={isUploading} onChoose={onChoose} />
        <OrderControls {...orderPropsOf(props)} />
        <button
          type="button"
          className={styles.remove}
          aria-label={`Remover ${category.name} das categorias padrão`}
          onClick={onRemove}
        >
          <Icon name="delete" size={18} />
        </button>
      </div>
    </li>
  );
}
