import { useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';

import type { SaveOptions } from '@/core/image/saveImageDocument';
import { useElementSize } from '@/shared/hooks/useElementSize';
import { EditorToolbar } from './components/EditorToolbar';
import { EmptyState } from './components/EmptyState';
import { ImageCanvas } from './components/ImageCanvas';
import { SaveImageDialog } from './components/SaveImageDialog';
import { StatusBar } from './components/StatusBar';
import { useImageDocument } from './hooks/useImageDocument';
import { computeFitScale } from './model/viewport';

const PROGRESS_SCALE = 100;

export function EditorPage() {
  const { imageDocument, status, progress, error, openFile, saveAs, dismissError } =
    useImageDocument();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportSize = useElementSize(viewportRef);

  const busy = status !== 'idle';

  const scale = useMemo(
    () => (imageDocument ? computeFitScale(imageDocument.image, viewportSize) : 1),
    [imageDocument, viewportSize]
  );

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files[0];

    if (file && !busy) {
      void openFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleSave = (options: SaveOptions, fileName: string) => {
    setSaveDialogOpen(false);
    void saveAs(options, fileName);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <EditorToolbar
        canSave={Boolean(imageDocument)}
        busy={busy}
        onOpenFile={(file) => void openFile(file)}
        onSaveClick={() => setSaveDialogOpen(true)}
      />

      <Box sx={{ height: 4 }}>
        {busy && <LinearProgress variant="determinate" value={progress * PROGRESS_SCALE} />}
      </Box>

      <Box
        ref={viewportRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragActive(false)}
        sx={{
          flexGrow: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          p: 2,
          backgroundColor: dragActive ? 'action.hover' : 'grey.200',
          transition: 'background-color 150ms',
        }}
      >
        {imageDocument ? <ImageCanvas image={imageDocument.image} scale={scale} /> : <EmptyState />}
      </Box>

      <StatusBar metadata={imageDocument?.metadata ?? null} scale={scale} />

      {imageDocument && (
        <SaveImageDialog
          open={saveDialogOpen}
          metadata={imageDocument.metadata}
          onClose={() => setSaveDialogOpen(false)}
          onSubmit={handleSave}
        />
      )}

      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={dismissError}>
        <Alert severity="error" variant="filled" onClose={dismissError}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
