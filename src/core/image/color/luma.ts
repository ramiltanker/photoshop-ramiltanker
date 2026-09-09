const RED_LUMA_WEIGHT = 0.299;
const GREEN_LUMA_WEIGHT = 0.587;
const BLUE_LUMA_WEIGHT = 0.114;

export function toLuma(red: number, green: number, blue: number): number {
  return red * RED_LUMA_WEIGHT + green * GREEN_LUMA_WEIGHT + blue * BLUE_LUMA_WEIGHT;
}
