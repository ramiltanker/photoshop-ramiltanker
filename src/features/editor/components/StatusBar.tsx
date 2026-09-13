import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { ImageMetadata, RasterImage } from '@/core/image/types';
import { formatFileSize } from '@/shared/utils/formatFileSize';
import { ScaleControl } from './ScaleControl';

const FORMAT_LABELS: Record<ImageMetadata['format'], string> = {
  png: 'PNG',
  jpeg: 'JPEG',
  gb7: 'GrayBit-7',
};

type StatusBarProps = {
  metadata: ImageMetadata | null;
  image: RasterImage | null;
  scale: number;
  onScaleChange: (scale: number) => void;
};

type StatusItemProps = {
  label: string;
  value: string;
};

function StatusItem({ label, value }: StatusItemProps) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="baseline">
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" fontWeight={600}>
        {value}
      </Typography>
    </Stack>
  );
}

export function StatusBar({ metadata, image, scale, onScaleChange }: StatusBarProps) {
  return (
    <Paper square variant="outlined" sx={{ px: 2, py: 0.75, borderWidth: '1px 0 0 0' }}>
      {metadata && image ? (
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          flexWrap="wrap"
          divider={<Divider orientation="vertical" flexItem />}
        >
          <StatusItem label="Файл:" value={metadata.fileName} />
          <StatusItem label="Формат:" value={FORMAT_LABELS[metadata.format]} />
          <StatusItem label="Ширина:" value={`${image.width} px`} />
          <StatusItem label="Высота:" value={`${image.height} px`} />
          <StatusItem
            label="Глубина цвета:"
            value={`${metadata.colorDepth.bitsPerPixel} бит/пиксель — ${metadata.colorDepth.description}`}
          />
          <StatusItem label="Размер:" value={formatFileSize(metadata.fileSize)} />
          <ScaleControl scale={scale} onChange={onScaleChange} />
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary">
          Изображение не загружено
        </Typography>
      )}
    </Paper>
  );
}
