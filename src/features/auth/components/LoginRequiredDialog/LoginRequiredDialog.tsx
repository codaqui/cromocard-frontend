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

interface LoginOptionProps {
  to: string;
  label: string;
  variant: 'primary' | 'secondary';
  onClick: () => void;
}

function LoginOption({ to, label, variant, onClick }: LoginOptionProps) {
  return (
    <Link to={to} className={cn(styles.action, styles[variant])} onClick={onClick}>
      {label}
    </Link>
  );
}

function LoginOptionsRememberingOrigin() {
  const location = useLocation();
  const onClick = () => rememberRedirectAfterLogin(`${location.pathname}${location.search}`);
  const option = (to: string, label: string, variant: LoginOptionProps['variant']) => ({
    to,
    label,
    variant,
    onClick,
  });

  return (
    <>
      <LoginOption {...option(paths.googleLogin, 'Continuar com Google', 'secondary')} />
      <p className={styles.separator}>ou</p>
      <LoginOption {...option(loginPathFor(location), 'Entrar com e-mail e senha', 'primary')} />
      <LoginOption {...option(paths.register, 'Criar conta grátis', 'secondary')} />
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
        <LoginOptionsRememberingOrigin />
        <p className={styles.terms}>
          Ao continuar, você aceita os Termos de Uso e a Política de Privacidade.
        </p>
      </div>
    </Modal>
  );
}
