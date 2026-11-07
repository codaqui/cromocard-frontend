import { Link, Outlet, useNavigate } from 'react-router';

import { Header } from '@/components/Header/Header';
import { Icon } from '@/components/Icon/Icon';
import { NavItem } from '@/components/NavItem/NavItem';
import { SearchBar, type SearchQuery } from '@/components/SearchBar/SearchBar';
import { UserMenu } from '@/components/UserMenu/UserMenu';
import { roleLabels } from '@/features/users';
import { useAuth } from '@/hooks/useAuth';
import { useSignOut } from '@/hooks/useSignOut';
import { paths, searchPathFor } from '@/routes/paths';
import type { UserRole } from '@/types/authenticated-user';

import styles from './SiteShell.module.css';
import { searchScopes, siteLinks, siteMainMenu, siteSecondaryMenu } from './siteMenu';

function SiteMenu() {
  return (
    <nav className={styles.sidebar} aria-label="Menu principal">
      {siteMainMenu.map((item) => (
        <NavItem key={item.to} to={item.to} icon={item.icon} end={item.end}>
          {item.label}
        </NavItem>
      ))}
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
        Entrar
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

  return (
    <>
      <Link to={paths.notifications} className={styles.iconButton} aria-label="Notificações">
        <Icon name="notifications" size={20} />
      </Link>
      <UserMenu name="Minha conta" caption={roleLabels[role]} actions={actions} />
    </>
  );
}

function SiteTopbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const search = ({ term, scope }: SearchQuery) => void navigate(searchPathFor(term, scope));

  return (
    <Header homePath={paths.home}>
      <SearchBar scopes={searchScopes} label="Buscar cartas, álbuns e usuários" onSearch={search} />
      <nav className={styles.links} aria-label="Atalhos">
        {siteLinks.map((link) => (
          <Link key={link.label} to={link.to} className={styles.link}>
            {link.label}
          </Link>
        ))}
      </nav>
      {user ? <AccountArea role={user.role} /> : <GuestActions />}
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
