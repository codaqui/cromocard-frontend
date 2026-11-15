export type PagerItem = number | 'gap-start' | 'gap-end';

const COMPACT_LIMIT = 5;
const EDGE_WINDOW = 3;

export function pagerItems(page: number, totalPages: number): PagerItem[] {
  if (totalPages <= COMPACT_LIMIT) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= EDGE_WINDOW) return [1, 2, 3, 'gap-end', totalPages];
  if (page > totalPages - EDGE_WINDOW) {
    return [1, 'gap-start', totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'gap-start', page - 1, page, page + 1, 'gap-end', totalPages];
}
