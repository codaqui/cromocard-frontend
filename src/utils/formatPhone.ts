export function formatPhone(digits: string): string {
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  const splitAt = rest.length - 4;
  return `+55 (${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`;
}
