import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { buildFileName } from '@/core/image/saveImageDocument';
import type { SaveOptions } from '@/core/image/saveImageDocument';
import type { ImageFormat, ImageMetadata } from '@/core/image/types';
import { ModalDialog } from '@/shared/components/ModalDialog';

const FORMAT_OPTIONS: { value: ImageFormat; label: string }[] = [
  { value: 'png', label: 'PNG — без потерь, с прозрачностью' },
  { value: 'jpeg', label: 'JPEG — с потерями, без прозрачности' },
  { value: 'gb7', label: 'GrayBit-7 — оттенки серого, собственный кодер' },
];

const DEFAULT_QUALITY = 0.92;
const MIN_QUALITY = 0.1;
const QUALITY_STEP = 0.01;
const PERCENT = 100;
const DIALOG_WIDTH = 520;

type SaveImageDialogProps = {
  open: boolean;
  metadata: ImageMetadata;
  onClose: () => void;
  onSubmit: (options: SaveOptions, fileName: string) => void;
};

export function SaveImageDialog({ open, metadata, onClose, onSubmit }: SaveImageDialogProps) {
  const [format, setFormat] = useState<ImageFormat>(metadata.format);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [withMask, setWithMask] = useState(metadata.hasAlpha);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (open) {
      setFormat(metadata.format);
      setQuality(DEFAULT_QUALITY);
      setWithMask(metadata.hasAlpha);
      setFileName(buildFileName(metadata.fileName, metadata.format));
    }
  }, [open, metadata]);

  const handleFormatChange = (nextFormat: ImageFormat) => {
    setFormat(nextFormat);
    setFileName(buildFileName(metadata.fileName, nextFormat));
  };

  const handleSubmit = () => {
    onSubmit({ format, quality, withMask }, fileName.trim());
  };

  return (
    <ModalDialog open={open} onClose={onClose} width={DIALOG_WIDTH}>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Typography variant="h6" component="h2">
          Сохранить изображение
        </Typography>

        <TextField
          select
          label="Формат"
          size="small"
          value={format}
          onChange={(event) => handleFormatChange(event.target.value as ImageFormat)}
          slotProps={{ select: { MenuProps: { disablePortal: true } } }}
        >
          {FORMAT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Имя файла"
          size="small"
          value={fileName}
          onChange={(event) => setFileName(event.target.value)}
        />

        {format === 'jpeg' && (
          <Stack spacing={1}>
            <Typography variant="body2">Качество: {Math.round(quality * PERCENT)} %</Typography>
            <Slider
              size="small"
              value={quality}
              min={MIN_QUALITY}
              max={1}
              step={QUALITY_STEP}
              onChange={(_, value) => setQuality(value as number)}
            />
          </Stack>
        )}

        {format === 'gb7' && (
          <Stack spacing={0.5}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={withMask}
                  onChange={(event) => setWithMask(event.target.checked)}
                />
              }
              label="Записать бит маски прозрачности"
            />
            <Typography variant="caption" color="text.secondary">
              Цвет будет приведён к 7-битным оттенкам серого по формуле яркости
            </Typography>
          </Stack>
        )}

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!fileName.trim()}>
            Сохранить
          </Button>
        </Stack>
      </Stack>
    </ModalDialog>
  );
}
