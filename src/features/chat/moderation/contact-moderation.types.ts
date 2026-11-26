import type { PaginationMeta } from '@/types/api';

export type ModerationOption = 'block' | 'blockAndReport' | 'report';

export type ContactReportReason = 'Golpe / pagamento externo' | 'Assédio' | 'Spam' | 'Perfil falso';

export interface ContactReportInput {
  userId: string;
  reason: ContactReportReason;
  description?: string;
  block: boolean;
  evidences: File[];
}

export interface CreatedContactReport {
  id: string;
  status: 'PENDING';
  blocked: boolean;
}

export interface BlockedContact {
  userId: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  blockedAt: string;
}

export interface BlockedContactsPage {
  data: BlockedContact[];
  meta: PaginationMeta;
}
