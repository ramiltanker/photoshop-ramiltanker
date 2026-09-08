import { useEffect, useRef } from 'react';

import Box from '@mui/material/Box';

import { toImageData } from '@/core/image/rasterImage';
import type { RasterImage } from '@/core/image/types';

const BOX_SIZE = 56;

type ChannelThumbnailProps = {
  image: RasterImage;
  dimmed: boolean;
};

export function ChannelThumbnail({ image, dimmed }: ChannelThumbnailProps) {
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

    canvas.width = image.width;
    canvas.height = image.height;
    context.putImageData(toImageData(image), 0, 0);
  }, [image]);

  const ratio = Math.min(BOX_SIZE / image.width, BOX_SIZE / image.height);

  return (
    <Box
      sx={{
        width: BOX_SIZE,
        height: BOX_SIZE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderRadius: 1,
        overflow: 'hidden',
        backgroundColor: 'grey.900',
      }}
    >
      <Box
        component="canvas"
        ref={canvasRef}
        sx={{
          display: 'block',
          width: Math.max(1, Math.round(image.width * ratio)),
          height: Math.max(1, Math.round(image.height * ratio)),
          opacity: dimmed ? 0.25 : 1,
          transition: 'opacity 150ms',
        }}
      />
    </Box>
  );
}
