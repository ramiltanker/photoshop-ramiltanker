import { encodeWithBrowser } from './formats/browserCodec';
import { encodeGb7 } from './formats/gb7/encode';
import type { ImageFormat, ProgressHandler, RasterImage } from './types';

const FILE_EXTENSIONS: Record<ImageFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  gb7: 'gb7',
};

const GB7_MIME_TYPE = 'application/octet-stream';

export type SaveOptions = {
  format: ImageFormat;
  quality: number;
  withMask: boolean;
};

export async function createImageBlob(
  image: RasterImage,
  options: SaveOptions,
  onProgress?: ProgressHandler
): Promise<Blob> {
  if (options.format === 'gb7') {
    const bytes = await encodeGb7(image, { withMask: options.withMask }, onProgress);

    return new Blob([bytes], { type: GB7_MIME_TYPE });
  }

  const blob = await encodeWithBrowser(image, options.format, options.quality);
  onProgress?.(1);

  return blob;
}

export function buildFileName(sourceName: string, format: ImageFormat): string {
  const dotIndex = sourceName.lastIndexOf('.');
  const baseName = dotIndex > 0 ? sourceName.slice(0, dotIndex) : sourceName;

  return `${baseName || 'image'}.${FILE_EXTENSIONS[format]}`;
}
