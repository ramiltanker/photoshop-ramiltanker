import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ChannelId, ChannelSelection } from '@/core/image/channels/channelModel';
import { buildChannelModel, createFullSelection } from '@/core/image/channels/channelModel';
import type { ChannelPreview } from '@/core/image/channels/channelPreview';
import { buildChannelPreviews } from '@/core/image/channels/channelPreview';
import { composeChannels } from '@/core/image/channels/composeChannels';
import type { ImageDocument, RasterImage } from '@/core/image/types';

const PREVIEW_MAX_SIDE = 72;

export function useChannelComposition(imageDocument: ImageDocument | null) {
  const channels = useMemo(
    () =>
      imageDocument
        ? buildChannelModel(imageDocument.metadata.colorModel, imageDocument.metadata.hasAlpha)
        : [],
    [imageDocument]
  );

  const [selection, setSelection] = useState<ChannelSelection>(() => createFullSelection(channels));
  const [composed, setComposed] = useState<RasterImage | null>(null);
  const [previews, setPreviews] = useState<ChannelPreview[]>([]);
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    setSelection(createFullSelection(channels));
  }, [channels]);

  useEffect(() => {
    if (!imageDocument) {
      setPreviews([]);
      return;
    }

    setPreviews(
      buildChannelPreviews(
        imageDocument.image,
        channels.map((channel) => channel.id),
        PREVIEW_MAX_SIDE
      )
    );
  }, [imageDocument, channels]);

  useEffect(() => {
    if (!imageDocument) {
      setComposed(null);
      return;
    }

    let cancelled = false;
    setComposing(true);

    composeChannels(imageDocument.image, channels, selection).then((result) => {
      if (!cancelled) {
        setComposed(result);
        setComposing(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [imageDocument, channels, selection]);

  const toggleChannel = useCallback((id: ChannelId) => {
    setSelection((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  const resetSelection = useCallback(() => {
    setSelection(createFullSelection(channels));
  }, [channels]);

  return { channels, selection, previews, composed, composing, toggleChannel, resetSelection };
}
