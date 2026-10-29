import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import { Checkbox } from '@/components/Checkbox/Checkbox';
import { Icon } from '@/components/Icon/Icon';
import { TextField } from '@/components/TextField/TextField';
import type { ApiError } from '@/lib/api-error';

import type { RegisterInput } from '../../auth.schemas';
import { useRegisterForm } from '../../hooks/useRegisterForm';
import { NewPasswordField } from '../NewPasswordField/NewPasswordField';
import { PasswordField } from '../PasswordField/PasswordField';
import { RoleSelector } from '../RoleSelector/RoleSelector';
import styles from './RegisterForm.module.css';

type RegisterFields = ReturnType<typeof useRegisterForm>;

function IdentityFields({ register, errors }: Pick<RegisterFields, 'register' | 'errors'>) {
  return (
    <>
      <TextField
        label="Nome completo"
        icon="person"
        autoComplete="name"
        placeholder="Ex: Gabriel Nascimento"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="E-mail institucional ou pessoal"
        icon="envelope"
        type="email"
        autoComplete="email"
        placeholder="Ex: gabriel@email.com"
        error={errors.email?.message}
        {...register('email')}
      />
    </>
  );
}

function ConfirmPasswordField({ register, errors }: Pick<RegisterFields, 'register' | 'errors'>) {
  return (
    <PasswordField
      label="Confirmar senha"
      autoComplete="new-password"
      placeholder="Repita sua senha escolhida"
      revealable={false}
      error={errors.confirmPassword?.message}
      {...register('confirmPassword')}
    />
  );
}

function TermsLabel() {
  return (
    <span>
      Concordo com os <span className={styles.highlight}>Termos de Uso</span> e a{' '}
      <span className={styles.highlight}>Política de Privacidade</span> do ecossistema CromoCard.
    </span>
  );
}

function TermsField({ register, errors }: Pick<RegisterFields, 'register' | 'errors'>) {
  return (
    <div className={styles.terms}>
      <Checkbox
        label={<TermsLabel />}
        error={errors.termsAccepted?.message}
        {...register('termsAccepted')}
      />
    </div>
  );
}

interface RegisterFormProps {
  isSubmitting: boolean;
  apiError: ApiError | null;
  onSubmit: (input: RegisterInput) => void;
}

export function RegisterForm({ isSubmitting, apiError, onSubmit }: RegisterFormProps) {
  const { register, errors, submit, password, role, formError } = useRegisterForm(
    onSubmit,
    apiError,
  );

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <IdentityFields register={register} errors={errors} />
      <RoleSelector selected={role} error={errors.role?.message} {...register('role')} />
      <NewPasswordField
        label="Sua melhor senha"
        password={password}
        error={errors.password?.message}
        {...register('password')}
      />
      <ConfirmPasswordField register={register} errors={errors} />
      <TermsField register={register} errors={errors} />
      <FormError message={formError} />
      <Button type="submit" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? 'Criando conta…' : 'Criar Conta'}
        {!isSubmitting && <Icon name="arrowForward" size={20} />}
      </Button>
    </form>
  );
}
