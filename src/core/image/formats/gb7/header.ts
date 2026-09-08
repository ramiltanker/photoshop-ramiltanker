import {
  GB7_HEADER_SIZE,
  GB7_MASK_FLAG,
  GB7_OFFSET_FLAG,
  GB7_OFFSET_HEIGHT,
  GB7_OFFSET_RESERVED,
  GB7_OFFSET_VERSION,
  GB7_OFFSET_WIDTH,
  GB7_SIGNATURE,
  GB7_SUPPORTED_VERSION,
} from './constants';
import { Gb7FormatError } from './errors';

export type Gb7Header = {
  version: number;
  hasMask: boolean;
  width: number;
  height: number;
};

export function isGb7Signature(bytes: Uint8Array): boolean {
  if (bytes.length < GB7_SIGNATURE.length) {
    return false;
  }

  return GB7_SIGNATURE.every((byte, index) => bytes[index] === byte);
}

export function readGb7Header(bytes: Uint8Array): Gb7Header {
  if (bytes.length < GB7_HEADER_SIZE) {
    throw new Gb7FormatError('Файл слишком мал: заголовок GB7 занимает 12 байт');
  }

  if (!isGb7Signature(bytes)) {
    throw new Gb7FormatError('Неверная сигнатура файла: ожидается GB7');
  }

  const version = bytes[GB7_OFFSET_VERSION];

  if (version !== GB7_SUPPORTED_VERSION) {
    throw new Gb7FormatError(`Версия ${version} не поддерживается`);
  }

  const width = (bytes[GB7_OFFSET_WIDTH] << 8) | bytes[GB7_OFFSET_WIDTH + 1];
  const height = (bytes[GB7_OFFSET_HEIGHT] << 8) | bytes[GB7_OFFSET_HEIGHT + 1];

  if (width === 0 || height === 0) {
    throw new Gb7FormatError('Ширина и высота изображения должны быть больше нуля');
  }

  const expectedSize = GB7_HEADER_SIZE + width * height;

  if (bytes.length < expectedSize) {
    throw new Gb7FormatError(
      `Данных изображения меньше заявленного: ожидается ${expectedSize} байт, получено ${bytes.length}`
    );
  }

  return {
    version,
    hasMask: (bytes[GB7_OFFSET_FLAG] & GB7_MASK_FLAG) === GB7_MASK_FLAG,
    width,
    height,
  };
}

export function writeGb7Header(target: Uint8Array, header: Gb7Header): void {
  GB7_SIGNATURE.forEach((byte, index) => {
    target[index] = byte;
  });

  target[GB7_OFFSET_VERSION] = header.version;
  target[GB7_OFFSET_FLAG] = header.hasMask ? GB7_MASK_FLAG : 0;
  target[GB7_OFFSET_WIDTH] = (header.width >> 8) & 0xff;
  target[GB7_OFFSET_WIDTH + 1] = header.width & 0xff;
  target[GB7_OFFSET_HEIGHT] = (header.height >> 8) & 0xff;
  target[GB7_OFFSET_HEIGHT + 1] = header.height & 0xff;
  target[GB7_OFFSET_RESERVED] = 0;
  target[GB7_OFFSET_RESERVED + 1] = 0;
}
