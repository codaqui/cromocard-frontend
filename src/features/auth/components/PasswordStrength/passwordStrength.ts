const strengthRules: ((password: string) => boolean)[] = [
  (password) => password.length >= 8,
  (password) => /[A-Za-z]/.test(password) && /\d/.test(password),
  (password) => /[^A-Za-z\d]/.test(password),
  (password) => password.length >= 12,
];

export const MAX_PASSWORD_STRENGTH = strengthRules.length;

export function passwordStrength(password: string): number {
  if (!password) return 0;
  return strengthRules.filter((rule) => rule(password)).length;
}

const strengthLabels = ['', 'Fraca', 'Média', 'Boa', 'Forte & Segura'];

export function passwordStrengthLabel(strength: number): string {
  return strengthLabels[strength] ?? '';
}
