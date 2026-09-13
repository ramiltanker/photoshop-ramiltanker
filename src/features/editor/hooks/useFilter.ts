import { useCallback, useMemo, useState } from 'react';

import type { ChannelDescriptor, ChannelId } from '@/core/image/channels/channelModel';
import { buildChannelModel } from '@/core/image/channels/channelModel';
import type { FilterRequest } from '@/core/image/filters/applyKernel';
import { applyKernel } from '@/core/image/filters/applyKernel';
import type { KernelPresetId } from '@/core/image/filters/kernel';
import { DEFAULT_PRESET, getPreset } from '@/core/image/filters/kernel';
import type { EdgeMode } from '@/core/image/filters/padding';
import type { ImageMetadata, RasterImage } from '@/core/image/types';
import { isIdentityKernel, validateKernel } from '../model/kernelForm';
import type { PreviewProcessor } from './useThrottledPreview';
import { useThrottledPreview } from './useThrottledPreview';

const DEFAULT_EDGE_MODE: EdgeMode = 'replicate';

const processFilter: PreviewProcessor<FilterRequest | null> = (source, request, signal) =>
  request ? applyKernel(source, request, undefined, signal) : Promise.resolve(null);

function defaultChannels(available: ChannelDescriptor[]): ChannelId[] {
  return available.filter((channel) => channel.id !== 'alpha').map((channel) => channel.id);
}

export function useFilter(image: RasterImage | null, metadata: ImageMetadata | null) {
  const availableChannels = useMemo(
    () => (metadata ? buildChannelModel(metadata.colorModel, metadata.hasAlpha) : []),
    [metadata]
  );

  const [open, setOpen] = useState(false);
  const [cells, setCells] = useState<string[]>(() => [...getPreset(DEFAULT_PRESET).cells]);
  const [channels, setChannels] = useState<ChannelId[]>([]);
  const [edgeMode, setEdgeMode] = useState<EdgeMode>(DEFAULT_EDGE_MODE);
  const [previewEnabled, setPreviewEnabled] = useState(true);

  const validation = useMemo(() => validateKernel(cells), [cells]);

  const request = useMemo<FilterRequest | null>(
    () =>
      validation.kernel && channels.length > 0
        ? { kernel: validation.kernel, channels, edgeMode }
        : null,
    [validation, channels, edgeMode]
  );

  const { preview: previewImage, pending: previewPending } = useThrottledPreview(
    image,
    request,
    open && previewEnabled && request !== null && !isIdentityKernel(request.kernel),
    processFilter
  );

  const resetSettings = useCallback(() => {
    setCells([...getPreset(DEFAULT_PRESET).cells]);
    setChannels(defaultChannels(availableChannels));
    setEdgeMode(DEFAULT_EDGE_MODE);
  }, [availableChannels]);

  const openDialog = useCallback(() => {
    resetSettings();
    setPreviewEnabled(true);
    setOpen(true);
  }, [resetSettings]);

  const closeDialog = useCallback(() => {
    setOpen(false);
    resetSettings();
  }, [resetSettings]);

  const selectPreset = useCallback((id: KernelPresetId) => {
    setCells([...getPreset(id).cells]);
  }, []);

  const updateCell = useCallback((index: number, value: string) => {
    setCells((current) => current.map((cell, position) => (position === index ? value : cell)));
  }, []);

  const toggleChannel = useCallback((id: ChannelId) => {
    setChannels((current) =>
      current.includes(id) ? current.filter((channel) => channel !== id) : [...current, id]
    );
  }, []);

  const setAllChannels = useCallback(
    (enabled: boolean) => {
      setChannels(enabled ? availableChannels.map((channel) => channel.id) : []);
    },
    [availableChannels]
  );

  return {
    open,
    cells,
    channels,
    availableChannels,
    edgeMode,
    previewEnabled,
    validation,
    request,
    previewImage,
    previewPending,
    openDialog,
    closeDialog,
    resetSettings,
    selectPreset,
    updateCell,
    toggleChannel,
    setAllChannels,
    setEdgeMode,
    setPreviewEnabled,
  };
}
