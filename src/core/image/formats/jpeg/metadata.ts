const JPEG_SIGNATURE = [0xff, 0xd8, 0xff] as const;
const MARKER_PREFIX = 0xff;
const FRAME_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);
const STANDALONE_MARKERS = new Set([0x01, 0xd0, 0xd1, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8]);
const END_OF_IMAGE_MARKER = 0xd9;
const FRAME_HEADER_SIZE = 10;

const COMPONENT_NAMES: Record<number, string | undefined> = {
  1: 'оттенки серого',
  3: 'YCbCr',
  4: 'CMYK',
};

export type JpegMetadata = {
  precision: number;
  components: number;
  colorSpaceName: string;
};

export function isJpegSignature(bytes: Uint8Array): boolean {
  if (bytes.length < JPEG_SIGNATURE.length) {
    return false;
  }

  return JPEG_SIGNATURE.every((byte, index) => bytes[index] === byte);
}

export function readJpegMetadata(bytes: Uint8Array): JpegMetadata | null {
  if (!isJpegSignature(bytes)) {
    return null;
  }

  let offset = 2;

  while (offset + 1 < bytes.length) {
    if (bytes[offset] !== MARKER_PREFIX) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];

    if (marker === MARKER_PREFIX || STANDALONE_MARKERS.has(marker)) {
      offset += marker === MARKER_PREFIX ? 1 : 2;
      continue;
    }

    if (marker === END_OF_IMAGE_MARKER) {
      return null;
    }

    if (FRAME_MARKERS.has(marker)) {
      if (offset + FRAME_HEADER_SIZE >= bytes.length) {
        return null;
      }

      const components = bytes[offset + 9];

      return {
        precision: bytes[offset + 4],
        components,
        colorSpaceName: COMPONENT_NAMES[components] ?? 'неизвестное цветовое пространство',
      };
    }

    if (offset + 3 >= bytes.length) {
      return null;
    }

    const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];

    if (segmentLength < 2) {
      return null;
    }

    offset += 2 + segmentLength;
  }

  return null;
}
