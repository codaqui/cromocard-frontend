import { Link, useLocation } from 'react-router';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { paths } from '@/routes/paths';

const UNAVAILABLE = { title: 'Este conteúdo não está mais disponível.', message: undefined };
const NOT_FOUND = { title: 'Página não encontrada', message: 'O endereço acessado não existe.' };

const cameFromNotification = (state: unknown) =>
  typeof state === 'object' && state !== null && 'fromNotification' in state;

export function NotFoundPage() {
  const { state } = useLocation() as { state: unknown };
  const fromNotification = cameFromNotification(state);
  const { title, message } = fromNotification ? UNAVAILABLE : NOT_FOUND;

  return (
    <EmptyState title={title} message={message}>
      <Link to={fromNotification ? paths.notifications : paths.home}>
        {fromNotification ? 'Voltar para as notificações' : 'Voltar para o início'}
      </Link>
    </EmptyState>
  );
}
