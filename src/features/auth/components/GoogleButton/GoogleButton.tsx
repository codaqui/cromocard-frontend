import { useGoogleButton } from '../../hooks/useGoogleButton';
import styles from './GoogleButton.module.css';

interface GoogleButtonProps {
  clientId: string;
  disabled: boolean;
  onCredential: (idToken: string) => void;
}

export function GoogleButton({ clientId, disabled, onCredential }: GoogleButtonProps) {
  const { containerRef, unavailable } = useGoogleButton(clientId, onCredential);

  return (
    <div className={styles.google}>
      <p className={styles.divider}>
        <span>Ou acesse com</span>
      </p>
      {unavailable ? (
        <p className={styles.unavailable}>O login com Google está indisponível no momento.</p>
      ) : (
        <div ref={containerRef} className={styles.button} aria-disabled={disabled} />
      )}
      <p className={styles.terms}>Ao continuar com o Google, você aceita os Termos de Uso.</p>
    </div>
  );
}
