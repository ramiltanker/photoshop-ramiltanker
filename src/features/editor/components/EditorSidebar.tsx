import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type {
  ChannelDescriptor,
  ChannelId,
  ChannelSelection,
} from '@/core/image/channels/channelModel';
import type { ChannelPreview } from '@/core/image/channels/channelPreview';
import type { PixelSample } from '@/core/image/color/samplePixel';
import { ChannelPanel } from './ChannelPanel';
import { ColorInfoPanel } from './ColorInfoPanel';

const SIDEBAR_WIDTH = 268;

type EditorSidebarProps = {
  hasImage: boolean;
  channels: ChannelDescriptor[];
  selection: ChannelSelection;
  previews: ChannelPreview[];
  sample: PixelSample | null;
  eyedropperActive: boolean;
  onToggleChannel: (id: ChannelId) => void;
  onResetChannels: () => void;
};

export function EditorSidebar({
  hasImage,
  channels,
  selection,
  previews,
  sample,
  eyedropperActive,
  onToggleChannel,
  onResetChannels,
}: EditorSidebarProps) {
  return (
    <Paper
      square
      variant="outlined"
      sx={{
        width: { xs: '100%', md: SIDEBAR_WIDTH },
        flexShrink: 0,
        borderWidth: { xs: '1px 0 0 0', md: '0 0 0 1px' },
        overflowY: { xs: 'visible', md: 'auto' },
        p: 2,
      }}
    >
      {hasImage ? (
        <Stack spacing={2} divider={<Divider />}>
          <ChannelPanel
            channels={channels}
            selection={selection}
            previews={previews}
            onToggle={onToggleChannel}
            onReset={onResetChannels}
          />
          <ColorInfoPanel sample={sample} active={eyedropperActive} />
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary">
          Панель каналов и пипетка станут доступны после загрузки изображения.
        </Typography>
      )}
    </Paper>
  );
}
