import { MAX_LEVEL } from '../histogram/computeHistogram';
import type { ColorModel } from '../types';

export type LevelsTarget = 'master' | 'red' | 'green' | 'blue' | 'alpha';

export type LevelsSettings = {
  black: number;
  gamma: number;
  white: number;
};

export type LevelsState = Record<LevelsTarget, LevelsSettings>;

export const MIN_GAMMA = 0.1;

export const MAX_GAMMA = 9.9;

export const NEUTRAL_GAMMA = 1;

const MIDPOINT = 0.5;

export const DEFAULT_SETTINGS: LevelsSettings = {
  black: 0,
  gamma: NEUTRAL_GAMMA,
  white: MAX_LEVEL,
};

export function createDefaultState(): LevelsState {
  return {
    master: { ...DEFAULT_SETTINGS },
    red: { ...DEFAULT_SETTINGS },
    green: { ...DEFAULT_SETTINGS },
    blue: { ...DEFAULT_SETTINGS },
    alpha: { ...DEFAULT_SETTINGS },
  };
}

export function isNeutral(settings: LevelsSettings): boolean {
  return (
    settings.black === DEFAULT_SETTINGS.black &&
    settings.white === DEFAULT_SETTINGS.white &&
    settings.gamma === DEFAULT_SETTINGS.gamma
  );
}

export function isStateNeutral(state: LevelsState): boolean {
  return Object.values(state).every(isNeutral);
}

export function clampGamma(gamma: number): number {
  return Math.min(MAX_GAMMA, Math.max(MIN_GAMMA, gamma));
}

export function gammaToPosition(settings: LevelsSettings): number {
  return settings.black + (settings.white - settings.black) * Math.pow(MIDPOINT, settings.gamma);
}

export function positionToGamma(settings: LevelsSettings, position: number): number {
  const span = settings.white - settings.black;

  if (span <= 0) {
    return NEUTRAL_GAMMA;
  }

  const ratio = Math.min(1, Math.max(0, (position - settings.black) / span));
  const guarded = Math.min(1 - Number.EPSILON, Math.max(Number.EPSILON, ratio));

  return clampGamma(Math.log(guarded) / Math.log(MIDPOINT));
}

export function withBlackPoint(settings: LevelsSettings, value: number): LevelsSettings {
  return { ...settings, black: Math.min(Math.max(0, Math.round(value)), settings.white - 1) };
}

export function withWhitePoint(settings: LevelsSettings, value: number): LevelsSettings {
  return {
    ...settings,
    white: Math.max(Math.min(MAX_LEVEL, Math.round(value)), settings.black + 1),
  };
}

export function buildTargets(colorModel: ColorModel, hasAlpha: boolean): LevelsTarget[] {
  const targets: LevelsTarget[] =
    colorModel === 'grayscale' ? ['master'] : ['master', 'red', 'green', 'blue'];

  return hasAlpha ? [...targets, 'alpha'] : targets;
}
