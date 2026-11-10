const VISIBLE_PAGES = 3;

export type PageSlot = number | 'gap';

export function pageSlots(page: number, totalPages: number): PageSlot[] {
  const end = Math.min(totalPages, Math.max(VISIBLE_PAGES, page + 1));
  const start = Math.max(1, end - VISIBLE_PAGES + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  if (end >= totalPages) return pages;
  return end === totalPages - 1 ? [...pages, totalPages] : [...pages, 'gap', totalPages];
}
