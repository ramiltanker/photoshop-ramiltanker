import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import Box from '@mui/material/Box';

import { MAX_LEVEL } from '@/core/image/histogram/computeHistogram';
import type { LevelsSettings } from '@/core/image/levels/levelsSettings';
import {
  gammaToPosition,
  positionToGamma,
  withBlackPoint,
  withWhitePoint,
} from '@/core/image/levels/levelsSettings';

const TRACK_HEIGHT = 12;
const MARKER_SIZE = 14;
const PERCENT = 100;

type MarkerKind = 'black' | 'gamma' | 'white';

type LevelsSliderProps = {
  settings: LevelsSettings;
  onChange: (settings: LevelsSettings) => void;
};

const MARKER_COLORS: Record<MarkerKind, string> = {
  black: '#000000',
  gamma: '#9e9e9e',
  white: '#ffffff',
};

const MARKER_TITLES: Record<MarkerKind, string> = {
  black: 'Точка чёрного',
  gamma: 'Полутона (гамма)',
  white: 'Точка белого',
};

export function LevelsSlider({ settings, onChange }: LevelsSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<MarkerKind | null>(null);

  const positions: Record<MarkerKind, number> = {
    black: settings.black,
    gamma: gammaToPosition(settings),
    white: settings.white,
  };

  const readLevel = (clientX: number): number => {
    const track = trackRef.current;

    if (!track) {
      return 0;
    }

    const bounds = track.getBoundingClientRect();
    const ratio = (clientX - bounds.left) / bounds.width;

    return Math.min(MAX_LEVEL, Math.max(0, ratio * MAX_LEVEL));
  };

  const updateMarker = (marker: MarkerKind, level: number) => {
    if (marker === 'black') {
      onChange(withBlackPoint(settings, level));
      return;
    }

    if (marker === 'white') {
      onChange(withWhitePoint(settings, level));
      return;
    }

    onChange({ ...settings, gamma: positionToGamma(settings, level) });
  };

  const handlePointerDown = (marker: MarkerKind) => (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(marker);
    updateMarker(marker, readLevel(event.clientX));
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging) {
      updateMarker(dragging, readLevel(event.clientX));
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(null);
  };

  return (
    <Box sx={{ pt: 0.5, pb: 2.5 }}>
      <Box
        ref={trackRef}
        sx={{
          position: 'relative',
          height: TRACK_HEIGHT,
          borderRadius: 0.5,
          border: 1,
          borderColor: 'divider',
          background: 'linear-gradient(to right, #000000, #ffffff)',
        }}
      >
        {(Object.keys(positions) as MarkerKind[]).map((marker) => (
          <Box
            key={marker}
            title={MARKER_TITLES[marker]}
            onPointerDown={handlePointerDown(marker)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            sx={{
              position: 'absolute',
              top: TRACK_HEIGHT,
              left: `${(positions[marker] / MAX_LEVEL) * PERCENT}%`,
              width: MARKER_SIZE,
              height: MARKER_SIZE,
              marginLeft: `${-MARKER_SIZE / 2}px`,
              cursor: 'ew-resize',
              touchAction: 'none',
              backgroundColor: MARKER_COLORS[marker],
              clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
              filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 0.7))',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
