import type { RasterImage } from '../types';

export type InterpolationMethod = 'nearest' | 'bilinear';

export type SampleGeometry = {
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
};

export type RowSampler = (
  source: RasterImage,
  target: RasterImage,
  y: number,
  geometry: SampleGeometry
) => void;

export type InterpolationDescriptor = {
  id: InterpolationMethod;
  label: string;
  summary: string;
  sampleRow: RowSampler;
};

export function toSourceCoordinate(target: number, offset: number, scale: number): number {
  return (target + offset + 0.5) / scale - 0.5;
}
