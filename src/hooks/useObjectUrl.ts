import { useEffect, useMemo } from 'react';

/** Endereço local de um arquivo baixado (ex.: imagem privada), liberado quando o arquivo muda ou a tela sai. */
export function useObjectUrl(blob: Blob | undefined): string | undefined {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : undefined), [blob]);

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  return url;
}
