import type { IconName } from '@/components/Icon/icon-paths';
import type { SearchScope } from '@/components/SearchBar/SearchBar';
import { paths } from '@/routes/paths';
import type { UserRole } from '@/types/authenticated-user';

interface SiteMenuItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
  hiddenFor?: UserRole;
}

interface SiteLink {
  to: string;
  label: string;
}

export const siteMainMenu: SiteMenuItem[] = [
  { to: paths.home, label: 'Início', icon: 'homeOutline', end: true },
  { to: paths.search, label: 'Pesquisar', icon: 'exploreOutline' },
  { to: paths.categories, label: 'Categorias', icon: 'gridView' },
  { to: paths.albums, label: 'Álbuns', icon: 'bookOutline' },
  { to: paths.communities, label: 'Comunidades', icon: 'peopleOutline' },
  { to: paths.suggestions, label: 'Sugestões', icon: 'howToVote', hiddenFor: 'ADMIN' },
];

export const mainMenuFor = (role?: UserRole) =>
  siteMainMenu.filter(({ hiddenFor }) => hiddenFor === undefined || hiddenFor !== role);

export const sellerMenu: SiteMenuItem[] = [
  { to: paths.seller.overview, label: 'Visão geral', icon: 'gridView', end: true },
];

export const sellerMenuFor = (role?: UserRole) => (role === 'SELLER' ? sellerMenu : []);

export const siteSecondaryMenu: SiteMenuItem[] = [
  { to: paths.settings, label: 'Configurações', icon: 'settingsOutline' },
  { to: paths.help, label: 'Suporte', icon: 'infoOutline' },
];

export const siteLinks: SiteLink[] = [
  { to: paths.highlights, label: 'Destaques' },
  { to: paths.categories, label: 'Categorias' },
  { to: paths.communities, label: 'Comunidades' },
  { to: paths.help, label: 'FAQ' },
];

export const searchScopes: readonly SearchScope[] = [
  { value: 'cartas', label: 'Cartas' },
  { value: 'usuarios', label: 'Usuários' },
  { value: 'grupos', label: 'Grupos' },
];
