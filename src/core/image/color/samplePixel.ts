import { CHANNELS_PER_PIXEL } from '../constants';
import type { RasterImage } from '../types';
import type { LabColor } from './lab';
import { rgbToLab } from './lab';

export type PixelSample = {
  x: number;
  y: number;
  red: number;
  green: number;
  blue: number;
  alpha: number;
  lab: LabColor;
};

export function samplePixel(image: RasterImage, x: number, y: number): PixelSample | null {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) {
    return null;
  }

  const offset = (y * image.width + x) * CHANNELS_PER_PIXEL;
  const red = image.data[offset];
  const green = image.data[offset + 1];
  const blue = image.data[offset + 2];

  return {
    x,
    y,
    red,
    green,
    blue,
    alpha: image.data[offset + 3],
    lab: rgbToLab(red, green, blue),
  };
}
