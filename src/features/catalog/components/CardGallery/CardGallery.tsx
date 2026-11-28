import { useState } from 'react';

import { cn } from '@/utils/cn';

import styles from './CardGallery.module.css';

interface CardGalleryProps {
  name: string;
  images: string[];
}

interface ThumbnailsProps {
  images: string[];
  selected: number;
  onSelect: (index: number) => void;
}

function Thumbnails({ images, selected, onSelect }: ThumbnailsProps) {
  return (
    <ul className={styles.thumbnails} aria-label="Imagens da carta">
      {images.map((url, index) => (
        <li key={url}>
          <button
            type="button"
            className={cn(styles.thumbnail, index === selected && styles.selected)}
            aria-label={`Ver imagem ${index + 1} de ${images.length}`}
            aria-pressed={index === selected}
            onClick={() => onSelect(index)}
          >
            <img src={url} alt="" className={styles.thumbnailImage} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function CardGallery({ name, images }: CardGalleryProps) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        {current ? (
          <img src={current} alt={name} className={styles.mainImage} />
        ) : (
          <span className={styles.placeholder}>Sem imagem</span>
        )}
      </div>
      {images.length > 1 && (
        <Thumbnails images={images} selected={selected} onSelect={setSelected} />
      )}
    </div>
  );
}
