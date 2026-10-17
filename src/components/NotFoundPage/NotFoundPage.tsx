import { Link } from 'react-router';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { paths } from '@/routes/paths';

export function NotFoundPage() {
  return (
    <EmptyState title="Página não encontrada" message="O endereço acessado não existe.">
      <Link to={paths.home}>Voltar para o início</Link>
    </EmptyState>
  );
}
