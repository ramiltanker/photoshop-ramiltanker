import { useEffect, useState } from 'react';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { getInterpolation, INTERPOLATION_METHODS } from '@/core/image/interpolation/registry';
import type { InterpolationMethod } from '@/core/image/interpolation/types';
import type { RasterImage } from '@/core/image/types';
import { ModalDialog } from '@/shared/components/ModalDialog';
import type { ResizeForm, ResizeUnit } from '../model/resizeForm';
import {
  convertFormUnit,
  formatMegapixels,
  syncLinkedDimension,
  validateResize,
} from '../model/resizeForm';

const DIALOG_WIDTH = 520;

const UNIT_LABELS: Record<ResizeUnit, string> = {
  pixels: 'Пиксели',
  percent: 'Проценты',
};

type ResizeDialogProps = {
  open: boolean;
  image: RasterImage;
  busy: boolean;
  onClose: () => void;
  onSubmit: (width: number, height: number, method: InterpolationMethod) => void;
};

export function ResizeDialog({ open, image, busy, onClose, onSubmit }: ResizeDialogProps) {
  const [form, setForm] = useState<ResizeForm>(() => ({
    unit: 'pixels',
    width: String(image.width),
    height: String(image.height),
    keepRatio: true,
    method: 'bilinear',
  }));

  useEffect(() => {
    if (open) {
      setForm((current) => ({
        unit: 'pixels',
        width: String(image.width),
        height: String(image.height),
        keepRatio: true,
        method: current.method,
      }));
    }
  }, [open, image]);

  const validation = validateResize(image, form);
  const descriptor = getInterpolation(form.method);

  const handleDimensionChange = (field: 'width' | 'height', value: string) => {
    setForm((current) => syncLinkedDimension(image, { ...current, [field]: value }, field));
  };

  const handleUnitChange = (unit: ResizeUnit) => {
    setForm((current) => convertFormUnit(image, current, unit));
  };

  const handleKeepRatioChange = (keepRatio: boolean) => {
    setForm((current) =>
      keepRatio
        ? syncLinkedDimension(image, { ...current, keepRatio }, 'width')
        : { ...current, keepRatio }
    );
  };

  return (
    <ModalDialog open={open} onClose={onClose} width={DIALOG_WIDTH}>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="h6" component="h2">
          Размер изображения
        </Typography>

        <Stack direction="row" spacing={3} divider={<Divider orientation="vertical" flexItem />}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Было
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {image.width} × {image.height}
            </Typography>
            <Typography variant="caption">{formatMegapixels(image.width, image.height)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Станет
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {validation.valid ? `${validation.width} × ${validation.height}` : '—'}
            </Typography>
            <Typography variant="caption">
              {validation.valid ? formatMegapixels(validation.width, validation.height) : '—'}
            </Typography>
          </Box>
        </Stack>

        <TextField
          select
          size="small"
          label="Единицы измерения"
          value={form.unit}
          onChange={(event) => handleUnitChange(event.target.value as ResizeUnit)}
          slotProps={{ select: { MenuProps: { disablePortal: true } } }}
        >
          {(Object.keys(UNIT_LABELS) as ResizeUnit[]).map((unit) => (
            <MenuItem key={unit} value={unit}>
              {UNIT_LABELS[unit]}
            </MenuItem>
          ))}
        </TextField>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            size="small"
            label="Ширина"
            value={form.width}
            error={Boolean(validation.widthError)}
            helperText={validation.widthError ?? ' '}
            onChange={(event) => handleDimensionChange('width', event.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            size="small"
            label="Высота"
            value={form.height}
            error={Boolean(validation.heightError)}
            helperText={validation.heightError ?? ' '}
            onChange={(event) => handleDimensionChange('height', event.target.value)}
            sx={{ flexGrow: 1 }}
          />
        </Stack>

        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={form.keepRatio}
              onChange={(event) => handleKeepRatioChange(event.target.checked)}
            />
          }
          label="Сохранять пропорции исходного изображения"
        />

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            select
            size="small"
            label="Алгоритм интерполяции"
            value={form.method}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                method: event.target.value as InterpolationMethod,
              }))
            }
            slotProps={{ select: { MenuProps: { disablePortal: true } } }}
            sx={{ flexGrow: 1 }}
          >
            {INTERPOLATION_METHODS.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
          <Tooltip
            title={descriptor.summary}
            arrow
            describeChild
            slotProps={{ popper: { disablePortal: true } }}
          >
            <InfoOutlinedIcon fontSize="small" color="action" tabIndex={0} />
          </Tooltip>
        </Stack>

        {validation.totalError && <Alert severity="error">{validation.totalError}</Alert>}

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose} disabled={busy}>
            Отмена
          </Button>
          <Button
            variant="contained"
            disabled={!validation.valid || busy}
            onClick={() => onSubmit(validation.width, validation.height, form.method)}
          >
            Изменить размер
          </Button>
        </Stack>
      </Stack>
    </ModalDialog>
  );
}
