import type { PaginationParams } from '@/types/api';

export interface HomeBanner {
  enabled: boolean;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string | null;
}

export type CategoryType = 'ALBUM' | 'CARD';
export type MoveDirection = 'UP' | 'DOWN';

export interface CategoryView {
  id: string;
  parentCategoryId: string | null;
  name: string;
  slug: string;
  type: CategoryType;
  description: string | null;
  isDefault: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface ListCategoriesParams extends PaginationParams {
  search?: string;
  type?: CategoryType;
}

export interface CategoryInput {
  name: string;
  type: CategoryType;
  description?: string;
  parentCategoryId?: string;
  isDefault?: boolean;
}
