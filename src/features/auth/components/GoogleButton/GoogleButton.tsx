import { useGoogleButton } from '../../hooks/useGoogleButton';
import styles from './GoogleButton.module.css';
import { GoogleLogo } from './GoogleLogo';

interface GoogleButtonProps {
  clientId: string;
  disabled: boolean;
  onCredential: (idToken: string) => void;
}

function GoogleButtonFace() {
  return (
    <span className={styles.face} aria-hidden="true">
      <GoogleLogo />
      Google
    </span>
  );
}

export function GoogleButton({ clientId, disabled, onCredential }: GoogleButtonProps) {
  const { containerRef, unavailable } = useGoogleButton(clientId, onCredential);

  return (
    <div className={styles.google}>
      <p className={styles.divider}>
        <span className={styles.dividerLabel}>Ou acesse com</span>
      </p>
      {unavailable ? (
        <p className={styles.note}>O login com Google está indisponível no momento.</p>
      ) : (
        <div className={styles.button} aria-disabled={disabled}>
          <GoogleButtonFace />
          <div ref={containerRef} className={styles.officialButton} />
        </div>
      )}
      <p className={styles.note}>Ao continuar com o Google, você aceita os Termos de Uso.</p>
    </div>
  );
}
