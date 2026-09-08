import { CHANNELS_PER_PIXEL, OPAQUE_ALPHA, TRANSPARENT_ALPHA } from '../../constants';
import { forEachRow } from '../../processing/rowScheduler';
import { createRasterImage } from '../../rasterImage';
import type { ProgressHandler, RasterImage } from '../../types';
import { GB7_GRAY_MASK, GB7_HEADER_SIZE, GB7_MASK_BIT, GB7_MAX_GRAY } from './constants';
import { readGb7Header } from './header';

export type Gb7DecodeResult = {
  image: RasterImage;
  hasMask: boolean;
  version: number;
};

function expandGrayValue(value: number): number {
  return Math.round((value * 255) / GB7_MAX_GRAY);
}

export async function decodeGb7(
  buffer: ArrayBuffer,
  onProgress?: ProgressHandler
): Promise<Gb7DecodeResult> {
  const bytes = new Uint8Array(buffer);
  const header = readGb7Header(bytes);
  const image = createRasterImage(header.width, header.height);

  await forEachRow(
    header.height,
    (y) => {
      const rowStart = GB7_HEADER_SIZE + y * header.width;
      let target = y * header.width * CHANNELS_PER_PIXEL;

      for (let x = 0; x < header.width; x += 1) {
        const byte = bytes[rowStart + x];
        const gray = expandGrayValue(byte & GB7_GRAY_MASK);
        const visible = !header.hasMask || (byte & GB7_MASK_BIT) === GB7_MASK_BIT;

        image.data[target] = gray;
        image.data[target + 1] = gray;
        image.data[target + 2] = gray;
        image.data[target + 3] = visible ? OPAQUE_ALPHA : TRANSPARENT_ALPHA;
        target += CHANNELS_PER_PIXEL;
      }
    },
    onProgress
  );

  return { image, hasMask: header.hasMask, version: header.version };
}
