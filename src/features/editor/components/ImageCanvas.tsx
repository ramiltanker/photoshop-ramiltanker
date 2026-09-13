import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, UIEvent } from 'react';

import Box from '@mui/material/Box';

import type { InterpolationMethod } from '@/core/image/interpolation/types';
import { resample } from '@/core/image/interpolation/resample';
import { toImageData } from '@/core/image/rasterImage';
import type { RasterImage } from '@/core/image/types';
import { useElementSize } from '@/shared/hooks/useElementSize';

const MAX_PIXEL_RATIO = 2;

type ScrollPosition = {
  left: number;
  top: number;
};

type ImageCanvasProps = {
  image: RasterImage;
  scale: number;
  method: InterpolationMethod;
  picking: boolean;
  onPick: (x: number, y: number) => void;
};

export function ImageCanvas({ image, scale, method, picking, onPick }: ImageCanvasProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewport = useElementSize(scrollRef);
  const [scroll, setScroll] = useState<ScrollPosition>({ left: 0, top: 0 });

  const scaledWidth = Math.max(1, Math.round(image.width * scale));
  const scaledHeight = Math.max(1, Math.round(image.height * scale));
  const measured = viewport.width > 0 && viewport.height > 0;
  const viewWidth = measured ? Math.min(scaledWidth, Math.ceil(viewport.width)) : 1;
  const viewHeight = measured ? Math.min(scaledHeight, Math.ceil(viewport.height)) : 1;

  useEffect(() => {
    setScroll({ left: 0, top: 0 });
  }, [image, scale]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context || !measured) {
      return;
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const deviceWidth = Math.max(1, Math.round(viewWidth * pixelRatio));
    const deviceHeight = Math.max(1, Math.round(viewHeight * pixelRatio));

    canvas.width = deviceWidth;
    canvas.height = deviceHeight;
    canvas.style.width = `${viewWidth}px`;
    canvas.style.height = `${viewHeight}px`;

    const region = resample(image, {
      width: deviceWidth,
      height: deviceHeight,
      method,
      geometry: {
        scaleX: scale * pixelRatio,
        scaleY: scale * pixelRatio,
        offsetX: scroll.left * pixelRatio,
        offsetY: scroll.top * pixelRatio,
      },
    });

    context.putImageData(toImageData(region), 0, 0);
  }, [image, scale, method, viewWidth, viewHeight, scroll, measured]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScroll({ left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop });
  };

  const handleClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!picking) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.floor((scroll.left + event.clientX - bounds.left) / scale);
    const y = Math.floor((scroll.top + event.clientY - bounds.top) / scale);

    onPick(x, y);
  };

  return (
    <Box
      ref={scrollRef}
      onScroll={handleScroll}
      sx={{ flexGrow: 1, minWidth: 0, minHeight: 0, overflow: 'auto', display: 'flex' }}
    >
      <Box
        sx={{
          width: scaledWidth,
          height: scaledHeight,
          margin: 'auto',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <Box
          component="canvas"
          ref={canvasRef}
          onClick={handleClick}
          sx={{
            position: 'sticky',
            top: 0,
            left: 0,
            display: 'block',
            boxShadow: 3,
            cursor: picking ? 'crosshair' : 'default',
            backgroundColor: '#ffffff',
            backgroundImage:
              'linear-gradient(45deg, #d9d9d9 25%, transparent 25%), linear-gradient(-45deg, #d9d9d9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d9d9d9 75%), linear-gradient(-45deg, transparent 75%, #d9d9d9 75%)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
          }}
        />
      </Box>
    </Box>
  );
}
