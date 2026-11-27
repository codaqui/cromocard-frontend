import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';

import styles from './ListingBlockedDialog.module.css';

interface ListingBlockedDialogProps {
  onClose: () => void;
  onConnectAccount: () => void;
}

export function ListingBlockedDialog({ onClose, onConnectAccount }: ListingBlockedDialogProps) {
  return (
    <Modal
      open
      role="alertdialog"
      title="Conecte sua conta de recebimento antes de anunciar"
      variant="compact"
      onClose={onClose}
      footer={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            Agora não
          </Button>
          <Button onClick={onConnectAccount}>Conectar conta Stripe</Button>
        </div>
      }
    >
      <p className={styles.text}>
        Para publicar um anúncio, sua conta Stripe precisa estar pronta para receber. O cadastro
        leva poucos minutos.
      </p>
    </Modal>
  );
}
