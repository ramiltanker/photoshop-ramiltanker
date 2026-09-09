import { useEffect, useRef } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { useElementSize } from '@/shared/hooks/useElementSize';

import type { Histogram } from '@/core/image/histogram/computeHistogram';
import { HISTOGRAM_LEVELS } from '@/core/image/histogram/computeHistogram';

const CHART_HEIGHT = 160;
const GRID_STEPS = 4;

type HistogramChartProps = {
  histogram: Histogram;
  logarithmic: boolean;
  color: string;
};

export function HistogramChart({ histogram, logarithmic, color }: HistogramChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useElementSize(canvasRef);
  const theme = useTheme();

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
    const width = size.width;
    const height = CHART_HEIGHT;

    if (width === 0) {
      return;
    }

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    context.clearRect(0, 0, width, height);
    context.fillStyle = theme.palette.grey[100];
    context.fillRect(0, 0, width, height);

    context.strokeStyle = theme.palette.divider;
    context.lineWidth = 1;

    for (let step = 1; step < GRID_STEPS; step += 1) {
      const x = Math.round((width * step) / GRID_STEPS) + 0.5;

      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    const scale = logarithmic
      ? (value: number) => Math.log(1 + value) / Math.log(1 + histogram.maxCount)
      : (value: number) => value / histogram.maxCount;

    if (histogram.maxCount > 0) {
      const barWidth = width / HISTOGRAM_LEVELS;

      context.fillStyle = color;

      for (let level = 0; level < HISTOGRAM_LEVELS; level += 1) {
        const barHeight = scale(histogram.counts[level]) * height;

        if (barHeight > 0) {
          context.fillRect(level * barWidth, height - barHeight, Math.max(barWidth, 1), barHeight);
        }
      }
    }
  }, [histogram, logarithmic, color, theme, size.width]);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      sx={{
        display: 'block',
        width: '100%',
        height: CHART_HEIGHT,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
      }}
    />
  );
}
