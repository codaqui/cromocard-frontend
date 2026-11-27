export function initialsOf(username: string | null): string {
  return (username ?? '?').slice(0, 2).toUpperCase();
}
