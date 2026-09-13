import { useRef } from 'react';
import type { ChangeEvent } from 'react';

import ColorizeIcon from '@mui/icons-material/Colorize';
import DownloadIcon from '@mui/icons-material/Download';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PhotoSizeSelectLargeIcon from '@mui/icons-material/PhotoSizeSelectLarge';
import TuneIcon from '@mui/icons-material/Tune';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import type { EditorTool } from '../model/tools';

const ACCEPTED_FILES = '.png,.jpg,.jpeg,.gb7';

type EditorToolbarProps = {
  canSave: boolean;
  busy: boolean;
  tool: EditorTool;
  onOpenFile: (file: File) => void;
  onSaveClick: () => void;
  onLevelsClick: () => void;
  onResizeClick: () => void;
  onToolChange: (tool: EditorTool) => void;
};

export function EditorToolbar({
  canSave,
  busy,
  tool,
  onOpenFile,
  onSaveClick,
  onLevelsClick,
  onResizeClick,
  onToolChange,
}: EditorToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      onOpenFile(file);
    }

    event.target.value = '';
  };

  return (
    <AppBar position="static" color="default" elevation={0} variant="outlined">
      <Toolbar variant="dense" sx={{ gap: 2 }}>
        <Typography
          variant="subtitle1"
          component="h1"
          fontWeight={600}
          noWrap
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          Редактор изображений
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            startIcon={<FolderOpenIcon />}
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            Открыть
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            disabled={!canSave || busy}
            onClick={onSaveClick}
          >
            Сохранить
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<TuneIcon />}
            disabled={!canSave || busy}
            onClick={onLevelsClick}
          >
            Уровни
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PhotoSizeSelectLargeIcon />}
            disabled={!canSave || busy}
            onClick={onResizeClick}
          >
            Размер
          </Button>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title="Пипетка: считать цвет пикселя">
          <span>
            <ToggleButton
              value="eyedropper"
              size="small"
              selected={tool === 'eyedropper'}
              disabled={!canSave || busy}
              onChange={() => onToolChange(tool === 'eyedropper' ? 'none' : 'eyedropper')}
            >
              <ColorizeIcon fontSize="small" />
            </ToggleButton>
          </span>
        </Tooltip>

        <input ref={inputRef} type="file" accept={ACCEPTED_FILES} hidden onChange={handleChange} />
      </Toolbar>
    </AppBar>
  );
}
