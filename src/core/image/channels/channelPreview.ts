import { CHANNELS_PER_PIXEL, OPAQUE_ALPHA } from '../constants';
import { downsample } from '../processing/downsample';
import { createRasterImage } from '../rasterImage';
import type { RasterImage } from '../types';
import type { ChannelId } from './channelModel';

const CHANNEL_OFFSETS: Record<ChannelId, number> = {
  gray: 0,
  red: 0,
  green: 1,
  blue: 2,
  alpha: 3,
};

export function extractChannelPreview(source: RasterImage, channel: ChannelId): RasterImage {
  const result = createRasterImage(source.width, source.height);
  const channelOffset = CHANNEL_OFFSETS[channel];

  for (let offset = 0; offset < source.data.length; offset += CHANNELS_PER_PIXEL) {
    const value = source.data[offset + channelOffset];

    result.data[offset] = value;
    result.data[offset + 1] = value;
    result.data[offset + 2] = value;
    result.data[offset + 3] = OPAQUE_ALPHA;
  }

  return result;
}

export type ChannelPreview = {
  id: ChannelId;
  image: RasterImage;
};

export function buildChannelPreviews(
  source: RasterImage,
  channels: ChannelId[],
  maxSide: number
): ChannelPreview[] {
  const thumbnail = downsample(source, maxSide);

  return channels.map((id) => ({ id, image: extractChannelPreview(thumbnail, id) }));
}
