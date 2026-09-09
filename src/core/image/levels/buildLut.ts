import { HISTOGRAM_LEVELS, MAX_LEVEL } from '../histogram/computeHistogram';
import type { LevelsSettings, LevelsState } from './levelsSettings';
import { isNeutral } from './levelsSettings';

export type ChannelLuts = {
  red: Uint8ClampedArray;
  green: Uint8ClampedArray;
  blue: Uint8ClampedArray;
  alpha: Uint8ClampedArray;
};

function createIdentityLut(): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(HISTOGRAM_LEVELS);

  for (let level = 0; level < HISTOGRAM_LEVELS; level += 1) {
    lut[level] = level;
  }

  return lut;
}

export function buildLut(settings: LevelsSettings): Uint8ClampedArray {
  if (isNeutral(settings)) {
    return createIdentityLut();
  }

  const lut = new Uint8ClampedArray(HISTOGRAM_LEVELS);
  const span = Math.max(1, settings.white - settings.black);
  const exponent = 1 / settings.gamma;

  for (let level = 0; level < HISTOGRAM_LEVELS; level += 1) {
    const normalized = Math.min(1, Math.max(0, (level - settings.black) / span));

    lut[level] = Math.round(Math.pow(normalized, exponent) * MAX_LEVEL);
  }

  return lut;
}

function combineLuts(first: Uint8ClampedArray, second: Uint8ClampedArray): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(HISTOGRAM_LEVELS);

  for (let level = 0; level < HISTOGRAM_LEVELS; level += 1) {
    lut[level] = second[first[level]];
  }

  return lut;
}

export function buildChannelLuts(state: LevelsState): ChannelLuts {
  const master = buildLut(state.master);

  return {
    red: combineLuts(buildLut(state.red), master),
    green: combineLuts(buildLut(state.green), master),
    blue: combineLuts(buildLut(state.blue), master),
    alpha: buildLut(state.alpha),
  };
}
