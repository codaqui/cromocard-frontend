import { Link, useLocation } from 'react-router';

import { Modal } from '@/components/Modal/Modal';
import { loginPathFor, rememberRedirectAfterLogin } from '@/routes/guards/loginRedirect';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

import styles from './LoginRequiredDialog.module.css';

interface LoginRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

const DEFAULT_MESSAGE = 'Faça login para continuar. É rápido e grátis.';

/** Toda opção guarda a página de origem, para a volta depois do login não depender do caminho escolhido. */
function LoginOptions() {
  const location = useLocation();
  const rememberOrigin = () => rememberRedirectAfterLogin(`${location.pathname}${location.search}`);
  const option = (to: string, label: string, variant: 'primary' | 'secondary') => (
    <Link to={to} className={cn(styles.action, styles[variant])} onClick={rememberOrigin}>
      {label}
    </Link>
  );

  return (
    <>
      {option(paths.googleLogin, 'Continuar com Google', 'secondary')}
      <p className={styles.separator}>ou</p>
      {option(loginPathFor(location), 'Entrar com e-mail e senha', 'primary')}
      {option(paths.register, 'Criar conta grátis', 'secondary')}
    </>
  );
}

export function LoginRequiredDialog({
  open,
  onClose,
  message = DEFAULT_MESSAGE,
}: LoginRequiredDialogProps) {
  return (
    <Modal open={open} title="Entre para continuar" onClose={onClose}>
      <div className={styles.body}>
        <p className={styles.message}>{message}</p>
        <LoginOptions />
        <p className={styles.terms}>
          Ao continuar, você aceita os Termos de Uso e a Política de Privacidade.
        </p>
      </div>
    </Modal>
  );
}
