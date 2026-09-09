import { toLuma } from '../color/luma';
import { CHANNELS_PER_PIXEL } from '../constants';
import type { RasterImage } from '../types';

export const HISTOGRAM_LEVELS = 256;

export const MAX_LEVEL = HISTOGRAM_LEVELS - 1;

export type HistogramSource = 'luma' | 'red' | 'green' | 'blue' | 'alpha';

export type Histogram = {
  counts: Uint32Array;
  maxCount: number;
  totalPixels: number;
};

const CHANNEL_OFFSETS: Record<Exclude<HistogramSource, 'luma'>, number> = {
  red: 0,
  green: 1,
  blue: 2,
  alpha: 3,
};

export function computeHistogram(image: RasterImage, source: HistogramSource): Histogram {
  const counts = new Uint32Array(HISTOGRAM_LEVELS);

  if (source === 'luma') {
    for (let offset = 0; offset < image.data.length; offset += CHANNELS_PER_PIXEL) {
      const level = Math.round(
        toLuma(image.data[offset], image.data[offset + 1], image.data[offset + 2])
      );

      counts[level] += 1;
    }
  } else {
    const channelOffset = CHANNEL_OFFSETS[source];

    for (let offset = 0; offset < image.data.length; offset += CHANNELS_PER_PIXEL) {
      counts[image.data[offset + channelOffset]] += 1;
    }
  }

  let maxCount = 0;

  for (let level = 0; level < HISTOGRAM_LEVELS; level += 1) {
    if (counts[level] > maxCount) {
      maxCount = counts[level];
    }
  }

  return {
    counts,
    maxCount,
    totalPixels: image.data.length / CHANNELS_PER_PIXEL,
  };
}
