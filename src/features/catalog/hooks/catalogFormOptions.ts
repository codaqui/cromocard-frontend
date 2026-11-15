import type { ApiError } from '@/lib/api-error';

import type { ReportInvalid } from '../components/CatalogFormModal/CatalogFormModal';

/** O que os formulários do catálogo repassam aos hooks deles. */
export interface CatalogFormOptions<TItem, TInput> {
  item?: TItem;
  onSubmit: (input: TInput) => void;
  apiError: ApiError | null;
  onInvalidChange?: ReportInvalid;
}
