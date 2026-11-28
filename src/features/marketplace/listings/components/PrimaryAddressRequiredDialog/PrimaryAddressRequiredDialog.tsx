import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';

import styles from '../ListingBlockedDialog/ListingBlockedDialog.module.css';

interface PrimaryAddressRequiredDialogProps {
  onClose: () => void;
  onRegisterAddress: () => void;
}

function DialogActions({ onClose, onRegisterAddress }: PrimaryAddressRequiredDialogProps) {
  return (
    <div className={styles.footer}>
      <Button variant="secondary" onClick={onClose}>
        Agora não
      </Button>
      <Button onClick={onRegisterAddress}>Cadastrar endereço</Button>
    </div>
  );
}

export function PrimaryAddressRequiredDialog(props: PrimaryAddressRequiredDialogProps) {
  return (
    <Modal
      open
      role="alertdialog"
      title="Cadastre seu endereço principal antes de anunciar"
      variant="compact"
      onClose={props.onClose}
      footer={<DialogActions {...props} />}
    >
      <p className={styles.text}>
        Cadastre seu endereço principal antes de anunciar. Ele é a origem do frete.
      </p>
    </Modal>
  );
}
