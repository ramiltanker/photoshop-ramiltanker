import { useEffect, useRef, useState } from 'react';

import type { RasterImage } from '@/core/image/types';

const PREVIEW_THROTTLE_MS = 60;

export type PreviewProcessor<T> = (
  source: RasterImage,
  params: T,
  signal: AbortSignal
) => Promise<RasterImage | null>;

export function useThrottledPreview<T>(
  source: RasterImage | null,
  params: T,
  active: boolean,
  process: PreviewProcessor<T>
) {
  const [preview, setPreview] = useState<RasterImage | null>(null);
  const [pending, setPending] = useState(false);
  const lastRunRef = useRef(0);

  useEffect(() => {
    if (!source || !active) {
      setPreview(null);
      setPending(false);
      return;
    }

    const controller = new AbortController();
    const delay = Math.max(0, PREVIEW_THROTTLE_MS - (performance.now() - lastRunRef.current));

    setPending(true);

    const timer = window.setTimeout(() => {
      lastRunRef.current = performance.now();

      void process(source, params, controller.signal).then((result) => {
        if (result && !controller.signal.aborted) {
          setPreview(result);
          setPending(false);
        }
      });
    }, delay);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [source, params, active, process]);

  return { preview, pending };
}
