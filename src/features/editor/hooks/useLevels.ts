import { useCallback, useState } from 'react';

import { applyLevels } from '@/core/image/levels/applyLevels';
import type { LevelsSettings, LevelsState, LevelsTarget } from '@/core/image/levels/levelsSettings';
import { createDefaultState, isStateNeutral } from '@/core/image/levels/levelsSettings';
import type { RasterImage } from '@/core/image/types';
import type { PreviewProcessor } from './useThrottledPreview';
import { useThrottledPreview } from './useThrottledPreview';

const processLevels: PreviewProcessor<LevelsState> = (source, state) => applyLevels(source, state);

export function useLevels(image: RasterImage | null) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<LevelsTarget>('master');
  const [state, setState] = useState<LevelsState>(createDefaultState);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [logarithmic, setLogarithmic] = useState(false);

  const { preview: previewImage, pending: previewPending } = useThrottledPreview(
    image,
    state,
    open && previewEnabled && !isStateNeutral(state),
    processLevels
  );

  const openDialog = useCallback(() => {
    setState(createDefaultState());
    setTarget('master');
    setPreviewEnabled(true);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
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
    previewPending,
    setTarget,
    setPreviewEnabled,
    updateTargetSettings,
    resetState,
    openDialog,
    closeDialog,
  };
}
