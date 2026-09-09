import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import type { HistogramSource } from '@/core/image/histogram/computeHistogram';
import { computeHistogram, MAX_LEVEL } from '@/core/image/histogram/computeHistogram';
import type { LevelsSettings, LevelsState, LevelsTarget } from '@/core/image/levels/levelsSettings';
import {
  buildTargets,
  clampGamma,
  MAX_GAMMA,
  MIN_GAMMA,
  withBlackPoint,
  withWhitePoint,
} from '@/core/image/levels/levelsSettings';
import type { ImageMetadata, RasterImage } from '@/core/image/types';
import { ModalDialog } from '@/shared/components/ModalDialog';
import { HistogramChart } from './HistogramChart';
import { LevelsSlider } from './LevelsSlider';

const DIALOG_WIDTH = 560;
const GAMMA_STEP = 0.1;
const FIELD_WIDTH = 104;

const TARGET_LABELS: Record<LevelsTarget, string> = {
  master: 'Master — все цветовые каналы',
  red: 'Красный',
  green: 'Зелёный',
  blue: 'Синий',
  alpha: 'Альфа',
};

const HISTOGRAM_SOURCES: Record<LevelsTarget, HistogramSource> = {
  master: 'luma',
  red: 'red',
  green: 'green',
  blue: 'blue',
  alpha: 'alpha',
};

const HISTOGRAM_COLORS: Record<LevelsTarget, string> = {
  master: '#424242',
  red: '#d32f2f',
  green: '#2e7d32',
  blue: '#1565c0',
  alpha: '#757575',
};

type LevelsDialogProps = {
  open: boolean;
  image: RasterImage;
  metadata: ImageMetadata;
  target: LevelsTarget;
  state: LevelsState;
  previewEnabled: boolean;
  logarithmic: boolean;
  busy: boolean;
  onTargetChange: (target: LevelsTarget) => void;
  onSettingsChange: (settings: LevelsSettings) => void;
  onPreviewChange: (enabled: boolean) => void;
  onLogarithmicChange: (logarithmic: boolean) => void;
  onReset: () => void;
  onCancel: () => void;
  onApply: () => void;
};

export function LevelsDialog({
  open,
  image,
  metadata,
  target,
  state,
  previewEnabled,
  logarithmic,
  busy,
  onTargetChange,
  onSettingsChange,
  onPreviewChange,
  onLogarithmicChange,
  onReset,
  onCancel,
  onApply,
}: LevelsDialogProps) {
  const targets = useMemo(
    () => buildTargets(metadata.colorModel, metadata.hasAlpha),
    [metadata.colorModel, metadata.hasAlpha]
  );

  const histogram = useMemo(
    () => (open ? computeHistogram(image, HISTOGRAM_SOURCES[target]) : null),
    [open, image, target]
  );

  const settings = state[target];

  return (
    <ModalDialog open={open} onClose={onCancel} width={DIALOG_WIDTH}>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="h6" component="h2">
          Уровни
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
          <TextField
            select
            size="small"
            label="Канал"
            value={target}
            onChange={(event) => onTargetChange(event.target.value as LevelsTarget)}
            slotProps={{ select: { MenuProps: { disablePortal: true } } }}
            sx={{ flexGrow: 1 }}
          >
            {targets.map((item) => (
              <MenuItem key={item} value={item}>
                {TARGET_LABELS[item]}
              </MenuItem>
            ))}
          </TextField>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={logarithmic ? 'log' : 'linear'}
            onChange={(_, value) => {
              if (value) {
                onLogarithmicChange(value === 'log');
              }
            }}
          >
            <ToggleButton value="linear">Линейная</ToggleButton>
            <ToggleButton value="log">Лог.</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Box>
          {histogram && (
            <HistogramChart
              histogram={histogram}
              logarithmic={logarithmic}
              color={HISTOGRAM_COLORS[target]}
            />
          )}
          <LevelsSlider settings={settings} onChange={onSettingsChange} />
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            size="small"
            type="number"
            label="Чёрная точка"
            value={settings.black}
            inputProps={{ min: 0, max: MAX_LEVEL, step: 1 }}
            sx={{ width: { xs: '100%', sm: FIELD_WIDTH } }}
            onChange={(event) =>
              onSettingsChange(withBlackPoint(settings, Number(event.target.value)))
            }
          />
          <TextField
            size="small"
            type="number"
            label="Гамма"
            value={settings.gamma.toFixed(2)}
            inputProps={{ min: MIN_GAMMA, max: MAX_GAMMA, step: GAMMA_STEP }}
            sx={{ width: { xs: '100%', sm: FIELD_WIDTH } }}
            onChange={(event) =>
              onSettingsChange({ ...settings, gamma: clampGamma(Number(event.target.value)) })
            }
          />
          <TextField
            size="small"
            type="number"
            label="Белая точка"
            value={settings.white}
            inputProps={{ min: 0, max: MAX_LEVEL, step: 1 }}
            sx={{ width: { xs: '100%', sm: FIELD_WIDTH } }}
            onChange={(event) =>
              onSettingsChange(withWhitePoint(settings, Number(event.target.value)))
            }
          />
        </Stack>

        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={previewEnabled}
              onChange={(event) => onPreviewChange(event.target.checked)}
            />
          }
          label="Просмотр на холсте"
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onReset} disabled={busy}>
            Сброс
          </Button>
          <Button onClick={onCancel} disabled={busy}>
            Отмена
          </Button>
          <Button variant="contained" onClick={onApply} disabled={busy}>
            Применить
          </Button>
        </Stack>
      </Stack>
    </ModalDialog>
  );
}
