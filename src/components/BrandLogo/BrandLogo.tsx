import { useId } from 'react';

import styles from './BrandLogo.module.css';

function Sparkle() {
  const gradientId = useId();

  return (
    <svg className={styles.sparkle} viewBox="0 0 32 40" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-chart-secondary)" />
          <stop offset="1" stopColor="var(--color-primary)" />
        </linearGradient>
      </defs>
      <path
        d="M16 0 C17.6 13 19 18.4 32 20 C19 21.6 17.6 27 16 40 C14.4 27 13 21.6 0 20 C13 18.4 14.4 13 16 0 Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

export function BrandLogo() {
  return (
    <span className={styles.logo}>
      <Sparkle />
      <span className={styles.wordmark} aria-hidden="true">
        <span className={styles.accent}>C</span>ROMO<span className={styles.accent}>C</span>ARD
      </span>
    </span>
  );
}
