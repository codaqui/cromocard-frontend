import { type CatalogIconName, catalogIconPaths } from '../../catalog-icon-paths';

interface CatalogIconProps {
  name: CatalogIconName;
  size?: number;
}

export function CatalogIcon({ name, size = 18 }: CatalogIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={catalogIconPaths[name]} />
    </svg>
  );
}
