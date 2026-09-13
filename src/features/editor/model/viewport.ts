import type { RasterImage } from '@/core/image/types';
import type { ElementSize } from '@/shared/hooks/useElementSize';

const VIEWPORT_PADDING = 50;
const PERCENT = 100;

export const MIN_SCALE = 0.12;

export const MAX_SCALE = 3;

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export function computeFitScale(image: RasterImage, viewport: ElementSize): number {
  const availableWidth = viewport.width - VIEWPORT_PADDING * 2;
  const availableHeight = viewport.height - VIEWPORT_PADDING * 2;

  if (availableWidth <= 0 || availableHeight <= 0) {
    return MIN_SCALE;
  }

  return clampScale(Math.min(availableWidth / image.width, availableHeight / image.height));
}

export function formatScale(scale: number): string {
  return `${Math.round(scale * PERCENT)} %`;
}

export function toScalePercent(scale: number): number {
  return Math.round(scale * PERCENT);
}

export function fromScalePercent(percent: number): number {
  return clampScale(percent / PERCENT);
}
