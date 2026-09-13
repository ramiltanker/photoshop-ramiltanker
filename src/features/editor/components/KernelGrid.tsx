import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import { KERNEL_SIZE } from '@/core/image/filters/kernel';

type KernelGridProps = {
  cells: string[];
  invalidCells: boolean[];
  onChange: (index: number, value: string) => void;
};

export function KernelGrid({ cells, invalidCells, onChange }: KernelGridProps) {
  return (
    <Box
      role="group"
      aria-label="Ядро свёртки 3 на 3"
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${KERNEL_SIZE}, 1fr)`,
        gap: 1,
        maxWidth: 300,
        mx: 'auto',
        width: '100%',
      }}
    >
      {cells.map((cell, index) => (
        <TextField
          key={index}
          size="small"
          value={cell}
          error={invalidCells[index]}
          onChange={(event) => onChange(index, event.target.value)}
          slotProps={{
            htmlInput: {
              'aria-label': `Ячейка ${Math.floor(index / KERNEL_SIZE) + 1}, ${(index % KERNEL_SIZE) + 1}`,
              inputMode: 'decimal',
              style: { textAlign: 'center' },
            },
          }}
        />
      ))}
    </Box>
  );
}
