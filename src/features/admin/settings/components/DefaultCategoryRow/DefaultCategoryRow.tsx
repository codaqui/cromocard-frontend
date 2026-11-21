import type { DragEvent } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { type CategoryBadge, categoryBadgeLabels } from '@/features/catalog';

import type { DefaultCategory } from '../../settings.types';
import { BackImagePicker, type BackImagePickerProps } from '../BackImagePicker/BackImagePicker';
import {
  CategoryOrderControls,
  type CategoryOrderControlsProps,
} from '../CategoryOrderControls/CategoryOrderControls';
import styles from './DefaultCategoryRow.module.css';

export interface RowDrag {
  isDragging: boolean;
  isDropTarget: boolean;
  onStart: (event: DragEvent<HTMLElement>) => void;
  onOver: (event: DragEvent<HTMLElement>) => void;
  onLeave: () => void;
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

function orderPropsOf(props: DefaultCategoryRowProps): CategoryOrderControlsProps {
  const { name, isPinned } = props.category;
  const { canMoveUp, canMoveDown, onTogglePin, onMoveUp, onMoveDown } = props;
  return { name, isPinned, canMoveUp, canMoveDown, onTogglePin, onMoveUp, onMoveDown };
}

function rowClassOf({ isDragging, isDropTarget }: RowDrag): string {
  const modifier = isDragging ? styles.dragging : isDropTarget && styles.dropTarget;
  return [styles.row, modifier].filter(Boolean).join(' ');
}

function dropZoneOf(drag: RowDrag) {
  return {
    className: rowClassOf(drag),
    'data-drop-target': drag.isDropTarget || undefined,
    onDragOver: drag.onOver,
    onDragLeave: drag.onLeave,
    onDrop: drag.onDrop,
  };
}

export function DefaultCategoryRow(props: DefaultCategoryRowProps) {
  const { category, position, drag, onRemove, isUploading, onChoose } = props;

  return (
    <li {...dropZoneOf(drag)}>
      <RowHandle position={position} drag={drag} />
      <CategoryIdentity category={category} />
      <div className={styles.rowActions}>
        <BackImagePicker category={category} isUploading={isUploading} onChoose={onChoose} />
        <CategoryOrderControls {...orderPropsOf(props)} />
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
