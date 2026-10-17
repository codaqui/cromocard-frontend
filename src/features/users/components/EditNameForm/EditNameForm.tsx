import { Button } from '@/components/Button/Button';
import { TextField } from '@/components/TextField/TextField';

import { useEditNameForm } from '../../hooks/useEditNameForm';
import type { UpdateUserInput } from '../../users.schemas';
import styles from './EditNameForm.module.css';

interface EditNameFormProps {
  defaultName: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (input: UpdateUserInput) => void;
}

export function EditNameForm({
  defaultName,
  isSubmitting,
  errorMessage,
  onSubmit,
}: EditNameFormProps) {
  const { register, errors, submit } = useEditNameForm(defaultName, onSubmit);

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <TextField
        label="Nome"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      <Button type="submit" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? 'Salvando…' : 'Salvar'}
      </Button>
    </form>
  );
}
