import { UploadStatus, type UploadFile } from './upload.props';

export type UploadUidFactory = () => string;
export type UploadObjectUrlFactory = (file: File) => string;

export interface MpImageTempFile {
  path?: string;
  size?: number;
  name?: string;
  type?: string;
}

export interface MpVideoTempFile {
  tempFilePath?: string;
  size?: number;
  name?: string;
  type?: string;
}

/** 是否为图片 url */
export function isImageUrl(url: string): boolean {
  if (!url) return false;
  return (
    /\.(png|jpe?g|gif|svg|webp|bmp|ico)(\?.*)?$/i.test(url) ||
    url.startsWith('blob:') ||
    url.startsWith('data:image') ||
    url.startsWith('wxfile://') ||
    url.startsWith('http://tmp')
  );
}

export function getUploadFileName(path: string, fallback: string): string {
  const normalized = path.split('?')[0]?.split('#')[0] || '';
  const name = normalized.split('/').filter(Boolean).pop();
  return name || fallback;
}

export function createH5UploadFiles(
  rawFiles: File[],
  remainCount: number,
  createUid: UploadUidFactory,
  createObjectUrl: UploadObjectUrlFactory = URL.createObjectURL
): UploadFile[] {
  return rawFiles.slice(0, Math.max(0, remainCount)).map(file => ({
    uid: createUid(),
    name: file.name,
    url: createObjectUrl(file),
    size: file.size,
    type: file.type,
    status: UploadStatus.Ready,
    file,
  }));
}

export function createMpImageUploadFiles(
  paths: string[],
  tempFiles: MpImageTempFile[],
  createUid: UploadUidFactory
): UploadFile[] {
  return paths.map((path, index) => {
    const info = tempFiles[index];
    return {
      uid: createUid(),
      name: info?.name || getUploadFileName(path, `image_${index}`),
      url: path,
      size: info?.size,
      type: info?.type || 'image/*',
      status: UploadStatus.Ready,
    };
  });
}

export function createMpVideoUploadFile(
  result: MpVideoTempFile,
  createUid: UploadUidFactory
): UploadFile {
  const path = result.tempFilePath || '';
  return {
    uid: createUid(),
    name: result.name || getUploadFileName(path, 'video'),
    url: path,
    size: result.size,
    type: result.type || 'video/*',
    status: UploadStatus.Ready,
  };
}
