import { CHANNELS_PER_PIXEL } from '../constants';
import type { InterpolationDescriptor } from './types';
import { toSourceCoordinate } from './types';

export const nearestNeighbour: InterpolationDescriptor = {
  id: 'nearest',
  label: 'Ближайший сосед',
  summary:
    'Берёт значение ближайшего исходного пикселя. Самый быстрый метод, не создаёт новых цветов и сохраняет резкие границы, поэтому подходит для пиксель-арта, схем и увеличения без размытия. При уменьшении и повороте даёт заметные ступеньки.',
  sampleRow: (source, target, y, geometry) => {
    const sourceY = Math.min(
      source.height - 1,
      Math.max(0, Math.round(toSourceCoordinate(y, geometry.offsetY, geometry.scaleY)))
    );
    const rowStart = sourceY * source.width * CHANNELS_PER_PIXEL;
    let offset = y * target.width * CHANNELS_PER_PIXEL;

    for (let x = 0; x < target.width; x += 1) {
      const sourceX = Math.min(
        source.width - 1,
        Math.max(0, Math.round(toSourceCoordinate(x, geometry.offsetX, geometry.scaleX)))
      );
      const sourceOffset = rowStart + sourceX * CHANNELS_PER_PIXEL;

      target.data[offset] = source.data[sourceOffset];
      target.data[offset + 1] = source.data[sourceOffset + 1];
      target.data[offset + 2] = source.data[sourceOffset + 2];
      target.data[offset + 3] = source.data[sourceOffset + 3];
      offset += CHANNELS_PER_PIXEL;
    }
  },
};
