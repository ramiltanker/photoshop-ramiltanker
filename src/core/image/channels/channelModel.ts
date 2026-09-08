import type { ColorModel } from '../types';

export type ChannelId = 'gray' | 'red' | 'green' | 'blue' | 'alpha';

export type ChannelDescriptor = {
  id: ChannelId;
  label: string;
  shortLabel: string;
};

export type ChannelSelection = Record<ChannelId, boolean>;

const GRAY_CHANNEL: ChannelDescriptor = { id: 'gray', label: 'Яркость', shortLabel: 'Y' };

const RGB_CHANNELS: ChannelDescriptor[] = [
  { id: 'red', label: 'Красный', shortLabel: 'R' },
  { id: 'green', label: 'Зелёный', shortLabel: 'G' },
  { id: 'blue', label: 'Синий', shortLabel: 'B' },
];

const ALPHA_CHANNEL: ChannelDescriptor = { id: 'alpha', label: 'Альфа', shortLabel: 'A' };

export function buildChannelModel(colorModel: ColorModel, hasAlpha: boolean): ChannelDescriptor[] {
  const channels = colorModel === 'grayscale' ? [GRAY_CHANNEL] : [...RGB_CHANNELS];

  return hasAlpha ? [...channels, ALPHA_CHANNEL] : channels;
}

export function createFullSelection(channels: ChannelDescriptor[]): ChannelSelection {
  const selection: ChannelSelection = {
    gray: false,
    red: false,
    green: false,
    blue: false,
    alpha: false,
  };

  channels.forEach((channel) => {
    selection[channel.id] = true;
  });

  return selection;
}

export function isColorChannel(id: ChannelId): boolean {
  return id !== 'alpha';
}

export function countEnabledColorChannels(
  channels: ChannelDescriptor[],
  selection: ChannelSelection
): number {
  return channels.filter((channel) => isColorChannel(channel.id) && selection[channel.id]).length;
}
