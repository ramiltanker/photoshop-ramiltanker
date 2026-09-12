import { CHANNELS_PER_PIXEL } from '../constants';
import type { InterpolationDescriptor } from './types';
import { toSourceCoordinate } from './types';

const ALPHA_OFFSET = 3;

export const bilinear: InterpolationDescriptor = {
  id: 'bilinear',
  label: 'Билинейная',
  summary:
    'Смешивает четыре соседних пикселя пропорционально расстоянию до них. Даёт плавные переходы без ступенек на диагоналях и градиентах, поэтому подходит для фотографий. Требует больше вычислений и слегка размывает мелкие детали и резкие границы.',
  sampleRow: (source, target, y, geometry) => {
    const sourceY = toSourceCoordinate(y, geometry.offsetY, geometry.scaleY);
    const topRow = Math.min(source.height - 1, Math.max(0, Math.floor(sourceY)));
    const bottomRow = Math.min(source.height - 1, topRow + 1);
    const weightY = Math.min(1, Math.max(0, sourceY - topRow));
    const topStart = topRow * source.width * CHANNELS_PER_PIXEL;
    const bottomStart = bottomRow * source.width * CHANNELS_PER_PIXEL;
    let offset = y * target.width * CHANNELS_PER_PIXEL;

    for (let x = 0; x < target.width; x += 1) {
      const sourceX = toSourceCoordinate(x, geometry.offsetX, geometry.scaleX);
      const leftColumn = Math.min(source.width - 1, Math.max(0, Math.floor(sourceX)));
      const rightColumn = Math.min(source.width - 1, leftColumn + 1);
      const weightX = Math.min(1, Math.max(0, sourceX - leftColumn));

      const leftOffset = leftColumn * CHANNELS_PER_PIXEL;
      const rightOffset = rightColumn * CHANNELS_PER_PIXEL;
      const topLeft = topStart + leftOffset;
      const topRight = topStart + rightOffset;
      const bottomLeft = bottomStart + leftOffset;
      const bottomRight = bottomStart + rightOffset;

      const alphaTopLeft = source.data[topLeft + ALPHA_OFFSET];
      const alphaTopRight = source.data[topRight + ALPHA_OFFSET];
      const alphaBottomLeft = source.data[bottomLeft + ALPHA_OFFSET];
      const alphaBottomRight = source.data[bottomRight + ALPHA_OFFSET];

      const weightTopLeft = (1 - weightX) * (1 - weightY);
      const weightTopRight = weightX * (1 - weightY);
      const weightBottomLeft = (1 - weightX) * weightY;
      const weightBottomRight = weightX * weightY;

      const alpha =
        alphaTopLeft * weightTopLeft +
        alphaTopRight * weightTopRight +
        alphaBottomLeft * weightBottomLeft +
        alphaBottomRight * weightBottomRight;

      for (let channel = 0; channel < ALPHA_OFFSET; channel += 1) {
        const premultiplied =
          source.data[topLeft + channel] * alphaTopLeft * weightTopLeft +
          source.data[topRight + channel] * alphaTopRight * weightTopRight +
          source.data[bottomLeft + channel] * alphaBottomLeft * weightBottomLeft +
          source.data[bottomRight + channel] * alphaBottomRight * weightBottomRight;

        target.data[offset + channel] = alpha > 0 ? premultiplied / alpha : 0;
      }

      target.data[offset + ALPHA_OFFSET] = alpha;
      offset += CHANNELS_PER_PIXEL;
    }
  },
};
