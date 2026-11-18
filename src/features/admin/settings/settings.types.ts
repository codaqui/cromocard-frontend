import type { CategoryBadge } from '@/features/catalog';
import type { PaginationParams } from '@/types/api';

export const SETTING_KEYS = {
  homeBanner: 'home.banner',
  notificationTemplates: 'notification.templates',
  monthlySignupGoal: 'dashboard.monthly_signup_goal',
  votingGoal: 'catalog.voting_goal',
} as const;

export interface HomeBanner {
  enabled: boolean;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string | null;
}

export interface NotificationTemplate {
  id?: string;
  name: string;
  title: string;
  content: string;
}

export interface Goals {
  monthlySignupGoal: number | null;
  votingGoal: number;
}

export interface DefaultCategory {
  id: string;
  name: string;
  slug: string | null;
  badge: CategoryBadge | null;
  isPinned: boolean;
  displayOrder: number;
  cardsCount: number;
  backImageUrl: string | null;
}

export interface DefaultCategoryInput {
  id: string;
  backImageUrl: string | null;
  isPinned: boolean;
}

export interface SettingView {
  key: string;
  value: unknown;
  description: string | null;
  updatedAt: string;
  updatedBy: { id: string; name: string } | null;
}

export interface GlobalSettings {
  banner: HomeBanner | null;
  templates: NotificationTemplate[];
  goals: Goals | null;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string | null;
  badge: CategoryBadge | null;
  cardsCount: number;
  parentCategoryId: string | null;
}

export interface ListCategoryOptionsParams extends PaginationParams {
  q?: string;
}

export type UploadFolder = 'banners' | 'cards';

export interface StoredImage {
  key: string;
  url: string;
}
