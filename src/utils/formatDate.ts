const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
