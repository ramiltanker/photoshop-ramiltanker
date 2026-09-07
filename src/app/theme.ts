import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565c0' },
    secondary: { main: '#6a1b9a' },
    background: { default: '#f4f6f8' },
  },
  typography: {
    fontFamily: ['Roboto', 'Segoe UI', 'Arial', 'sans-serif'].join(','),
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
});
