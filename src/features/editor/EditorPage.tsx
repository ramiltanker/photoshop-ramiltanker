import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';

import type { PixelSample } from '@/core/image/color/samplePixel';
import { samplePixel } from '@/core/image/color/samplePixel';
import { applyKernel } from '@/core/image/filters/applyKernel';
import { DEFAULT_INTERPOLATION } from '@/core/image/interpolation/registry';
import { resizeImage } from '@/core/image/interpolation/resample';
import type { InterpolationMethod } from '@/core/image/interpolation/types';
import { applyLevels } from '@/core/image/levels/applyLevels';
import type { SaveOptions } from '@/core/image/saveImageDocument';
import { useElementSize } from '@/shared/hooks/useElementSize';
import { EditorSidebar } from './components/EditorSidebar';
import { EditorToolbar } from './components/EditorToolbar';
import { EmptyState } from './components/EmptyState';
import { FilterDialog } from './components/FilterDialog';
import { ImageCanvas } from './components/ImageCanvas';
import { LevelsDialog } from './components/LevelsDialog';
import { ResizeDialog } from './components/ResizeDialog';
import { SaveImageDialog } from './components/SaveImageDialog';
import { StatusBar } from './components/StatusBar';
import { useChannelComposition } from './hooks/useChannelComposition';
import { useFilter } from './hooks/useFilter';
import { useImageDocument } from './hooks/useImageDocument';
import { useLevels } from './hooks/useLevels';
import type { EditorTool } from './model/tools';
import { computeFitScale } from './model/viewport';

const PROGRESS_SCALE = 100;

export function EditorPage() {
  const { imageDocument, status, progress, error, openFile, saveAs, replaceImage, dismissError } =
    useImageDocument();
  const levels = useLevels(imageDocument?.image ?? null);
  const filter = useFilter(imageDocument?.image ?? null, imageDocument?.metadata ?? null);

  const effectiveImage = levels.previewImage ?? filter.previewImage ?? imageDocument?.image ?? null;

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
  const [resizeOpen, setResizeOpen] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [applyingFilter, setApplyingFilter] = useState(false);
  const [operationProgress, setOperationProgress] = useState(0);
  const [scale, setScale] = useState(1);
  const [autoFit, setAutoFit] = useState(true);

  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportSize = useElementSize(viewportRef);

  const operationRunning = applyingLevels || resizing || applyingFilter;
  const busy = status !== 'idle' || operationRunning;
  const previewRunning = composing || levels.previewPending || filter.previewPending;
  const displayedImage = composed ?? effectiveImage;

  useEffect(() => {
    setAutoFit(true);
  }, [imageDocument?.metadata]);

  useEffect(() => {
    if (!imageDocument || viewportSize.width === 0 || !autoFit) {
      return;
    }

    setScale(computeFitScale(imageDocument.image, viewportSize));
  }, [imageDocument, viewportSize, autoFit]);

  const handleScaleChange = (value: number) => {
    setAutoFit(false);
    setScale(value);
  };

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

    setOperationProgress(0);
    setApplyingLevels(true);
    replaceImage(await applyLevels(imageDocument.image, levels.state, setOperationProgress));
    setApplyingLevels(false);
    levels.closeDialog();
  };

  const handleResize = async (width: number, height: number, method: InterpolationMethod) => {
    if (!imageDocument) {
      return;
    }

    setOperationProgress(0);
    setResizing(true);
    setAutoFit(false);
    replaceImage(
      await resizeImage(imageDocument.image, width, height, method, setOperationProgress)
    );
    setResizing(false);
    setResizeOpen(false);
  };

  const handleApplyFilter = async () => {
    if (!imageDocument || !filter.request) {
      return;
    }

    setOperationProgress(0);
    setApplyingFilter(true);

    const result = await applyKernel(imageDocument.image, filter.request, setOperationProgress);

    if (result) {
      replaceImage(result);
    }

    setApplyingFilter(false);
    filter.closeDialog();
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
        onResizeClick={() => setResizeOpen(true)}
        onFilterClick={filter.openDialog}
        onToolChange={setTool}
      />

      <Box sx={{ height: 4 }}>
        {(busy || previewRunning) && (
          <LinearProgress
            variant={busy ? 'determinate' : 'indeterminate'}
            value={(status !== 'idle' ? progress : operationProgress) * PROGRESS_SCALE}
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
            minWidth: 0,
            minHeight: { xs: 320, md: 240 },
            display: 'flex',
            overflow: 'hidden',
            backgroundColor: dragActive ? 'action.hover' : 'grey.200',
            transition: 'background-color 150ms',
          }}
        >
          {displayedImage ? (
            <ImageCanvas
              image={displayedImage}
              scale={scale}
              method={DEFAULT_INTERPOLATION}
              picking={tool === 'eyedropper'}
              onPick={handlePick}
            />
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EmptyState />
            </Box>
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

      <StatusBar
        metadata={imageDocument?.metadata ?? null}
        image={imageDocument?.image ?? null}
        scale={scale}
        onScaleChange={handleScaleChange}
      />

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

      <FilterDialog
        open={filter.open}
        cells={filter.cells}
        validation={filter.validation}
        availableChannels={filter.availableChannels}
        channels={filter.channels}
        edgeMode={filter.edgeMode}
        previewEnabled={filter.previewEnabled}
        busy={applyingFilter}
        onPresetChange={filter.selectPreset}
        onCellChange={filter.updateCell}
        onChannelToggle={filter.toggleChannel}
        onAllChannelsChange={filter.setAllChannels}
        onEdgeModeChange={filter.setEdgeMode}
        onPreviewChange={filter.setPreviewEnabled}
        onReset={filter.resetSettings}
        onClose={filter.closeDialog}
        onApply={handleApplyFilter}
      />

      {imageDocument && (
        <ResizeDialog
          open={resizeOpen}
          image={imageDocument.image}
          busy={resizing}
          onClose={() => setResizeOpen(false)}
          onSubmit={handleResize}
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
