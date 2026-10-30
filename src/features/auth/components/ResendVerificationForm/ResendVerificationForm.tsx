import { Button } from '@/components/Button/Button';
import { TextField } from '@/components/TextField/TextField';

import type { ResendVerificationInput } from '../../auth.schemas';
import { useResendVerificationForm } from '../../hooks/useResendVerificationForm';
import styles from './ResendVerificationForm.module.css';

interface ResendFeedback {
  tone: 'success' | 'danger';
  message: string;
}

function Feedback({ feedback }: { feedback?: ResendFeedback }) {
  if (!feedback) return null;

  return (
    <p className={styles.feedback} data-tone={feedback.tone} role="status">
      {feedback.message}
    </p>
  );
}

interface ResendVerificationFormProps {
  defaultEmail: string;
  isSubmitting: boolean;
  feedback?: ResendFeedback;
  onSubmit: (input: ResendVerificationInput) => void;
}

export function ResendVerificationForm({
  defaultEmail,
  isSubmitting,
  feedback,
  onSubmit,
}: ResendVerificationFormProps) {
  const { register, errors, submit } = useResendVerificationForm(defaultEmail, onSubmit);

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <TextField
        label="E-mail"
        icon="envelope"
        type="email"
        autoComplete="email"
        placeholder="seu.email@exemplo.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Feedback feedback={feedback} />
      <Button type="submit" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? 'Enviando…' : 'Reenviar e-mail de confirmação'}
      </Button>
    </form>
  );
}
