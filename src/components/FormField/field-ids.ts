interface FieldMessages {
  hint?: string;
  error?: string;
}

export const hintIdOf = (inputId: string) => `${inputId}-hint`;
export const errorIdOf = (inputId: string) => `${inputId}-error`;

export function describedByOf(inputId: string, { hint, error }: FieldMessages) {
  const ids = [hint && hintIdOf(inputId), error && errorIdOf(inputId)].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}
