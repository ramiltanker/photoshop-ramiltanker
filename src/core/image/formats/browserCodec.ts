import { fromImageData, toImageData } from '../rasterImage';
import type { RasterImage } from '../types';

const MIME_TYPES: Record<'png' | 'jpeg', string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
};

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  return canvas;
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    throw new Error('Браузер не предоставил контекст 2d для canvas');
  }

  return context;
}

export async function decodeWithBrowser(blob: Blob): Promise<RasterImage> {
  const bitmap = await createImageBitmap(blob);

  try {
    const canvas = createCanvas(bitmap.width, bitmap.height);
    const context = getContext(canvas);
    context.drawImage(bitmap, 0, 0);

    return fromImageData(context.getImageData(0, 0, bitmap.width, bitmap.height));
  } finally {
    bitmap.close();
  }
}

export function encodeWithBrowser(
  image: RasterImage,
  format: 'png' | 'jpeg',
  quality: number
): Promise<Blob> {
  const canvas = createCanvas(image.width, image.height);
  const context = getContext(canvas);
  context.putImageData(toImageData(image), 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error('Не удалось закодировать изображение средствами браузера'));
      },
      MIME_TYPES[format],
      quality
    );
  });
}
