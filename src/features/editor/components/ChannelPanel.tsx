import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type {
  ChannelDescriptor,
  ChannelId,
  ChannelSelection,
} from '@/core/image/channels/channelModel';
import type { ChannelPreview } from '@/core/image/channels/channelPreview';
import { ChannelThumbnail } from './ChannelThumbnail';

type ChannelPanelProps = {
  channels: ChannelDescriptor[];
  selection: ChannelSelection;
  previews: ChannelPreview[];
  onToggle: (id: ChannelId) => void;
  onReset: () => void;
};

export function ChannelPanel({
  channels,
  selection,
  previews,
  onToggle,
  onReset,
}: ChannelPanelProps) {
  const allEnabled = channels.every((channel) => selection[channel.id]);

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">Каналы</Typography>
        <Button size="small" onClick={onReset} disabled={allEnabled}>
          Показать все
        </Button>
      </Stack>

      <Stack spacing={1}>
        {channels.map((channel) => {
          const preview = previews.find((item) => item.id === channel.id);
          const enabled = selection[channel.id];

          return (
            <Stack
              key={channel.id}
              direction="row"
              spacing={1.5}
              alignItems="center"
              onClick={() => onToggle(channel.id)}
              sx={{
                p: 0.75,
                borderRadius: 1,
                border: 1,
                borderColor: enabled ? 'primary.main' : 'divider',
                backgroundColor: enabled ? 'action.selected' : 'transparent',
                cursor: 'pointer',
                userSelect: 'none',
                '&:hover': { borderColor: 'primary.light' },
              }}
            >
              {preview ? <ChannelThumbnail image={preview.image} dimmed={!enabled} /> : null}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {channel.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {channel.shortLabel} · {enabled ? 'виден' : 'скрыт'}
                </Typography>
              </Box>
              {enabled ? (
                <VisibilityIcon fontSize="small" color="primary" />
              ) : (
                <VisibilityOffIcon fontSize="small" color="disabled" />
              )}
            </Stack>
          );
        })}
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Каналы показаны в градациях серого: белый — максимум интенсивности, чёрный — отсутствие.
      </Typography>
    </Stack>
  );
}
