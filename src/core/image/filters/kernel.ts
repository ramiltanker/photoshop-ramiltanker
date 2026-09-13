export const KERNEL_SIZE = 3;

export const KERNEL_RADIUS = Math.floor(KERNEL_SIZE / 2);

export const KERNEL_CELLS = KERNEL_SIZE * KERNEL_SIZE;

export type Kernel = number[];

export type KernelPresetId = 'identity' | 'sharpen' | 'gaussian' | 'box' | 'prewittX' | 'prewittY';

export type KernelPreset = {
  id: KernelPresetId;
  label: string;
  cells: string[];
};

export const KERNEL_PRESETS: KernelPreset[] = [
  {
    id: 'identity',
    label: 'Тождественное отображение',
    cells: ['0', '0', '0', '0', '1', '0', '0', '0', '0'],
  },
  {
    id: 'sharpen',
    label: 'Повышение резкости',
    cells: ['0', '-1', '0', '-1', '5', '-1', '0', '-1', '0'],
  },
  {
    id: 'gaussian',
    label: 'Фильтр Гаусса 3 × 3',
    cells: ['1/16', '2/16', '1/16', '2/16', '4/16', '2/16', '1/16', '2/16', '1/16'],
  },
  {
    id: 'box',
    label: 'Прямоугольное размытие',
    cells: ['1/9', '1/9', '1/9', '1/9', '1/9', '1/9', '1/9', '1/9', '1/9'],
  },
  {
    id: 'prewittX',
    label: 'Оператор Прюитта, по горизонтали',
    cells: ['-1', '0', '1', '-1', '0', '1', '-1', '0', '1'],
  },
  {
    id: 'prewittY',
    label: 'Оператор Прюитта, по вертикали',
    cells: ['-1', '-1', '-1', '0', '0', '0', '1', '1', '1'],
  },
];

export const DEFAULT_PRESET: KernelPresetId = 'identity';

export function getPreset(id: KernelPresetId): KernelPreset {
  const preset = KERNEL_PRESETS.find((item) => item.id === id);

  if (!preset) {
    throw new Error(`Неизвестное ядро: ${id}`);
  }

  return preset;
}
