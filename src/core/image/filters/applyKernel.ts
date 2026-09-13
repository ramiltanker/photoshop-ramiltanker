import type { ChannelId } from '../channels/channelModel';
import { CHANNELS_PER_PIXEL } from '../constants';
import { forEachRow } from '../processing/rowScheduler';
import type { ProgressHandler, RasterImage } from '../types';
import type { Kernel } from './kernel';
import { KERNEL_RADIUS, KERNEL_SIZE } from './kernel';
import type { EdgeMode } from './padding';
import { padImage } from './padding';

const CHANNEL_OFFSETS: Record<ChannelId, number[]> = {
  gray: [0, 1, 2],
  red: [0],
  green: [1],
  blue: [2],
  alpha: [3],
};

export type FilterRequest = {
  kernel: Kernel;
  channels: ChannelId[];
  edgeMode: EdgeMode;
};

function collectOffsets(channels: ChannelId[]): number[] {
  return [...new Set(channels.flatMap((channel) => CHANNEL_OFFSETS[channel]))];
}

function buildNeighbourOffsets(paddedWidth: number): Int32Array {
  const offsets = new Int32Array(KERNEL_SIZE * KERNEL_SIZE);
  let cell = 0;

  for (let dy = -KERNEL_RADIUS; dy <= KERNEL_RADIUS; dy += 1) {
    for (let dx = -KERNEL_RADIUS; dx <= KERNEL_RADIUS; dx += 1) {
      offsets[cell] = (dy * paddedWidth + dx) * CHANNELS_PER_PIXEL;
      cell += 1;
    }
  }

  return offsets;
}

export async function applyKernel(
  source: RasterImage,
  request: FilterRequest,
  onProgress?: ProgressHandler,
  signal?: AbortSignal
): Promise<RasterImage | null> {
  const padded = padImage(source, KERNEL_RADIUS, request.edgeMode);
  const result: RasterImage = {
    width: source.width,
    height: source.height,
    data: new Uint8ClampedArray(source.data),
  };
  const channelOffsets = collectOffsets(request.channels);
  const neighbourOffsets = buildNeighbourOffsets(padded.width);
  const weights = Float64Array.from(request.kernel);
  const cells = weights.length;
  const input = padded.data;
  const output = result.data;

  const completed = await forEachRow(
    source.height,
    (y) => {
      let center = ((y + KERNEL_RADIUS) * padded.width + KERNEL_RADIUS) * CHANNELS_PER_PIXEL;
      let target = y * source.width * CHANNELS_PER_PIXEL;

      for (let x = 0; x < source.width; x += 1) {
        for (let index = 0; index < channelOffsets.length; index += 1) {
          const origin = center + channelOffsets[index];
          let sum = 0;

          for (let cell = 0; cell < cells; cell += 1) {
            sum += weights[cell] * input[origin + neighbourOffsets[cell]];
          }

          output[target + channelOffsets[index]] = sum;
        }

        center += CHANNELS_PER_PIXEL;
        target += CHANNELS_PER_PIXEL;
      }
    },
    onProgress,
    signal
  );

  return completed ? result : null;
}
