import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

import { type AuthTab, authTabLabels } from '../../auth.labels';
import styles from './AuthPage.module.css';

interface AuthPanel {
  title: string;
  description: string;
  content: ReactNode;
}

const tabPaths: Record<AuthTab, string> = { login: paths.login, register: paths.register };

const panels: Record<AuthTab, AuthPanel> = {
  login: {
    title: 'Faça login na sua conta',
    description:
      'Bem-vindo de volta! Entre para negociar, catalogar e gerenciar seus cards graduados e colecionáveis raros com custódia garantida.',
    content: null,
  },
  register: {
    title: 'Crie sua conta',
    description: 'Cadastre-se para organizar sua coleção e participar da comunidade.',
    content: null,
  },
};

function AuthTabs() {
  return (
    <nav className={styles.tabs} aria-label="Acesso à conta">
      {(Object.keys(tabPaths) as AuthTab[]).map((tab) => (
        <NavLink
          key={tab}
          to={tabPaths[tab]}
          className={({ isActive }) => cn(styles.tab, isActive && styles.active)}
        >
          {authTabLabels[tab]}
        </NavLink>
      ))}
    </nav>
  );
}

interface AuthPageProps {
  tab: AuthTab;
}

export function AuthPage({ tab }: AuthPageProps) {
  const { title, description, content } = panels[tab];

  return (
    <section className={styles.page}>
      <AuthTabs />
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </header>
      {content}
    </section>
  );
}
