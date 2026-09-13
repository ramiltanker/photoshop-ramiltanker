import { CHANNELS_PER_PIXEL } from '../constants';
import { createRasterImage } from '../rasterImage';
import type { RasterImage } from '../types';

export type EdgeMode = 'black' | 'white' | 'replicate';

const FILL_VALUES: Record<Exclude<EdgeMode, 'replicate'>, number> = {
  black: 0,
  white: 255,
};

export function padImage(source: RasterImage, radius: number, mode: EdgeMode): RasterImage {
  const padded = createRasterImage(source.width + radius * 2, source.height + radius * 2);

  if (mode !== 'replicate') {
    padded.data.fill(FILL_VALUES[mode]);
  }

  for (let y = 0; y < padded.height; y += 1) {
    const insideY = y >= radius && y < source.height + radius;

    if (mode !== 'replicate' && !insideY) {
      continue;
    }

    const sourceY = Math.min(source.height - 1, Math.max(0, y - radius));

    for (let x = 0; x < padded.width; x += 1) {
      const insideX = x >= radius && x < source.width + radius;

      if (mode !== 'replicate' && !insideX) {
        continue;
      }

      const sourceX = Math.min(source.width - 1, Math.max(0, x - radius));
      const from = (sourceY * source.width + sourceX) * CHANNELS_PER_PIXEL;
      const to = (y * padded.width + x) * CHANNELS_PER_PIXEL;

      padded.data[to] = source.data[from];
      padded.data[to + 1] = source.data[from + 1];
      padded.data[to + 2] = source.data[from + 2];
      padded.data[to + 3] = source.data[from + 3];
    }
  }

  return padded;
}
