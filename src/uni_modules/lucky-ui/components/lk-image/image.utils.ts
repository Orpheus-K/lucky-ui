import type { StyleValue } from 'vue';

export interface ImageState {
  loading: boolean;
  error: boolean;
}

export function createImageInitialState(): ImageState {
  return {
    loading: true,
    error: false,
  };
}

export function resolveImageStateOnSrcChange(): ImageState {
  return createImageInitialState();
}

export function resolveImageStateOnLoad(): ImageState {
  return {
    loading: false,
    error: false,
  };
}

export function resolveImageStateOnError(): ImageState {
  return {
    loading: false,
    error: true,
  };
}

export function resolveImageRootStyle(options: {
  width: string;
  height: string;
  radius: string;
  customStyle: StyleValue;
}): StyleValue {
  return [
    {
      width: options.width,
      height: options.height,
      borderRadius: options.radius,
    },
    options.customStyle,
  ];
}

export function shouldPreviewImage(options: { preview: boolean; src: string }): boolean {
  return options.preview && Boolean(options.src);
}

export function resolveImageClickPayload(options: { src: string; event?: unknown }) {
  return {
    src: options.src,
    event: options.event,
  };
}

export function resolveImagePreviewPayload(options: { src: string; event?: unknown }) {
  return {
    src: options.src,
    urls: [options.src],
    event: options.event,
  };
}
