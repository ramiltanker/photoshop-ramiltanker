import { useCallback, useEffect, useRef, useState } from 'react';

import { applyLevels } from '@/core/image/levels/applyLevels';
import type { LevelsSettings, LevelsState, LevelsTarget } from '@/core/image/levels/levelsSettings';
import { createDefaultState, isStateNeutral } from '@/core/image/levels/levelsSettings';
import type { RasterImage } from '@/core/image/types';

const PREVIEW_THROTTLE_MS = 60;

export function useLevels(image: RasterImage | null) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<LevelsTarget>('master');
  const [state, setState] = useState<LevelsState>(createDefaultState);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [logarithmic, setLogarithmic] = useState(false);
  const [previewImage, setPreviewImage] = useState<RasterImage | null>(null);
  const lastRunRef = useRef(0);

  useEffect(() => {
    if (!image || !open || !previewEnabled || isStateNeutral(state)) {
      setPreviewImage(null);
      return;
    }

    let cancelled = false;
    const delay = Math.max(0, PREVIEW_THROTTLE_MS - (performance.now() - lastRunRef.current));

    const timer = window.setTimeout(() => {
      lastRunRef.current = performance.now();

      applyLevels(image, state).then((result) => {
        if (!cancelled) {
          setPreviewImage(result);
        }
      });
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [image, open, previewEnabled, state]);

  const openDialog = useCallback(() => {
    setState(createDefaultState());
    setTarget('master');
    setPreviewEnabled(true);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setPreviewImage(null);
    setState(createDefaultState());
  }, []);

  const updateTargetSettings = useCallback(
    (settings: LevelsSettings) => {
      setState((current) => ({ ...current, [target]: settings }));
    },
    [target]
  );

  const resetState = useCallback(() => {
    setState(createDefaultState());
  }, []);

  return {
    open,
    target,
    state,
    logarithmic,
    setLogarithmic,
    previewEnabled,
    previewImage,
    setTarget,
    setPreviewEnabled,
    updateTargetSettings,
    resetState,
    openDialog,
    closeDialog,
  };
}
