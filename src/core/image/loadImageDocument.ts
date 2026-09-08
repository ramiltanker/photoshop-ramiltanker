import { describeGb7Depth, describeJpegDepth, describePngDepth } from './colorDepth';
import { decodeWithBrowser } from './formats/browserCodec';
import { detectFormat } from './formats/detectFormat';
import { decodeGb7 } from './formats/gb7/decode';
import { readJpegMetadata } from './formats/jpeg/metadata';
import { readPngMetadata } from './formats/png/metadata';
import { hasTransparentPixels } from './rasterImage';
import type { ImageDocument, ProgressHandler } from './types';

export async function loadImageDocument(
  file: File,
  onProgress?: ProgressHandler
): Promise<ImageDocument> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const format = detectFormat(bytes);

  if (!format) {
    throw new Error('Неподдерживаемый формат файла. Доступны PNG, JPEG и GB7');
  }

  if (format === 'gb7') {
    const { image, hasMask } = await decodeGb7(buffer, onProgress);

    return {
      image,
      metadata: {
        format,
        fileName: file.name,
        fileSize: file.size,
        width: image.width,
        height: image.height,
        colorDepth: describeGb7Depth(hasMask),
        hasAlpha: hasMask,
      },
    };
  }

  const image = await decodeWithBrowser(file);
  const colorDepth =
    format === 'png'
      ? describePngDepth(readPngMetadata(bytes))
      : describeJpegDepth(readJpegMetadata(bytes));

  onProgress?.(1);

  return {
    image,
    metadata: {
      format,
      fileName: file.name,
      fileSize: file.size,
      width: image.width,
      height: image.height,
      colorDepth,
      hasAlpha: hasTransparentPixels(image),
    },
  };
}
