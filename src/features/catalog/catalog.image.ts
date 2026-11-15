import { formatFileSize } from './catalog.format';

export interface ImageSize {
  width: number;
  height: number;
}

/** Tamanho mínimo das imagens de carta, como no frame 278-3246 ("Mín. 1200×1600 px"). */
export const CARD_IMAGE_MIN_SIZE: ImageSize = { width: 1200, height: 1600 };

export function formatImageSize({ width, height }: ImageSize): string {
  return `${width}×${height} px`;
}

export function meetsMinSize(size: ImageSize, min: ImageSize): boolean {
  return size.width >= min.width && size.height >= min.height;
}

/** "18,4 MB • 2400 × 3360 px", como abaixo da prévia no Figma. */
export function imageMetaOf(file: File, { width, height }: ImageSize): string {
  return `${formatFileSize(file.size)} • ${width} × ${height} px`;
}

/** "0,9 MB • 800 × 1000 px (mínimo 1200×1600 px)", em vermelho no frame 832-7170. */
export function belowMinMetaOf(file: File, size: ImageSize, min: ImageSize): string {
  return `${imageMetaOf(file, size)} (mínimo ${formatImageSize(min)})`;
}

/** Endereço local para mostrar a imagem recusada sem enviá-la. */
export function localPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function releasePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/** Nome do arquivo a partir da URL salva, para a imagem que já estava no item. */
export function fileNameOfUrl(url: string): string {
  const path = url.replace(/[?#].*$/, '');
  return decodeURIComponent(path.slice(path.lastIndexOf('/') + 1));
}

/** Lê largura e altura da imagem no navegador, antes de enviar. */
export function readImageSize(file: File): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem.'));
    };
    image.src = url;
  });
}
