import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fromScalePercent, MAX_SCALE, MIN_SCALE, toScalePercent } from '../model/viewport';

const SLIDER_WIDTH = 128;
const PERCENT = 100;

type ScaleControlProps = {
  scale: number;
  onChange: (scale: number) => void;
};

export function ScaleControl({ scale, onChange }: ScaleControlProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="caption" color="text.secondary">
        Масштаб:
      </Typography>
      <Slider
        size="small"
        value={toScalePercent(scale)}
        min={MIN_SCALE * PERCENT}
        max={MAX_SCALE * PERCENT}
        step={1}
        aria-label="Масштаб отображения"
        onChange={(_, value) => onChange(fromScalePercent(value as number))}
        sx={{ width: SLIDER_WIDTH }}
      />
      <Typography variant="caption" fontWeight={600} sx={{ minWidth: 44 }}>
        {toScalePercent(scale)} %
      </Typography>
    </Stack>
  );
}
