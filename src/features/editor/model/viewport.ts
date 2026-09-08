import type { RasterImage } from '@/core/image/types';
import type { ElementSize } from '@/shared/hooks/useElementSize';

const VIEWPORT_PADDING = 32;
const MAX_SCALE = 1;

export function computeFitScale(image: RasterImage, viewport: ElementSize): number {
  const availableWidth = viewport.width - VIEWPORT_PADDING;
  const availableHeight = viewport.height - VIEWPORT_PADDING;

  if (availableWidth <= 0 || availableHeight <= 0) {
    return MAX_SCALE;
  }

  return Math.min(MAX_SCALE, availableWidth / image.width, availableHeight / image.height);
}

export function formatScale(scale: number): string {
  return `${Math.round(scale * 100)} %`;
}
