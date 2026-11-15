import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  belowMinMetaOf,
  CARD_IMAGE_MIN_SIZE,
  fileNameOfUrl,
  formatImageSize,
  imageMetaOf,
  localPreviewUrl,
  meetsMinSize,
  readImageSize,
  releasePreviewUrl,
} from './catalog.image';

/** Imagem falsa: o jsdom não carrega imagens, então o teste decide se ela carrega ou falha. */
function stubImage(outcome: 'load' | 'error', size = { width: 2400, height: 3360 }) {
  const revokeObjectURL = vi.fn();
  class FakeImage {
    naturalWidth = size.width;
    naturalHeight = size.height;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    set src(_url: string) {
      queueMicrotask(() => (outcome === 'load' ? this.onload?.() : this.onerror?.()));
    }
  }
  vi.stubGlobal('Image', FakeImage);
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:imagem'),
    revokeObjectURL,
  });
  return revokeObjectURL;
}

describe('catalog.image', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('R12: o mínimo das imagens de carta é 1200×1600 px', () => {
    expect(formatImageSize(CARD_IMAGE_MIN_SIZE)).toBe('1200×1600 px');
  });

  it('R12: confere largura e altura contra o mínimo', () => {
    expect(meetsMinSize({ width: 1200, height: 1600 }, CARD_IMAGE_MIN_SIZE)).toBe(true);
    expect(meetsMinSize({ width: 1199, height: 2000 }, CARD_IMAGE_MIN_SIZE)).toBe(false);
    expect(meetsMinSize({ width: 2000, height: 1599 }, CARD_IMAGE_MIN_SIZE)).toBe(false);
  });

  it('R12: descreve o arquivo com o tamanho e as dimensões', () => {
    const file = new File(['x'.repeat(3 * 1024)], 'carta.webp');

    expect(imageMetaOf(file, { width: 2400, height: 3360 })).toBe('3 KB • 2400 × 3360 px');
  });

  it('R12: tira o nome do arquivo da URL salva, sem a query', () => {
    expect(fileNameOfUrl('https://cdn.cromocard.com.br/cards/charizard%20frente.webp?v=2')).toBe(
      'charizard frente.webp',
    );
  });

  it('R12: lê as dimensões da imagem e libera a URL temporária', async () => {
    const revokeObjectURL = stubImage('load');

    await expect(readImageSize(new File(['x'], 'carta.webp'))).resolves.toEqual({
      width: 2400,
      height: 3360,
    });
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:imagem');
  });

  it('R12: avisa quando o arquivo não é uma imagem que o navegador consegue ler', async () => {
    const revokeObjectURL = stubImage('error');

    await expect(readImageSize(new File(['x'], 'carta.webp'))).rejects.toThrow(
      'Não foi possível ler a imagem.',
    );
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:imagem');
  });

  it('R12: abaixo do mínimo, o texto mostra o tamanho exigido entre parênteses', () => {
    const file = new File(['x'.repeat(2048)], 'pequena.png');

    expect(belowMinMetaOf(file, { width: 800, height: 1000 }, CARD_IMAGE_MIN_SIZE)).toBe(
      '2 KB • 800 × 1000 px (mínimo 1200×1600 px)',
    );
  });

  it('R12: cria e libera o endereço local da prévia', () => {
    const revokeObjectURL = stubImage('load');
    const file = new File(['x'], 'carta.png');

    expect(localPreviewUrl(file)).toBe('blob:imagem');
    releasePreviewUrl('blob:imagem');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:imagem');
  });
});
