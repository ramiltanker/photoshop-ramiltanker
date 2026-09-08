import type { JpegMetadata } from './formats/jpeg/metadata';
import type { PngMetadata } from './formats/png/metadata';
import type { ColorModel } from './types';

const GRAYSCALE_PNG_COLOR_TYPES = [0, 4];
const PNG_COLOR_TYPES_WITH_ALPHA = [4, 6];
const GRAYSCALE_JPEG_COMPONENTS = 1;

export type ColorLayout = {
  colorModel: ColorModel;
  hasAlpha: boolean;
};

export function describePngLayout(
  metadata: PngMetadata | null,
  detectedAlpha: boolean
): ColorLayout {
  if (!metadata) {
    return { colorModel: 'rgb', hasAlpha: detectedAlpha };
  }

  return {
    colorModel: GRAYSCALE_PNG_COLOR_TYPES.includes(metadata.colorType) ? 'grayscale' : 'rgb',
    hasAlpha: PNG_COLOR_TYPES_WITH_ALPHA.includes(metadata.colorType) || detectedAlpha,
  };
}

export function describeJpegLayout(metadata: JpegMetadata | null): ColorLayout {
  return {
    colorModel: metadata?.components === GRAYSCALE_JPEG_COMPONENTS ? 'grayscale' : 'rgb',
    hasAlpha: false,
  };
}

export function describeGb7Layout(hasMask: boolean): ColorLayout {
  return { colorModel: 'grayscale', hasAlpha: hasMask };
}
