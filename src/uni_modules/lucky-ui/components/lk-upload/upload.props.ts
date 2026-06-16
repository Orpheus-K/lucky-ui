import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const UploadStatus = {
  Ready: 'ready',
  Uploading: 'uploading',
  Success: 'success',
  Fail: 'fail',
} as const;

export type UploadStatus = (typeof UploadStatus)[keyof typeof UploadStatus];

export interface UploadFile {
  /** 唯一标识 */
  uid: string;
  /** 文件名 */
  name: string;
  /** 文件大小 (字节) */
  size?: number;
  /** 文件类型 (MIME) */
  type?: string;
  /** 预览地址（本地临时路径或网络地址） */
  url: string;
  /** 缩略图地址 */
  thumb?: string;
  /** 上传状态 */
  status: UploadStatus;
  /** 上传进度 0-100 */
  progress?: number;
  /** 上传失败提示 */
  message?: string;
  /** 服务端响应数据 */
  response?: unknown;
  /** H5 端原始 File 对象 */
  file?: File;
}

export const UploadSourceType = {
  Album: 'album',
  Camera: 'camera',
} as const;

export type UploadSourceType = (typeof UploadSourceType)[keyof typeof UploadSourceType];

export const UploadAccept = {
  Image: 'image',
  Video: 'video',
  All: 'all',
} as const;

export type UploadAccept = (typeof UploadAccept)[keyof typeof UploadAccept];

export type BeforeReadFn = (
  file: UploadFile | UploadFile[],
  detail: { index: number }
) => boolean | Promise<boolean>;

export type AfterReadFn = (file: UploadFile | UploadFile[], detail: { index: number }) => void;

export type BeforeDeleteFn = (
  file: UploadFile,
  detail: { index: number }
) => boolean | Promise<boolean>;

/** 自定义上传函数签名（可用于接入 Request 等外部请求工具） */
export type CustomRequestFn = (options: {
  file: UploadFile;
  action: string;
  name: string;
  headers: Record<string, string>;
  data: Record<string, unknown>;
  onProgress: (progress: number) => void;
  onSuccess: (response: unknown) => void;
  onFail: (error: unknown) => void;
}) => void;

export const uploadProps = {
  ...baseProps,

  /** v-model 绑定的文件列表 */
  modelValue: {
    type: Array as PropType<UploadFile[]>,
    default: () => [],
  },

  /** 上传服务器地址，传入后自动执行上传 */
  action: LkProp.string(''),

  /** 上传请求 header */
  headers: {
    type: Object as PropType<Record<string, string>>,
    default: () => ({}),
  },

  /** 上传附带数据 */
  data: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({}),
  },

  /** 上传文件字段名 */
  name: LkProp.string('file'),

  /** 接受的文件类型 */
  accept: LkProp.enum(Object.values(UploadAccept), UploadAccept.Image, 'Upload.accept'),

  /** H5 端 input accept 属性（精确 MIME 类型） */
  inputAccept: LkProp.string('image/*'),

  /** 是否支持多选 */
  multiple: LkProp.boolean(true),

  /** 最大文件数量 */
  maxCount: LkProp.number(9),

  /** 单个文件最大体积，单位 byte */
  maxSize: LkProp.number(10 * 1024 * 1024),

  /** 是否禁用 */
  disabled: LkProp.boolean(false),

  /** 预览图片尺寸 */
  previewSize: LkProp.stringNumber('var(--lk-rpx-180)'),

  /** 是否可删除 */
  deletable: LkProp.boolean(true),

  /** 是否可预览 */
  previewImage: LkProp.boolean(true),

  /** 是否展示上传区域 */
  showUpload: LkProp.boolean(true),

  /** 图片尺寸类型 (小程序) */
  sizeType: {
    type: Array as PropType<string[]>,
    default: () => ['original', 'compressed'],
  },

  /** 文件来源 (小程序) */
  sourceType: {
    type: Array as PropType<UploadSourceType[]>,
    default: () => [UploadSourceType.Album, UploadSourceType.Camera],
  },

  /** 上传按钮文字 */
  uploadText: LkProp.string(''),

  /** 上传按钮图标 */
  uploadIcon: LkProp.string('plus'),

  /** 选中文件前的钩子 */
  beforeRead: {
    type: Function as PropType<BeforeReadFn>,
    default: undefined,
  },

  /** 选中文件后的回调 */
  afterRead: {
    type: Function as PropType<AfterReadFn>,
    default: undefined,
  },

  /** 删除前的钩子 */
  beforeDelete: {
    type: Function as PropType<BeforeDeleteFn>,
    default: undefined,
  },

  /** 自定义上传函数，传入后替代内置 uni.uploadFile 逻辑 */
  customRequest: {
    type: Function as PropType<CustomRequestFn>,
    default: undefined,
  },

  /** 是否在上传完成后自动移除失败项 */
  autoRemoveFail: LkProp.boolean(false),

  /** 图片填充模式 */
  imageFit: LkProp.string('aspectFill'),
} as const;

export type UploadProps = ExtractPropTypes<typeof uploadProps>;

export const uploadEmits = {
  /** v-model 更新 */
  'update:modelValue': (_val: UploadFile[]) => true,
  /** 文件列表变化 */
  change: (_val: UploadFile[]) => true,
  /** 文件读取完毕（选择后） */
  afterRead: (_file: UploadFile | UploadFile[], _detail: { index: number }) => true,
  /** 文件超出大小限制 */
  oversize: (_file: UploadFile | UploadFile[]) => true,
  /** 文件数量超出限制 */
  overcount: (_detail: { maxCount: number; currentCount: number }) => true,
  /** 删除文件 */
  delete: (_file: UploadFile, _detail: { index: number }) => true,
  /** 清空文件 */
  clear: () => true,
  /** 点击预览 */
  clickPreview: (_file: UploadFile, _detail: { index: number }) => true,
  /** 点击上传区域 */
  clickUpload: (_e: unknown) => true,
  /** 重新上传 */
  retry: (_file: UploadFile, _detail: { index: number }) => true,
  /** 上传进度 */
  progress: (_file: UploadFile, _detail: { progress: number }) => true,
  /** 单个文件上传成功 */
  success: (_file: UploadFile, _detail: { response: unknown }) => true,
  /** 单个文件上传失败 */
  fail: (_file: UploadFile, _detail: { error: unknown }) => true,
};
