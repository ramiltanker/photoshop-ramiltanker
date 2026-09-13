import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { ChannelDescriptor, ChannelId } from '@/core/image/channels/channelModel';
import type { KernelPresetId } from '@/core/image/filters/kernel';
import { KERNEL_PRESETS } from '@/core/image/filters/kernel';
import type { EdgeMode } from '@/core/image/filters/padding';
import { ModalDialog } from '@/shared/components/ModalDialog';
import type { KernelValidation } from '../model/kernelForm';
import { detectPreset, formatKernelSum } from '../model/kernelForm';
import { KernelGrid } from './KernelGrid';

const DIALOG_WIDTH = 480;
const CUSTOM_PRESET = 'custom';

const EDGE_MODE_LABELS: Record<EdgeMode, string> = {
  black: 'Чёрный',
  white: 'Белый',
  replicate: 'Копирование края',
};

type FilterDialogProps = {
  open: boolean;
  cells: string[];
  validation: KernelValidation;
  availableChannels: ChannelDescriptor[];
  channels: ChannelId[];
  edgeMode: EdgeMode;
  previewEnabled: boolean;
  busy: boolean;
  onPresetChange: (id: KernelPresetId) => void;
  onCellChange: (index: number, value: string) => void;
  onChannelToggle: (id: ChannelId) => void;
  onAllChannelsChange: (enabled: boolean) => void;
  onEdgeModeChange: (mode: EdgeMode) => void;
  onPreviewChange: (enabled: boolean) => void;
  onReset: () => void;
  onClose: () => void;
  onApply: () => void;
};

export function FilterDialog({
  open,
  cells,
  validation,
  availableChannels,
  channels,
  edgeMode,
  previewEnabled,
  busy,
  onPresetChange,
  onCellChange,
  onChannelToggle,
  onAllChannelsChange,
  onEdgeModeChange,
  onPreviewChange,
  onReset,
  onClose,
  onApply,
}: FilterDialogProps) {
  const preset = detectPreset(validation.kernel);
  const allSelected = availableChannels.every((channel) => channels.includes(channel.id));
  const noneSelected = channels.length === 0;
  const canApply = validation.kernel !== null && !noneSelected && !busy;

  return (
    <ModalDialog open={open} onClose={onClose} width={DIALOG_WIDTH}>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="h6" component="h2">
          Фильтр свёртки
        </Typography>

        <TextField
          select
          size="small"
          label="Преднастроенное ядро"
          value={preset ?? CUSTOM_PRESET}
          onChange={(event) => {
            if (event.target.value !== CUSTOM_PRESET) {
              onPresetChange(event.target.value as KernelPresetId);
            }
          }}
          slotProps={{ select: { MenuProps: { disablePortal: true } } }}
        >
          {KERNEL_PRESETS.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.label}
            </MenuItem>
          ))}
          <MenuItem value={CUSTOM_PRESET} disabled>
            Пользовательское ядро
          </MenuItem>
        </TextField>

        <KernelGrid cells={cells} invalidCells={validation.invalidCells} onChange={onCellChange} />

        {validation.kernel ? (
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Сумма коэффициентов: {formatKernelSum(validation.kernel)}. Можно вводить дроби, например
            1/9.
          </Typography>
        ) : (
          <Alert severity="error">{validation.message}</Alert>
        )}

        <FormControl component="fieldset">
          <FormLabel component="legend">Каналы</FormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={!allSelected && !noneSelected}
                  onChange={(event) => onAllChannelsChange(event.target.checked)}
                />
              }
              label="Все"
            />
            {availableChannels.map((channel) => (
              <FormControlLabel
                key={channel.id}
                control={
                  <Checkbox
                    size="small"
                    checked={channels.includes(channel.id)}
                    onChange={() => onChannelToggle(channel.id)}
                  />
                }
                label={channel.label}
              />
            ))}
          </FormGroup>
          {noneSelected && (
            <Typography variant="caption" color="error">
              Выберите хотя бы один канал
            </Typography>
          )}
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend">Обработка края</FormLabel>
          <RadioGroup
            row
            value={edgeMode}
            onChange={(event) => onEdgeModeChange(event.target.value as EdgeMode)}
          >
            {(Object.keys(EDGE_MODE_LABELS) as EdgeMode[]).map((mode) => (
              <FormControlLabel
                key={mode}
                value={mode}
                control={<Radio size="small" />}
                label={EDGE_MODE_LABELS[mode]}
              />
            ))}
          </RadioGroup>
        </FormControl>

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
            Сбросить
          </Button>
          <Button onClick={onClose} disabled={busy}>
            Закрыть
          </Button>
          <Button variant="contained" onClick={onApply} disabled={!canApply}>
            Применить
          </Button>
        </Stack>
      </Stack>
    </ModalDialog>
  );
}
