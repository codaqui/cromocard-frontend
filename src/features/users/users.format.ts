/** Iniciais do avatar: primeira letra das duas primeiras palavras do nome. */
export function initialsOf(name: string): string {
  const [first, second] = name.trim().split(/\s+/);
  return `${first?.[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase();
}

/** ID curto mostrado na lista e no detalhe: `#USR-` + os 6 últimos caracteres do UUID. */
export function shortIdOf(id: string): string {
  return `#USR-${id.slice(-6).toUpperCase()}`;
}
