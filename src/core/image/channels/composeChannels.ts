import { CHANNELS_PER_PIXEL, OPAQUE_ALPHA, TRANSPARENT_ALPHA } from '../constants';
import { forEachRow } from '../processing/rowScheduler';
import { createRasterImage } from '../rasterImage';
import type { ProgressHandler, RasterImage } from '../types';
import type { ChannelDescriptor, ChannelSelection } from './channelModel';
import { countEnabledColorChannels } from './channelModel';

const RED_OFFSET = 0;
const GREEN_OFFSET = 1;
const BLUE_OFFSET = 2;
const ALPHA_OFFSET = 3;

export async function composeChannels(
  source: RasterImage,
  channels: ChannelDescriptor[],
  selection: ChannelSelection,
  onProgress?: ProgressHandler
): Promise<RasterImage> {
  const result = createRasterImage(source.width, source.height);
  const hasAlphaChannel = channels.some((channel) => channel.id === 'alpha');
  const alphaEnabled = hasAlphaChannel && selection.alpha;
  const enabledColorCount = countEnabledColorChannels(channels, selection);
  const grayscale = channels.some((channel) => channel.id === 'gray');

  await forEachRow(
    source.height,
    (y) => {
      let offset = y * source.width * CHANNELS_PER_PIXEL;

      for (let x = 0; x < source.width; x += 1) {
        const alpha = source.data[offset + ALPHA_OFFSET];

        if (enabledColorCount === 0) {
          const value = alphaEnabled ? alpha : 0;

          result.data[offset + RED_OFFSET] = value;
          result.data[offset + GREEN_OFFSET] = value;
          result.data[offset + BLUE_OFFSET] = value;
          result.data[offset + ALPHA_OFFSET] = alphaEnabled ? OPAQUE_ALPHA : TRANSPARENT_ALPHA;
          offset += CHANNELS_PER_PIXEL;
          continue;
        }

        if (grayscale) {
          const value = source.data[offset + RED_OFFSET];

          result.data[offset + RED_OFFSET] = value;
          result.data[offset + GREEN_OFFSET] = value;
          result.data[offset + BLUE_OFFSET] = value;
        } else {
          result.data[offset + RED_OFFSET] = selection.red ? source.data[offset + RED_OFFSET] : 0;
          result.data[offset + GREEN_OFFSET] = selection.green
            ? source.data[offset + GREEN_OFFSET]
            : 0;
          result.data[offset + BLUE_OFFSET] = selection.blue
            ? source.data[offset + BLUE_OFFSET]
            : 0;
        }

        result.data[offset + ALPHA_OFFSET] = alphaEnabled ? alpha : OPAQUE_ALPHA;
        offset += CHANNELS_PER_PIXEL;
      }
    },
    onProgress
  );

  return result;
}
