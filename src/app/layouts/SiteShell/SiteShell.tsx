import { Link, NavLink, Outlet, useNavigate } from 'react-router';

import { Header } from '@/components/Header/Header';
import { Icon } from '@/components/Icon/Icon';
import { NavItem } from '@/components/NavItem/NavItem';
import { SearchBar, type SearchQuery } from '@/components/SearchBar/SearchBar';
import { UserMenu } from '@/components/UserMenu/UserMenu';
import { roleLabels, useMe } from '@/features/users';
import { useAuth } from '@/hooks/useAuth';
import { useSignOut } from '@/hooks/useSignOut';
import { paths, searchPathFor } from '@/routes/paths';
import type { UserRole } from '@/types/authenticated-user';
import { cn } from '@/utils/cn';

import styles from './SiteShell.module.css';
import { searchScopes, siteLinks, siteMainMenu, siteSecondaryMenu } from './siteMenu';

function useAccountName(role: UserRole) {
  const { data } = useMe();
  const name = data?.name ?? roleLabels[role];
  return { name, initial: data ? name.trim().charAt(0).toUpperCase() : undefined };
}

function ProfileAvatar({ role }: { role: UserRole }) {
  const { initial } = useAccountName(role);
  return <>{initial ?? <Icon name="person" size={14} />}</>;
}

function ProfileItem() {
  const { user } = useAuth();

  return (
    <NavLink
      to={paths.profile}
      className={({ isActive }) => cn(styles.profile, isActive && styles.profileActive)}
    >
      <span className={styles.profileAvatar} aria-hidden="true">
        {user ? <ProfileAvatar role={user.role} /> : <Icon name="person" size={14} />}
      </span>
      Perfil
      <span className={styles.chevron} aria-hidden="true">
        <Icon name="chevronRight" size={16} />
      </span>
    </NavLink>
  );
}

function SiteMenu() {
  return (
    <nav className={styles.sidebar} aria-label="Menu principal">
      {siteMainMenu.map((item) => (
        <NavItem key={item.to} to={item.to} icon={item.icon} end={item.end}>
          {item.label}
        </NavItem>
      ))}
      <ProfileItem />
      <hr className={styles.divider} />
      {siteSecondaryMenu.map((item) => (
        <NavItem key={item.to} to={item.to} icon={item.icon}>
          {item.label}
        </NavItem>
      ))}
    </nav>
  );
}

function GuestActions() {
  return (
    <div className={styles.guest}>
      <Link to={paths.login} className={styles.login}>
        Login
      </Link>
      <Link to={paths.register} className={styles.register}>
        Cadastrar
      </Link>
    </div>
  );
}

function useAccountActions(role: UserRole) {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const backoffice = {
    label: 'BackOffice',
    icon: 'dashboard' as const,
    onSelect: () => void navigate(paths.backoffice.root),
  };

  return [
    { label: 'Meu perfil', icon: 'person' as const, onSelect: () => void navigate(paths.profile) },
    ...(role === 'ADMIN' ? [backoffice] : []),
    { label: 'Sair', icon: 'logout' as const, onSelect: signOut },
  ];
}

function AccountArea({ role }: { role: UserRole }) {
  const actions = useAccountActions(role);
  const { name, initial } = useAccountName(role);

  return (
    <>
      <Link to={paths.notifications} className={styles.iconButton} aria-label="Notificações">
        <Icon name="notifications" size={20} />
      </Link>
      <UserMenu name={name} initial={initial} avatarFirst actions={actions} />
    </>
  );
}

function SiteLinks() {
  return (
    <nav className={styles.links} aria-label="Atalhos">
      {siteLinks.map((link) => (
        <Link key={link.label} to={link.to} className={styles.link}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function SiteTopbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const search = ({ term, scope }: SearchQuery) => void navigate(searchPathFor(term, scope));

  return (
    <Header homePath={paths.home}>
      <SearchBar scopes={searchScopes} label="Buscar cartas, álbuns e usuários" onSearch={search} />
      {user ? <AccountArea role={user.role} /> : <SiteLinks />}
      {!user && <GuestActions />}
    </Header>
  );
}

export function SiteShell() {
  return (
    <div className={styles.shell} data-theme="site">
      <SiteTopbar />
      <div className={styles.body}>
        <SiteMenu />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
