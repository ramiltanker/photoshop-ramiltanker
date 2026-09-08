import { useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';

import Box from '@mui/material/Box';

import { toImageData } from '@/core/image/rasterImage';
import type { RasterImage } from '@/core/image/types';

type ImageCanvasProps = {
  image: RasterImage;
  scale: number;
  picking: boolean;
  onPick: (x: number, y: number) => void;
};

export function ImageCanvas({ image, scale, picking, onPick }: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    const displayWidth = Math.max(1, Math.round(image.width * scale));
    const displayHeight = Math.max(1, Math.round(image.height * scale));

    canvas.width = Math.round(displayWidth * pixelRatio);
    canvas.height = Math.round(displayHeight * pixelRatio);
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const source = document.createElement('canvas');
    source.width = image.width;
    source.height = image.height;

    const sourceContext = source.getContext('2d');

    if (!sourceContext) {
      return;
    }

    sourceContext.putImageData(toImageData(image), 0, 0);

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = scale < 1;
    context.imageSmoothingQuality = 'high';
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
  }, [image, scale]);

  const handleClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!picking) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.floor(((event.clientX - bounds.left) / bounds.width) * image.width);
    const y = Math.floor(((event.clientY - bounds.top) / bounds.height) * image.height);

    onPick(x, y);
  };

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      onClick={handleClick}
      sx={{
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
  );
}
