import { forEachRow } from '../processing/rowScheduler';
import { createRasterImage } from '../rasterImage';
import type { ProgressHandler, RasterImage } from '../types';
import { getInterpolation } from './registry';
import type { InterpolationMethod, SampleGeometry } from './types';

export type ResampleRequest = {
  width: number;
  height: number;
  geometry: SampleGeometry;
  method: InterpolationMethod;
};

export function resample(source: RasterImage, request: ResampleRequest): RasterImage {
  const target = createRasterImage(request.width, request.height);
  const { sampleRow } = getInterpolation(request.method);

  for (let y = 0; y < request.height; y += 1) {
    sampleRow(source, target, y, request.geometry);
  }

  return target;
}

export async function resampleAsync(
  source: RasterImage,
  request: ResampleRequest,
  onProgress?: ProgressHandler
): Promise<RasterImage> {
  const target = createRasterImage(request.width, request.height);
  const { sampleRow } = getInterpolation(request.method);

  await forEachRow(
    request.height,
    (y) => {
      sampleRow(source, target, y, request.geometry);
    },
    onProgress
  );

  return target;
}

export function resizeImage(
  source: RasterImage,
  width: number,
  height: number,
  method: InterpolationMethod,
  onProgress?: ProgressHandler
): Promise<RasterImage> {
  return resampleAsync(
    source,
    {
      width,
      height,
      method,
      geometry: {
        scaleX: width / source.width,
        scaleY: height / source.height,
        offsetX: 0,
        offsetY: 0,
      },
    },
    onProgress
  );
}
