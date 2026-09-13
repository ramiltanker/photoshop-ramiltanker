import type { InterpolationMethod } from '@/core/image/interpolation/types';
import type { RasterImage } from '@/core/image/types';

export type ResizeUnit = 'pixels' | 'percent';

export type ResizeForm = {
  unit: ResizeUnit;
  width: string;
  height: string;
  keepRatio: boolean;
  method: InterpolationMethod;
};

export type ResizeValidation = {
  width: number;
  height: number;
  widthError: string | null;
  heightError: string | null;
  totalError: string | null;
  valid: boolean;
};

export const MIN_DIMENSION = 1;

export const MAX_DIMENSION = 10000;

export const MAX_TOTAL_PIXELS = 50_000_000;

const PERCENT = 100;
const MEGAPIXEL = 1_000_000;

export function parseNumber(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  const value = Number(normalized);

  return normalized !== '' && Number.isFinite(value) ? value : null;
}

export function toPixels(value: number, base: number, unit: ResizeUnit): number {
  return Math.round(unit === 'percent' ? (base * value) / PERCENT : value);
}

export function fromPixels(pixels: number, base: number, unit: ResizeUnit): number {
  return unit === 'percent' ? (pixels / base) * PERCENT : pixels;
}

function formatValue(value: number, unit: ResizeUnit): string {
  return unit === 'percent' ? String(Math.round(value * 10) / 10) : String(Math.round(value));
}

function describeError(raw: number | null, pixels: number, unit: ResizeUnit): string | null {
  if (raw === null) {
    return 'Введите число';
  }

  if (raw <= 0) {
    return 'Значение должно быть больше нуля';
  }

  if (unit === 'pixels' && !Number.isInteger(raw)) {
    return 'Размер в пикселях должен быть целым числом';
  }

  if (pixels < MIN_DIMENSION) {
    return `Результат меньше ${MIN_DIMENSION} пикселя`;
  }

  if (pixels > MAX_DIMENSION) {
    return `Не больше ${MAX_DIMENSION} пикселей по стороне`;
  }

  return null;
}

export function validateResize(source: RasterImage, form: ResizeForm): ResizeValidation {
  const rawWidth = parseNumber(form.width);
  const rawHeight = parseNumber(form.height);
  const width = rawWidth === null ? 0 : toPixels(rawWidth, source.width, form.unit);
  const height = rawHeight === null ? 0 : toPixels(rawHeight, source.height, form.unit);
  const widthError = describeError(rawWidth, width, form.unit);
  const heightError = describeError(rawHeight, height, form.unit);
  const totalError =
    !widthError && !heightError && width * height > MAX_TOTAL_PIXELS
      ? `Слишком большое изображение: не больше ${MAX_TOTAL_PIXELS / MEGAPIXEL} мегапикселей`
      : null;

  return {
    width,
    height,
    widthError,
    heightError,
    totalError,
    valid: !widthError && !heightError && !totalError,
  };
}

export function syncLinkedDimension(
  source: RasterImage,
  form: ResizeForm,
  changed: 'width' | 'height'
): ResizeForm {
  if (!form.keepRatio) {
    return form;
  }

  if (form.unit === 'percent') {
    return changed === 'width' ? { ...form, height: form.width } : { ...form, width: form.height };
  }

  const raw = parseNumber(changed === 'width' ? form.width : form.height);

  if (raw === null) {
    return form;
  }

  if (changed === 'width') {
    const height = Math.max(MIN_DIMENSION, Math.round((raw * source.height) / source.width));

    return { ...form, height: formatValue(height, form.unit) };
  }

  const width = Math.max(MIN_DIMENSION, Math.round((raw * source.width) / source.height));

  return { ...form, width: formatValue(width, form.unit) };
}

export function createResizeForm(unit: ResizeUnit, method: InterpolationMethod): ResizeForm {
  return {
    unit,
    width: unit === 'percent' ? '100' : '',
    height: unit === 'percent' ? '100' : '',
    keepRatio: true,
    method,
  };
}

export function convertFormUnit(
  source: RasterImage,
  form: ResizeForm,
  unit: ResizeUnit
): ResizeForm {
  const validation = validateResize(source, form);

  if (!validation.valid) {
    return { ...createResizeForm(unit, form.method), keepRatio: form.keepRatio };
  }

  return {
    ...form,
    unit,
    width: formatValue(fromPixels(validation.width, source.width, unit), unit),
    height: formatValue(fromPixels(validation.height, source.height, unit), unit),
  };
}

export function formatMegapixels(width: number, height: number): string {
  return `${((width * height) / MEGAPIXEL).toFixed(2)} Мп`;
}
