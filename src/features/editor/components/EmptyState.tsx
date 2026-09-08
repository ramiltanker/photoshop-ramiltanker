import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function EmptyState() {
  return (
    <Stack spacing={1} alignItems="center" color="text.secondary">
      <ImageOutlinedIcon sx={{ fontSize: 64 }} />
      <Typography variant="body1">Откройте изображение или перетащите файл сюда</Typography>
      <Typography variant="caption">Поддерживаются PNG, JPEG и GrayBit-7 (GB7)</Typography>
    </Stack>
  );
}
