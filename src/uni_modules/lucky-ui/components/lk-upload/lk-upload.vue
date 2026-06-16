<script setup lang="ts">
import { computed, ref, watch, type StyleValue } from 'vue';
import { addUnit } from '@/uni_modules/lucky-ui/core/src/utils/unit';
import { useLocale } from '../../composables/useLocale';
import { uploadProps, uploadEmits, UploadStatus, type UploadFile } from './upload.props';
import {
  createH5UploadFiles,
  createMpImageUploadFiles,
  createMpVideoUploadFile,
  isImageUrl,
} from './upload.utils';

defineOptions({ name: 'LkUpload' });

const props = defineProps(uploadProps);
const emit = defineEmits(uploadEmits);
const { t } = useLocale('upload');

const fileList = ref<UploadFile[]>([...props.modelValue]);

watch(
  () => props.modelValue,
  v => {
    fileList.value = [...v];
  }
);

const deleteConfirmVisible = ref(false);
const pendingDeleteIndex = ref(-1);

let _uid = 0;
function genUid(): string {
  return `lk-upload-${Date.now()}-${++_uid}`;
}

/** 剩余可选数量 */
const remainCount = computed(() => Math.max(0, props.maxCount - fileList.value.length));

/** 是否显示上传按钮 */
const showAddBtn = computed(
  () => props.showUpload && fileList.value.length < props.maxCount && !props.disabled
);
const resolvedUploadText = computed(() => props.uploadText || t('upload'));
const uploadFailedText = computed(() => t('failed'));

const rootClass = computed(() => [
  'lk-upload',
  props.customClass,
  {
    'is-disabled': props.disabled,
  },
]);

const rootStyle = computed<StyleValue>(() => [
  props.customStyle as StyleValue,
  {
    '--lk-upload-preview-size': addUnit(props.previewSize),
  },
]);

function getItemClass(file: UploadFile) {
  const isImage = isImageUrl(file.url);
  return [
    'lk-upload__item',
    `is-${file.status}`,
    {
      'is-image': isImage,
      'is-file': !isImage,
    },
  ];
}

function syncModel(list: UploadFile[]) {
  fileList.value = list;
  emit('update:modelValue', [...list]);
  emit('change', [...list]);
}

async function onSelect(e?: Event) {
  if (props.disabled) return;
  if (remainCount.value <= 0) {
    emit('overcount', { maxCount: props.maxCount, currentCount: fileList.value.length });
    return;
  }
  emit('clickUpload', e);

  // #ifdef MP || APP-PLUS
  chooseFileMp();
  // #endif
  // #ifdef H5
  chooseFileH5();
  // #endif
}

function chooseFileMp() {
  const count = props.multiple ? remainCount.value : 1;

  if (props.accept === 'video') {
    uni.chooseVideo({
      sourceType: props.sourceType as string[],
      compressed: props.sizeType.includes('compressed'),
      success(res: { tempFilePath: string; size: number; name?: string; type?: string }) {
        handleAfterChoose([createMpVideoUploadFile(res, genUid)]);
      },
    });
    return;
  }

  uni.chooseImage({
    count,
    sizeType: props.sizeType as UniApp.ChooseImageOptions['sizeType'],
    sourceType: props.sourceType as string[],
    success(res: UniApp.ChooseImageSuccessCallbackResult) {
      const paths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [];
      const infos = (res.tempFiles as Array<{ size?: number; name?: string; type?: string }>) || [];
      handleAfterChoose(createMpImageUploadFiles(paths, infos, genUid));
    },
  });
}

// #ifdef H5
function chooseFileH5() {
  const input = document.createElement('input');
  input.type = 'file';
  if (props.inputAccept) input.accept = props.inputAccept;
  if (props.multiple && remainCount.value > 1) input.multiple = true;

  input.onchange = () => {
    const rawFiles = Array.from(input.files || []);
    handleAfterChoose(createH5UploadFiles(rawFiles, remainCount.value, genUid));
  };
  input.click();
}
// #endif

