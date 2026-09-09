import { useCallback, useState } from 'react';

import { loadImageDocument } from '@/core/image/loadImageDocument';
import { buildFileName, createImageBlob } from '@/core/image/saveImageDocument';
import type { SaveOptions } from '@/core/image/saveImageDocument';
import type { ImageDocument, RasterImage } from '@/core/image/types';
import { downloadBlob } from '@/shared/utils/downloadBlob';

export type EditorStatus = 'idle' | 'loading' | 'saving';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Неизвестная ошибка при обработке изображения';
}

export function useImageDocument() {
  const [imageDocument, setImageDocument] = useState<ImageDocument | null>(null);
  const [status, setStatus] = useState<EditorStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const openFile = useCallback(async (file: File) => {
    setStatus('loading');
    setProgress(0);
    setError(null);

    try {
      setImageDocument(await loadImageDocument(file, setProgress));
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setStatus('idle');
      setProgress(0);
    }
  }, []);

  const saveAs = useCallback(
    async (options: SaveOptions, fileName: string) => {
      if (!imageDocument) {
        return;
      }

      setStatus('saving');
      setProgress(0);
      setError(null);

      try {
        const blob = await createImageBlob(imageDocument.image, options, setProgress);
        downloadBlob(
          blob,
          fileName || buildFileName(imageDocument.metadata.fileName, options.format)
        );
      } catch (cause) {
        setError(getErrorMessage(cause));
      } finally {
        setStatus('idle');
        setProgress(0);
      }
    },
    [imageDocument]
  );

  const replaceImage = useCallback((image: RasterImage) => {
    setImageDocument((current) => (current ? { ...current, image } : current));
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  return {
    imageDocument,
    status,
    progress,
    error,
    openFile,
    saveAs,
    replaceImage,
    dismissError,
  };
}
