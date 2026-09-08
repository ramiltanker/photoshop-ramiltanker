import { useRef } from 'react';
import type { ChangeEvent } from 'react';

import DownloadIcon from '@mui/icons-material/Download';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const ACCEPTED_FILES = '.png,.jpg,.jpeg,.gb7';

type EditorToolbarProps = {
  canSave: boolean;
  busy: boolean;
  onOpenFile: (file: File) => void;
  onSaveClick: () => void;
};

export function EditorToolbar({ canSave, busy, onOpenFile, onSaveClick }: EditorToolbarProps) {
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
          sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
        >
          Редактор изображений
        </Typography>
        <Box sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }} />
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
        </Stack>
        <input ref={inputRef} type="file" accept={ACCEPTED_FILES} hidden onChange={handleChange} />
      </Toolbar>
    </AppBar>
  );
}
