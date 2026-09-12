import { bilinear } from './bilinear';
import { nearestNeighbour } from './nearestNeighbour';
import type { InterpolationDescriptor, InterpolationMethod } from './types';

export const INTERPOLATION_METHODS: InterpolationDescriptor[] = [bilinear, nearestNeighbour];

export const DEFAULT_INTERPOLATION: InterpolationMethod = 'bilinear';

export function getInterpolation(method: InterpolationMethod): InterpolationDescriptor {
  const descriptor = INTERPOLATION_METHODS.find((item) => item.id === method);

  if (!descriptor) {
    throw new Error(`Неизвестный метод интерполяции: ${method}`);
  }

  return descriptor;
}
