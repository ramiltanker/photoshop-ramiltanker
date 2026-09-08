const SRGB_LINEAR_THRESHOLD = 0.04045;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_GAMMA_OFFSET = 0.055;
const SRGB_GAMMA_SCALE = 1.055;
const SRGB_GAMMA_EXPONENT = 2.4;

const WHITE_POINT_X = 0.95047;
const WHITE_POINT_Y = 1;
const WHITE_POINT_Z = 1.08883;

const LAB_EPSILON = 216 / 24389;
const LAB_KAPPA = 24389 / 27;
const DARK_LIGHTNESS_LIMIT = 50;

export type XyzColor = {
  x: number;
  y: number;
  z: number;
};

export type LabColor = {
  l: number;
  a: number;
  b: number;
};

function toLinear(value: number): number {
  const normalized = value / 255;

  if (normalized <= SRGB_LINEAR_THRESHOLD) {
    return normalized / SRGB_LINEAR_DIVISOR;
  }

  return Math.pow((normalized + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_SCALE, SRGB_GAMMA_EXPONENT);
}

export function rgbToXyz(red: number, green: number, blue: number): XyzColor {
  const linearRed = toLinear(red);
  const linearGreen = toLinear(green);
  const linearBlue = toLinear(blue);

  return {
    x: linearRed * 0.4124564 + linearGreen * 0.3575761 + linearBlue * 0.1804375,
    y: linearRed * 0.2126729 + linearGreen * 0.7151522 + linearBlue * 0.072175,
    z: linearRed * 0.0193339 + linearGreen * 0.119192 + linearBlue * 0.9503041,
  };
}

function pivot(value: number): number {
  if (value > LAB_EPSILON) {
    return Math.cbrt(value);
  }

  return (LAB_KAPPA * value + 16) / 116;
}

export function xyzToLab(color: XyzColor): LabColor {
  const fx = pivot(color.x / WHITE_POINT_X);
  const fy = pivot(color.y / WHITE_POINT_Y);
  const fz = pivot(color.z / WHITE_POINT_Z);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function rgbToLab(red: number, green: number, blue: number): LabColor {
  return xyzToLab(rgbToXyz(red, green, blue));
}

export function isDarkColor(color: LabColor): boolean {
  return color.l < DARK_LIGHTNESS_LIMIT;
}
