import { CHANNELS_PER_PIXEL } from '../constants';
import { createRasterImage } from '../rasterImage';
import type { RasterImage } from '../types';

export function downsample(source: RasterImage, maxSide: number): RasterImage {
  const ratio = Math.min(1, maxSide / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * ratio));
  const height = Math.max(1, Math.round(source.height * ratio));
  const result = createRasterImage(width, height);

  for (let y = 0; y < height; y += 1) {
    const startY = Math.floor((y * source.height) / height);
    const endY = Math.max(startY + 1, Math.floor(((y + 1) * source.height) / height));

    for (let x = 0; x < width; x += 1) {
      const startX = Math.floor((x * source.width) / width);
      const endX = Math.max(startX + 1, Math.floor(((x + 1) * source.width) / width));

      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;
      let count = 0;

      for (let sourceY = startY; sourceY < endY; sourceY += 1) {
        let offset = (sourceY * source.width + startX) * CHANNELS_PER_PIXEL;

        for (let sourceX = startX; sourceX < endX; sourceX += 1) {
          red += source.data[offset];
          green += source.data[offset + 1];
          blue += source.data[offset + 2];
          alpha += source.data[offset + 3];
          count += 1;
          offset += CHANNELS_PER_PIXEL;
        }
      }

      const target = (y * width + x) * CHANNELS_PER_PIXEL;

      result.data[target] = red / count;
      result.data[target + 1] = green / count;
      result.data[target + 2] = blue / count;
      result.data[target + 3] = alpha / count;
    }
  }

  return result;
}
