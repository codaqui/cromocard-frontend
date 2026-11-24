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

function LoginOptions() {
  const location = useLocation();
  const loginPath = loginPathFor(location);
  const rememberOrigin = () => rememberRedirectAfterLogin(`${location.pathname}${location.search}`);

  return (
    <>
      <Link to={paths.googleLogin} className={cn(styles.action, styles.secondary)}>
        Continuar com Google
      </Link>
      <p className={styles.separator}>ou</p>
      <Link to={loginPath} className={cn(styles.action, styles.primary)}>
        Entrar com e-mail e senha
      </Link>
      <Link
        to={paths.register}
        className={cn(styles.action, styles.secondary)}
        onClick={rememberOrigin}
      >
        Criar conta grátis
      </Link>
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
