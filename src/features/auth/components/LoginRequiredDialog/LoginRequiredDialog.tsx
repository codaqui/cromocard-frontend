import { useLocation } from 'react-router';

import { ButtonLink } from '@/components/Button/ButtonLink';
import { Modal } from '@/components/Modal/Modal';
import { loginPathFor, rememberRedirectAfterLogin } from '@/routes/guards/loginRedirect';
import { paths } from '@/routes/paths';

import styles from './LoginRequiredDialog.module.css';

interface LoginRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

const DEFAULT_MESSAGE = 'Faça login para continuar. É rápido e grátis.';

function LoginOptions() {
  const location = useLocation();
  const rememberOrigin = () => rememberRedirectAfterLogin(`${location.pathname}${location.search}`);

  return (
    <>
      <ButtonLink to={paths.googleLogin} variant="secondary">
        Continuar com Google
      </ButtonLink>
      <p className={styles.separator}>ou</p>
      <ButtonLink to={loginPathFor(location)}>Entrar com e-mail e senha</ButtonLink>
      <ButtonLink to={paths.register} variant="secondary" onClick={rememberOrigin}>
        Criar conta grátis
      </ButtonLink>
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
