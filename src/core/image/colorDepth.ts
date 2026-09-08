import type { JpegMetadata } from './formats/jpeg/metadata';
import type { PngMetadata } from './formats/png/metadata';
import type { ColorDepth } from './types';

const FALLBACK_DEPTH: ColorDepth = {
  bitsPerPixel: 32,
  description: '8 бит × 4 канала (RGBA)',
};

const GB7_GRAY_BITS = 7;
const GB7_MASK_BITS = 1;

export function describePngDepth(metadata: PngMetadata | null): ColorDepth {
  if (!metadata) {
    return FALLBACK_DEPTH;
  }

  return {
    bitsPerPixel: metadata.bitDepth * metadata.channels,
    description: `${metadata.bitDepth} бит × ${metadata.channels} кан. (${metadata.colorTypeName})`,
  };
}

export function describeJpegDepth(metadata: JpegMetadata | null): ColorDepth {
  if (!metadata) {
    return FALLBACK_DEPTH;
  }

  return {
    bitsPerPixel: metadata.precision * metadata.components,
    description: `${metadata.precision} бит × ${metadata.components} кан. (${metadata.colorSpaceName})`,
  };
}

export function describeGb7Depth(hasMask: boolean): ColorDepth {
  if (hasMask) {
    return {
      bitsPerPixel: GB7_GRAY_BITS + GB7_MASK_BITS,
      description: '7 бит (оттенки серого) + 1 бит маски',
    };
  }

  return {
    bitsPerPixel: GB7_GRAY_BITS,
    description: '7 бит (оттенки серого)',
  };
}
