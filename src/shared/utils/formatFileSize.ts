const UNITS = ['Б', 'КБ', 'МБ', 'ГБ'];
const STEP = 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < STEP) {
    return `${bytes} ${UNITS[0]}`;
  }

  let value = bytes;
  let unitIndex = 0;

  while (value >= STEP && unitIndex < UNITS.length - 1) {
    value /= STEP;
    unitIndex += 1;
  }

  return `${value.toFixed(1)} ${UNITS[unitIndex]}`;
}
