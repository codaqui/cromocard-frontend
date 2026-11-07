import type { IconName } from '@/components/Icon/icon-paths';
import type { SearchScope } from '@/components/SearchBar/SearchBar';
import { paths } from '@/routes/paths';

interface SiteMenuItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

interface SiteLink {
  to: string;
  label: string;
}

export const siteMainMenu: SiteMenuItem[] = [
  { to: paths.home, label: 'Início', icon: 'home', end: true },
  { to: paths.search, label: 'Pesquisar', icon: 'explore' },
  { to: paths.categories, label: 'Categorias', icon: 'category' },
  { to: paths.albums, label: 'Álbuns', icon: 'menuBook' },
  { to: paths.communities, label: 'Comunidades', icon: 'users' },
  { to: paths.profile, label: 'Perfil', icon: 'person' },
];

export const siteSecondaryMenu: SiteMenuItem[] = [
  { to: paths.settings, label: 'Configurações', icon: 'settings' },
  { to: paths.help, label: 'Suporte', icon: 'help' },
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
