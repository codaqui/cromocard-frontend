export function formatCpf(digits: string): string {
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/** CPF mascarado como no Figma (649-1164): só os 3 primeiros e os 2 dígitos verificadores ficam visíveis. */
export function maskCpf(digits: string): string {
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
}