async function handleAfterChoose(items: UploadFile[]) {
  if (!items.length) return;

  const oversized: UploadFile[] = [];
  const valid: UploadFile[] = [];
  for (const f of items) {
    if (f.size && f.size > props.maxSize) {
      oversized.push(f);
    } else {
      valid.push(f);
    }
  }
  if (oversized.length) {
    emit('oversize', oversized.length === 1 ? oversized[0] : oversized);
  }
  if (!valid.length) return;

  if (props.beforeRead) {
    const target = valid.length === 1 ? valid[0] : valid;
    try {
      const pass = await props.beforeRead(target, { index: fileList.value.length });
      if (pass === false) return;
    } catch {
      return;
    }
  }

  const merged = fileList.value.concat(valid).slice(0, props.maxCount);
  syncModel(merged);

  const readTarget = valid.length === 1 ? valid[0] : valid;
  emit('afterRead', readTarget, { index: fileList.value.length - valid.length });

  if (props.afterRead) {
    props.afterRead(readTarget, { index: fileList.value.length - valid.length });
  }

  if (props.action) {
    valid.forEach(f => doUpload(f));
  }
}

function doUpload(file: UploadFile) {
  file.status = UploadStatus.Uploading;
  file.progress = 0;
  file.message = t('uploading');
  syncModel([...fileList.value]);

  if (props.customRequest) {
    props.customRequest({
      file,
      action: props.action,
      name: props.name,
      headers: props.headers,
      data: props.data,
      onProgress(progress: number) {
        file.progress = progress;
        emit('progress', file, { progress });
        syncModel([...fileList.value]);
      },
      onSuccess(response: unknown) {
        file.status = UploadStatus.Success;
        file.progress = 100;
        file.message = '';
        file.response = response;
        syncModel([...fileList.value]);
        emit('success', file, { response });
      },
      onFail(error: unknown) {
        file.status = UploadStatus.Fail;
        file.message = t('failed');
        syncModel([...fileList.value]);
        emit('fail', file, { error });
        if (props.autoRemoveFail) {
          setTimeout(() => removeFile(fileList.value.indexOf(file)), 1500);
        }
      },
    });
    return;
  }

  const uploadTask = uni.uploadFile({
    url: props.action,
    filePath: file.url,
    name: props.name,
    header: props.headers,
    formData: props.data,
    success(res) {
      file.status = UploadStatus.Success;
      file.progress = 100;
      file.message = '';
      file.response = res.data;
      syncModel([...fileList.value]);
      emit('success', file, { response: res.data });
    },
    fail(err) {
      file.status = UploadStatus.Fail;
      file.message = t('failed');
      syncModel([...fileList.value]);
      emit('fail', file, { error: err });

      if (props.autoRemoveFail) {
        setTimeout(() => removeFile(fileList.value.indexOf(file)), 1500);
      }
    },
  });

  if (uploadTask && typeof uploadTask.onProgressUpdate === 'function') {
    uploadTask.onProgressUpdate(res => {
      file.progress = res.progress;
      emit('progress', file, { progress: res.progress });
      syncModel([...fileList.value]);
    });
  }
}

async function removeFile(index: number) {
  if (index < 0 || index >= fileList.value.length) return;
  const file = fileList.value[index];

  if (props.beforeDelete) {
    try {
      const pass = await props.beforeDelete(file, { index });
      if (pass === false) return;
    } catch {
      return;
    }
  }

  doRemove(index);
}

function doRemove(index: number) {
  const file = fileList.value[index];
  if (!file) return;
  const next = [...fileList.value];
  next.splice(index, 1);
  syncModel(next);
  emit('delete', file, { index });
}

/** 内置确认删除（通过 lk-modal） */
function confirmRemove(index: number) {
  pendingDeleteIndex.value = index;
  deleteConfirmVisible.value = true;
}

function onDeleteConfirm() {
  const idx = pendingDeleteIndex.value;
  deleteConfirmVisible.value = false;
  pendingDeleteIndex.value = -1;
  if (idx >= 0) doRemove(idx);
}

