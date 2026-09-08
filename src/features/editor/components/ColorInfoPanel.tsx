import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { PixelSample } from '@/core/image/color/samplePixel';

const LAB_PRECISION = 2;

type ColorInfoPanelProps = {
  sample: PixelSample | null;
  active: boolean;
};

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" fontWeight={600} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

export function ColorInfoPanel({ sample, active }: ColorInfoPanelProps) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Пипетка</Typography>

      {!sample ? (
        <Typography variant="caption" color="text.secondary">
          {active
            ? 'Кликните по изображению, чтобы считать цвет пикселя.'
            : 'Включите пипетку в панели инструментов.'}
        </Typography>
      ) : (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                backgroundColor: `rgb(${sample.red}, ${sample.green}, ${sample.blue})`,
              }}
            />
            <Stack sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600}>
                X: {sample.x}, Y: {sample.y}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                координаты в пикселях изображения
              </Typography>
            </Stack>
          </Stack>

          <Divider />

          <InfoRow label="R" value={String(sample.red)} />
          <InfoRow label="G" value={String(sample.green)} />
          <InfoRow label="B" value={String(sample.blue)} />
          <InfoRow label="Альфа" value={String(sample.alpha)} />

          <Divider />

          <InfoRow label="L*" value={sample.lab.l.toFixed(LAB_PRECISION)} />
          <InfoRow label="a*" value={sample.lab.a.toFixed(LAB_PRECISION)} />
          <InfoRow label="b*" value={sample.lab.b.toFixed(LAB_PRECISION)} />

          <Typography variant="caption" color="text.secondary">
            Значения считываются из исходного изображения, независимо от включённых каналов.
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
