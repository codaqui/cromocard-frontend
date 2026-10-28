import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router';

import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

import { type AuthTab, authTabLabels } from '../../auth.labels';
import { LoginPanel } from '../../components/LoginPanel/LoginPanel';
import { RegisterPanel } from '../../components/RegisterPanel/RegisterPanel';
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
    content: (
      <>
        <LoginPanel />
        <p className={styles.switch}>
          Não possui uma conta ainda? <Link to={paths.register}>Cadastrar gratuitamente</Link>
        </p>
      </>
    ),
  },
  register: {
    title: 'Comece sua jornada no CromoCard',
    description: 'Para começarmos, preencha seus dados de acesso',
    content: (
      <>
        <RegisterPanel />
        <p className={styles.switch}>
          Já tem uma conta? <Link to={paths.login}>Fazer login</Link>
        </p>
      </>
    ),
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