function onDeleteCancel() {
  deleteConfirmVisible.value = false;
  pendingDeleteIndex.value = -1;
}

function onPreview(index: number) {
  const file = fileList.value[index];
  emit('clickPreview', file, { index });

  if (!props.previewImage) return;
  if (!isImageUrl(file.url)) return;

  const urls = fileList.value.filter(f => isImageUrl(f.url)).map(f => f.url);
  const current = file.url;

  // #ifdef MP
  uni.previewImage({ current, urls });
  // #endif
  // #ifdef H5
  uni.previewImage({ current, urls });
  // #endif
}

function retryUpload(index: number) {
  const file = fileList.value[index];
  if (file.status !== UploadStatus.Fail) return;
  emit('retry', file, { index });
  doUpload(file);
}

function clearFiles() {
  syncModel([]);
  emit('clear');
}

defineExpose({
  /** 手动选择文件 */
  chooseFile: onSelect,
  /** 重新上传指定文件 */
  retryUpload,
  /** 删除指定文件（直接删除，不弹窗） */
  removeFile,
  /** 确认删除文件（弹出 lk-modal 确认） */
  confirmRemove,
  /** 清空所有文件 */
  clearFiles,
});
</script>

<template>
  <view :id="id" class="lk-upload-wrapper">
    <view :class="rootClass" :style="rootStyle">
      <!-- 已选文件列表 -->
      <view v-for="(f, i) in fileList" :key="f.uid" :class="getItemClass(f)" @tap="onPreview(i)">
        <!-- 预览图 -->
        <image
          v-if="isImageUrl(f.url)"
          :src="f.thumb || f.url"
          :mode="imageFit"
          class="lk-upload__img"
        />
        <view v-else class="lk-upload__file">
          <view class="lk-upload__file-icon">
            <lk-icon name="file-earmark" size="44" />
          </view>
          <text class="lk-upload__file-name">{{ f.name }}</text>
        </view>

        <!-- 上传中遮罩 -->
        <view v-if="f.status === 'uploading'" class="lk-upload__mask">
          <view class="lk-upload__progress">
            <view class="lk-upload__progress-bar" :style="{ width: (f.progress || 0) + '%' }" />
          </view>
          <text class="lk-upload__mask-text">{{ f.progress || 0 }}%</text>
        </view>

        <!-- 上传失败遮罩 -->
        <view
          v-if="f.status === 'fail'"
          class="lk-upload__mask lk-upload__mask--fail"
          @tap.stop="retryUpload(i)"
        >
          <lk-icon name="arrow-clockwise" size="36" color="var(--lk-upload-mask-text)" />
          <text class="lk-upload__mask-text">{{ f.message || uploadFailedText }}</text>
        </view>

        <!-- 删除按钮 -->
        <view
          v-if="deletable && !disabled && f.status !== 'uploading'"
          class="lk-upload__del"
          @tap.stop="removeFile(i)"
        >
          <lk-icon name="x" size="20" color="var(--lk-upload-del-icon-color)" />
        </view>

        <!-- 成功角标 -->
        <view v-if="f.status === 'success'" class="lk-upload__status-icon">
          <lk-icon name="check" size="22" color="var(--lk-upload-status-icon-color)" />
        </view>
      </view>

      <!-- 上传按钮 -->
      <view v-if="showAddBtn" class="lk-upload__add" @tap="onSelect">
        <slot name="trigger">
          <lk-icon :name="uploadIcon" size="44" />
          <text v-if="resolvedUploadText" class="lk-upload__add-text">{{
            resolvedUploadText
          }}</text>
        </slot>
        <text v-if="maxCount < 99" class="lk-upload__count">
          {{ fileList.length }}/{{ maxCount }}
        </text>
      </view>

      <!-- 内置删除确认弹窗 -->
      <lk-modal
        v-model="deleteConfirmVisible"
        :title="t('deleteTitle')"
        @confirm="onDeleteConfirm"
        @cancel="onDeleteCancel"
      >
        <text>{{ t('deleteMessage') }}</text>
      </lk-modal>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-upload.scss';
</style>
