const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;
const IHDR_BIT_DEPTH_OFFSET = 24;
const IHDR_COLOR_TYPE_OFFSET = 25;
const MINIMAL_PNG_SIZE = 26;

const CHANNELS_BY_COLOR_TYPE: Record<number, number | undefined> = {
  0: 1,
  2: 3,
  3: 1,
  4: 2,
  6: 4,
};

const COLOR_TYPE_NAMES: Record<number, string | undefined> = {
  0: 'оттенки серого',
  2: 'RGB',
  3: 'палитра',
  4: 'оттенки серого с альфой',
  6: 'RGBA',
};

export type PngMetadata = {
  bitDepth: number;
  colorType: number;
  channels: number;
  colorTypeName: string;
};

export function isPngSignature(bytes: Uint8Array): boolean {
  if (bytes.length < PNG_SIGNATURE.length) {
    return false;
  }

  return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);
}

export function readPngMetadata(bytes: Uint8Array): PngMetadata | null {
  if (bytes.length < MINIMAL_PNG_SIZE || !isPngSignature(bytes)) {
    return null;
  }

  const bitDepth = bytes[IHDR_BIT_DEPTH_OFFSET];
  const colorType = bytes[IHDR_COLOR_TYPE_OFFSET];
  const channels = CHANNELS_BY_COLOR_TYPE[colorType];

  if (channels === undefined) {
    return null;
  }

  return {
    bitDepth,
    colorType,
    channels,
    colorTypeName: COLOR_TYPE_NAMES[colorType] ?? 'неизвестный тип',
  };
}
