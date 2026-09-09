import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';

import type { PixelSample } from '@/core/image/color/samplePixel';
import { samplePixel } from '@/core/image/color/samplePixel';
import { applyLevels } from '@/core/image/levels/applyLevels';
import type { SaveOptions } from '@/core/image/saveImageDocument';
import { useElementSize } from '@/shared/hooks/useElementSize';
import { EditorSidebar } from './components/EditorSidebar';
import { EditorToolbar } from './components/EditorToolbar';
import { EmptyState } from './components/EmptyState';
import { ImageCanvas } from './components/ImageCanvas';
import { LevelsDialog } from './components/LevelsDialog';
import { SaveImageDialog } from './components/SaveImageDialog';
import { StatusBar } from './components/StatusBar';
import { useChannelComposition } from './hooks/useChannelComposition';
import { useImageDocument } from './hooks/useImageDocument';
import { useLevels } from './hooks/useLevels';
import type { EditorTool } from './model/tools';
import { computeFitScale } from './model/viewport';

const PROGRESS_SCALE = 100;

export function EditorPage() {
  const { imageDocument, status, progress, error, openFile, saveAs, replaceImage, dismissError } =
    useImageDocument();
  const levels = useLevels(imageDocument?.image ?? null);

  const effectiveImage = levels.previewImage ?? imageDocument?.image ?? null;

  const { channels, selection, previews, composed, composing, toggleChannel, resetSelection } =
    useChannelComposition(
      effectiveImage,
      imageDocument?.image ?? null,
      imageDocument?.metadata ?? null
    );

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [tool, setTool] = useState<EditorTool>('none');
  const [sample, setSample] = useState<PixelSample | null>(null);
  const [applyingLevels, setApplyingLevels] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportSize = useElementSize(viewportRef);

  const busy = status !== 'idle' || applyingLevels;
  const displayedImage = composed ?? effectiveImage;

  const scale = useMemo(
    () => (displayedImage ? computeFitScale(displayedImage, viewportSize) : 1),
    [displayedImage, viewportSize]
  );

  useEffect(() => {
    setSample(null);
    setTool('none');
  }, [imageDocument]);

  const handlePick = useCallback(
    (x: number, y: number) => {
      if (imageDocument) {
        setSample(samplePixel(imageDocument.image, x, y));
      }
    },
    [imageDocument]
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

  const handleApplyLevels = async () => {
    if (!imageDocument) {
      return;
    }

    setApplyingLevels(true);
    replaceImage(await applyLevels(imageDocument.image, levels.state));
    setApplyingLevels(false);
    levels.closeDialog();
  };

  const handleSave = (options: SaveOptions, fileName: string) => {
    setSaveDialogOpen(false);
    void saveAs(options, fileName);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'auto', md: '100%' },
        minHeight: '100%',
      }}
    >
      <EditorToolbar
        canSave={Boolean(imageDocument)}
        busy={busy}
        tool={tool}
        onOpenFile={(file) => void openFile(file)}
        onSaveClick={() => setSaveDialogOpen(true)}
        onLevelsClick={levels.openDialog}
        onToolChange={setTool}
      />

      <Box sx={{ height: 4 }}>
        {(busy || composing) && (
          <LinearProgress
            variant={busy ? 'determinate' : 'indeterminate'}
            value={progress * PROGRESS_SCALE}
          />
        )}
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box
          ref={viewportRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragActive(false)}
          sx={{
            flexGrow: 1,
            minHeight: { xs: 320, md: 240 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            p: 2,
            backgroundColor: dragActive ? 'action.hover' : 'grey.200',
            transition: 'background-color 150ms',
          }}
        >
          {displayedImage ? (
            <ImageCanvas
              image={displayedImage}
              scale={scale}
              picking={tool === 'eyedropper'}
              onPick={handlePick}
            />
          ) : (
            <EmptyState />
          )}
        </Box>

        <EditorSidebar
          hasImage={Boolean(imageDocument)}
          channels={channels}
          selection={selection}
          previews={previews}
          sample={sample}
          eyedropperActive={tool === 'eyedropper'}
          onToggleChannel={toggleChannel}
          onResetChannels={resetSelection}
        />
      </Box>

      <StatusBar metadata={imageDocument?.metadata ?? null} scale={scale} />

      {imageDocument && (
        <LevelsDialog
          open={levels.open}
          image={imageDocument.image}
          metadata={imageDocument.metadata}
          target={levels.target}
          state={levels.state}
          previewEnabled={levels.previewEnabled}
          logarithmic={levels.logarithmic}
          busy={applyingLevels}
          onTargetChange={levels.setTarget}
          onSettingsChange={levels.updateTargetSettings}
          onPreviewChange={levels.setPreviewEnabled}
          onLogarithmicChange={levels.setLogarithmic}
          onReset={levels.resetState}
          onCancel={levels.closeDialog}
          onApply={handleApplyLevels}
        />
      )}

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
