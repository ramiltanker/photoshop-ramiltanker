import type { ImageFormat } from '../types';
import { isGb7Signature } from './gb7/header';
import { isJpegSignature } from './jpeg/metadata';
import { isPngSignature } from './png/metadata';

export function detectFormat(bytes: Uint8Array): ImageFormat | null {
  if (isPngSignature(bytes)) {
    return 'png';
  }

  if (isJpegSignature(bytes)) {
    return 'jpeg';
  }

  if (isGb7Signature(bytes)) {
    return 'gb7';
  }

  return null;
}
