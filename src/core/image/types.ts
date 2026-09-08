export type ImageFormat = 'png' | 'jpeg' | 'gb7';

export type ColorDepth = {
  bitsPerPixel: number;
  description: string;
};

export type RasterImage = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

export type ImageMetadata = {
  format: ImageFormat;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  colorDepth: ColorDepth;
  hasAlpha: boolean;
};

export type ImageDocument = {
  image: RasterImage;
  metadata: ImageMetadata;
};

export type ProgressHandler = (progress: number) => void;
