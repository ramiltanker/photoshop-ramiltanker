import { CHANNELS_PER_PIXEL } from '../constants';
import { forEachRow } from '../processing/rowScheduler';
import { createRasterImage } from '../rasterImage';
import type { ProgressHandler, RasterImage } from '../types';
import { buildChannelLuts } from './buildLut';
import type { LevelsState } from './levelsSettings';

export async function applyLevels(
  source: RasterImage,
  state: LevelsState,
  onProgress?: ProgressHandler
): Promise<RasterImage> {
  const luts = buildChannelLuts(state);
  const result = createRasterImage(source.width, source.height);

  await forEachRow(
    source.height,
    (y) => {
      let offset = y * source.width * CHANNELS_PER_PIXEL;

      for (let x = 0; x < source.width; x += 1) {
        result.data[offset] = luts.red[source.data[offset]];
        result.data[offset + 1] = luts.green[source.data[offset + 1]];
        result.data[offset + 2] = luts.blue[source.data[offset + 2]];
        result.data[offset + 3] = luts.alpha[source.data[offset + 3]];
        offset += CHANNELS_PER_PIXEL;
      }
    },
    onProgress
  );

  return result;
}
