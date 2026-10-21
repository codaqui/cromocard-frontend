import { EmptyState } from '@/components/EmptyState/EmptyState';

interface ComingSoonPageProps {
  title: string;
  plannedFor: string;
}

export function ComingSoonPage({ title, plannedFor }: ComingSoonPageProps) {
  return <EmptyState title={title} message={`Previsto para a ${plannedFor}.`} />;
}
