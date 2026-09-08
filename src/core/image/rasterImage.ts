import { CHANNELS_PER_PIXEL } from './constants';
import type { RasterImage } from './types';

export function createRasterImage(width: number, height: number): RasterImage {
  return {
    width,
    height,
    data: new Uint8ClampedArray(width * height * CHANNELS_PER_PIXEL),
  };
}

export function getPixelOffset(image: RasterImage, x: number, y: number): number {
  return (y * image.width + x) * CHANNELS_PER_PIXEL;
}

export function toImageData(image: RasterImage): ImageData {
  return new ImageData(image.data, image.width, image.height);
}

export function fromImageData(source: ImageData): RasterImage {
  return {
    width: source.width,
    height: source.height,
    data: new Uint8ClampedArray(source.data),
  };
}

export function hasTransparentPixels(image: RasterImage): boolean {
  for (let offset = 3; offset < image.data.length; offset += CHANNELS_PER_PIXEL) {
    if (image.data[offset] < 255) {
      return true;
    }
  }

  return false;
}
