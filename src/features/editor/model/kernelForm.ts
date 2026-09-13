import type { Kernel, KernelPresetId } from '@/core/image/filters/kernel';
import { KERNEL_CELLS, KERNEL_PRESETS, KERNEL_SIZE } from '@/core/image/filters/kernel';

export const MAX_KERNEL_VALUE = 1000;

const FRACTION_PATTERN = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/;
const COMPARISON_EPSILON = 1e-9;
const SUM_PRECISION = 4;

export type KernelValidation = {
  kernel: Kernel | null;
  invalidCells: boolean[];
  message: string | null;
};

export function parseKernelCell(raw: string): number | null {
  const normalized = raw.trim().replace(/,/g, '.');

  if (normalized === '') {
    return null;
  }

  const fraction = FRACTION_PATTERN.exec(normalized);

  if (fraction) {
    const denominator = Number(fraction[2]);

    return denominator === 0 ? null : Number(fraction[1]) / denominator;
  }

  const value = Number(normalized);

  return Number.isFinite(value) ? value : null;
}

function describeCell(index: number): string {
  const row = Math.floor(index / KERNEL_SIZE) + 1;
  const column = (index % KERNEL_SIZE) + 1;

  return `строка ${row}, столбец ${column}`;
}

export function validateKernel(cells: string[]): KernelValidation {
  const values = cells.map(parseKernelCell);
  const invalidCells = values.map((value) => value === null || Math.abs(value) > MAX_KERNEL_VALUE);
  const firstInvalid = invalidCells.indexOf(true);

  if (firstInvalid === -1) {
    return { kernel: values as Kernel, invalidCells, message: null };
  }

  const reason =
    values[firstInvalid] === null
      ? 'введите число или дробь вида 1/9'
      : `значение по модулю не больше ${MAX_KERNEL_VALUE}`;

  return {
    kernel: null,
    invalidCells,
    message: `Ячейка (${describeCell(firstInvalid)}): ${reason}`,
  };
}

function sameKernel(first: Kernel, second: Kernel): boolean {
  return first.every((value, index) => Math.abs(value - second[index]) < COMPARISON_EPSILON);
}

export function detectPreset(kernel: Kernel | null): KernelPresetId | null {
  if (!kernel) {
    return null;
  }

  const preset = KERNEL_PRESETS.find((item) => {
    const presetKernel = validateKernel(item.cells).kernel;

    return presetKernel !== null && sameKernel(presetKernel, kernel);
  });

  return preset ? preset.id : null;
}

export function isIdentityKernel(kernel: Kernel): boolean {
  return detectPreset(kernel) === 'identity';
}

export function formatKernelSum(kernel: Kernel): string {
  const sum = kernel.reduce((total, value) => total + value, 0);

  return String(Number(sum.toFixed(SUM_PRECISION)));
}

export function createEmptyCells(): string[] {
  return Array.from({ length: KERNEL_CELLS }, () => '0');
}
