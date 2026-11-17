import { useId } from 'react';

import { TextField } from '@/components/TextField/TextField';

import { useGoalsForm } from '../../hooks/useGoalsForm';
import type { Notify } from '../../hooks/useSettingsNotice';
import type { Goals } from '../../settings.types';
import { ModuleActions } from '../ModuleActions/ModuleActions';
import { SettingsModule } from '../SettingsModule/SettingsModule';
import styles from './GoalsModule.module.css';

type GoalsForm = ReturnType<typeof useGoalsForm>;

function GoalsFields({
  formId,
  form,
  submit,
}: Pick<GoalsForm, 'form' | 'submit'> & { formId: string }) {
  const { errors } = form.formState;

  return (
    <form id={formId} className={styles.fields} noValidate onSubmit={submit}>
      <TextField
        label="Meta mensal de novos cadastros"
        hint="Usada no indicador de novos cadastros do Dashboard (filtro de 30 dias)."
        inputMode="numeric"
        error={errors.monthlySignupGoal?.message}
        {...form.register('monthlySignupGoal')}
      />
      <TextField
        label="Meta de votos das sugestões de categoria"
        hint="Usada no quórum da Fila de Solicitações."
        inputMode="numeric"
        error={errors.votingGoal?.message}
        {...form.register('votingGoal')}
      />
    </form>
  );
}

interface GoalsModuleProps {
  goals: Goals | null;
  notify: Notify;
}

export function GoalsModule({ goals, notify }: GoalsModuleProps) {
  const formId = useId();
  const { form, submit, cancel, isSaving } = useGoalsForm(goals, notify);
  const actions = { formId, saveLabel: 'Salvar metas', isSaving, onCancel: cancel };

  return (
    <SettingsModule
      icon="sort"
      title="Módulo 4: Metas"
      subtitle="Metas usadas no Dashboard e na votação das sugestões de categoria."
      actions={<ModuleActions {...actions} />}
    >
      <GoalsFields formId={formId} form={form} submit={submit} />
    </SettingsModule>
  );
}
