import { toLuma } from '../../color/luma';
import { CHANNELS_PER_PIXEL } from '../../constants';
import { forEachRow } from '../../processing/rowScheduler';
import type { ProgressHandler, RasterImage } from '../../types';
import {
  GB7_HEADER_SIZE,
  GB7_MASK_BIT,
  GB7_MAX_DIMENSION,
  GB7_MAX_GRAY,
  GB7_SUPPORTED_VERSION,
} from './constants';
import { Gb7FormatError } from './errors';
import { writeGb7Header } from './header';

const ALPHA_VISIBILITY_THRESHOLD = 128;

export type Gb7EncodeOptions = {
  withMask: boolean;
};

function toGrayValue(red: number, green: number, blue: number): number {
  return Math.round((toLuma(red, green, blue) * GB7_MAX_GRAY) / 255);
}

export async function encodeGb7(
  image: RasterImage,
  options: Gb7EncodeOptions,
  onProgress?: ProgressHandler
): Promise<Uint8Array> {
  if (image.width > GB7_MAX_DIMENSION || image.height > GB7_MAX_DIMENSION) {
    throw new Gb7FormatError(
      `GB7 хранит размеры в двух байтах: сторона не может превышать ${GB7_MAX_DIMENSION} пикселей`
    );
  }

  const output = new Uint8Array(GB7_HEADER_SIZE + image.width * image.height);

  writeGb7Header(output, {
    version: GB7_SUPPORTED_VERSION,
    hasMask: options.withMask,
    width: image.width,
    height: image.height,
  });

  await forEachRow(
    image.height,
    (y) => {
      let source = y * image.width * CHANNELS_PER_PIXEL;
      const rowStart = GB7_HEADER_SIZE + y * image.width;

      for (let x = 0; x < image.width; x += 1) {
        const gray = toGrayValue(
          image.data[source],
          image.data[source + 1],
          image.data[source + 2]
        );
        const visible = image.data[source + 3] >= ALPHA_VISIBILITY_THRESHOLD;

        output[rowStart + x] = options.withMask && visible ? gray | GB7_MASK_BIT : gray;
        source += CHANNELS_PER_PIXEL;
      }
    },
    onProgress
  );

  return output;
}
