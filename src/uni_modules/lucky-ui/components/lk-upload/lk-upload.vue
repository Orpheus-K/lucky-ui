<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type StyleValue } from 'vue';
import { addUnit } from '@/uni_modules/lucky-ui/core/src/utils/unit';
import { useLocale } from '../../composables/useLocale';
import { useFormDisabled } from '../lk-form/useFormField';
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
const formDisabled = useFormDisabled(() => props.disabled);
const isDisabled = formDisabled.disabled;

function cloneUploadFiles(files: readonly UploadFile[]): UploadFile[] {
  return files.map(file => ({ ...file }));
}

const fileList = ref<UploadFile[]>(cloneUploadFiles(props.modelValue));

watch(
  () => props.modelValue,
  v => {
    fileList.value = cloneUploadFiles(v);
    activeUploads.forEach((record, uid) => {
      if (v.some(file => file.uid === uid)) return;
      record.cancelled = true;
      record.abort?.();
      activeUploads.delete(uid);
    });
    failedAttemptTokens.forEach((_token, uid) => {
      const file = v.find(item => item.uid === uid);
      if (!file || file.status !== UploadStatus.Fail) failedAttemptTokens.delete(uid);
    });
  }
);

const deleteConfirmVisible = ref(false);
const pendingDeleteUid = ref<string | null>(null);
let pendingDeleteInteraction: number | null | undefined = null;

type ActiveUpload = {
  interaction?: number;
  file: UploadFile;
  status: UploadFile['status'];
  progress: UploadFile['progress'];
  message: UploadFile['message'];
  response: UploadFile['response'];
  cancelled: boolean;
  stageGeneration: number;
  terminalClaimed: boolean;
  abort?: () => void;
};

const activeUploads = new Map<string, ActiveUpload>();
const autoRemoveTimers = new Set<ReturnType<typeof setTimeout>>();
const failedAttemptTokens = new Map<string, symbol>();

let _uid = 0;
function genUid(): string {
  return `lk-upload-${Date.now()}-${++_uid}`;
}

/** 剩余可选数量 */
const remainCount = computed(() => Math.max(0, props.maxCount - fileList.value.length));

/** 是否显示上传按钮 */
const showAddBtn = computed(
  () => props.showUpload && fileList.value.length < props.maxCount && !isDisabled.value
);
const resolvedUploadText = computed(() => props.uploadText || t('upload'));
const uploadFailedText = computed(() => t('failed'));

const rootClass = computed(() => [
  'lk-upload',
  props.customClass,
  {
    'is-disabled': isDisabled.value,
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

function isInteractionCurrent(interaction?: number): boolean {
  return interaction === undefined || formDisabled.isInteractionCurrent(interaction);
}

function syncModelUpdateOnly(list: UploadFile[]) {
  fileList.value = cloneUploadFiles(list);
  emit('update:modelValue', cloneUploadFiles(fileList.value));
}

function resolveOwnedFiles(uids: readonly string[]): UploadFile[] {
  const byUid = new Map(fileList.value.map(file => [file.uid, file]));
  return uids.map(uid => byUid.get(uid)).filter((file): file is UploadFile => !!file);
}

function restoreOwnedSnapshots(entries: ReadonlyArray<{ uid: string; file: UploadFile }>) {
  entries.forEach(({ uid, file }) => {
    const current = fileList.value.find(item => item.uid === uid);
    if (current) Object.assign(current, file, { uid });
  });
}

function snapshotOwnedFiles(files: readonly UploadFile[]) {
  return files.map(file => ({ uid: file.uid, file: { ...file } }));
}

function uploadFileChanged(before: UploadFile, after: UploadFile) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)] as Array<keyof UploadFile>);
  return [...keys].some(key => !Object.is(before[key], after[key]));
}

async function publishHookChanges(
  uids: readonly string[],
  interaction: number
): Promise<UploadFile[]> {
  const owned = resolveOwnedFiles(uids);
  if (!owned.length || !formDisabled.isInteractionCurrent(interaction)) return [];
  emit('update:modelValue', cloneUploadFiles(fileList.value));
  if (!(await formDisabled.awaitInteractionCurrent(interaction))) return [];
  return resolveOwnedFiles(uids);
}

async function syncModel(
  list: UploadFile[],
  interaction?: number,
  ownsRun: () => boolean = () => true
): Promise<boolean> {
  if (!isInteractionCurrent(interaction) || !ownsRun()) return false;
  fileList.value = cloneUploadFiles(list);
  if (!isInteractionCurrent(interaction) || !ownsRun()) {
    fileList.value = cloneUploadFiles(props.modelValue);
    return false;
  }
  emit('update:modelValue', cloneUploadFiles(fileList.value));
  const canContinue =
    interaction === undefined
      ? await formDisabled.awaitActive()
      : await formDisabled.awaitInteractionCurrent(interaction);
  if (!canContinue || !ownsRun()) {
    if (canContinue) return false;
    fileList.value = cloneUploadFiles(props.modelValue);
    return false;
  }
  emit('change', cloneUploadFiles(fileList.value));
  const stillActive =
    interaction === undefined
      ? await formDisabled.awaitActive()
      : await formDisabled.awaitInteractionCurrent(interaction);
  return stillActive && ownsRun();
}

function awaitRunCurrent(interaction?: number) {
  return interaction === undefined
    ? formDisabled.awaitActive()
    : formDisabled.awaitInteractionCurrent(interaction);
}

function isUploadCurrent(record: ActiveUpload): boolean {
  return (
    activeUploads.get(record.file.uid) === record &&
    !record.cancelled &&
    isInteractionCurrent(record.interaction)
  );
}

function claimUploadStage(record: ActiveUpload, terminal = false): number | undefined {
  if (!isUploadCurrent(record) || record.terminalClaimed) return undefined;
  if (terminal) record.terminalClaimed = true;
  record.stageGeneration += 1;
  return record.stageGeneration;
}

function ownsUploadStage(record: ActiveUpload, stage: number): boolean {
  return isUploadCurrent(record) && record.stageGeneration === stage;
}

function completeUpload(record: ActiveUpload) {
  if (activeUploads.get(record.file.uid) === record) {
    activeUploads.delete(record.file.uid);
  }
}

function cancelActiveUpload(uid: string) {
  const record = activeUploads.get(uid);
  if (!record) return;
  record.cancelled = true;
  record.abort?.();
  activeUploads.delete(uid);
}

function findActiveFile(record: ActiveUpload): UploadFile | undefined {
  return fileList.value.find(file => file.uid === record.file.uid);
}

function cancelActiveUploads() {
  let restored = false;
  activeUploads.forEach(record => {
    record.cancelled = true;
    record.abort?.();
    const currentFile = findActiveFile(record);
    if (currentFile) {
      currentFile.status = record.status;
      currentFile.progress = record.progress;
      currentFile.message = record.message;
      currentFile.response = record.response;
      restored = true;
    }
  });
  activeUploads.clear();
  // Disabled cleanup is a controlled-state repair, not a new user change.
  if (restored) syncModelUpdateOnly([...fileList.value]);
}

function clearAutoRemoveTimers() {
  autoRemoveTimers.forEach(timer => clearTimeout(timer));
  autoRemoveTimers.clear();
  failedAttemptTokens.clear();
}

function scheduleAutoRemove(file: UploadFile, token: symbol, interaction?: number) {
  const uid = file.uid;
  if (
    failedAttemptTokens.get(uid) !== token ||
    activeUploads.has(uid) ||
    fileList.value.find(item => item.uid === uid)?.status !== UploadStatus.Fail
  )
    return;
  const timer = setTimeout(() => {
    autoRemoveTimers.delete(timer);
    if (!isInteractionCurrent(interaction)) return;
    if (failedAttemptTokens.get(uid) !== token || activeUploads.has(uid)) return;
    const currentIndex = fileList.value.findIndex(
      item => item.uid === uid && item.status === UploadStatus.Fail
    );
    if (currentIndex < 0) return;
    failedAttemptTokens.delete(uid);
    void removeFileWithRun(currentIndex, interaction);
  }, 1500);
  autoRemoveTimers.add(timer);
}

async function onSelect(e?: Event) {
  if (isDisabled.value) return;
  const interaction = formDisabled.captureInteraction();
  if (remainCount.value <= 0) {
    emit('overcount', { maxCount: props.maxCount, currentCount: fileList.value.length });
    return;
  }
  emit('clickUpload', e);
  if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;
  if (remainCount.value <= 0) return;

  // #ifdef MP || APP-PLUS
  chooseFileMp(interaction);
  // #endif
  // #ifdef H5
  chooseFileH5(interaction);
  // #endif
}

function chooseFileMp(interaction: number) {
  const count = props.multiple ? remainCount.value : 1;

  if (props.accept === 'video') {
    uni.chooseVideo({
      sourceType: props.sourceType as string[],
      compressed: props.sizeType.includes('compressed'),
      success(res: { tempFilePath: string; size: number; name?: string; type?: string }) {
        if (!formDisabled.isInteractionCurrent(interaction)) return;
        handleAfterChoose([createMpVideoUploadFile(res, genUid)], interaction);
      },
    });
    return;
  }

  uni.chooseImage({
    count,
    sizeType: props.sizeType as UniApp.ChooseImageOptions['sizeType'],
    sourceType: props.sourceType as string[],
    success(res: UniApp.ChooseImageSuccessCallbackResult) {
      if (!formDisabled.isInteractionCurrent(interaction)) return;
      const paths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [];
      const infos = (res.tempFiles as Array<{ size?: number; name?: string; type?: string }>) || [];
      handleAfterChoose(createMpImageUploadFiles(paths, infos, genUid), interaction);
    },
  });
}

// #ifdef H5
function chooseFileH5(interaction: number) {
  const input = document.createElement('input');
  input.type = 'file';
  if (props.inputAccept) input.accept = props.inputAccept;
  if (props.multiple && remainCount.value > 1) input.multiple = true;

  input.onchange = () => {
    if (!formDisabled.isInteractionCurrent(interaction)) return;
    const rawFiles = Array.from(input.files || []);
    handleAfterChoose(createH5UploadFiles(rawFiles, remainCount.value, genUid), interaction);
  };
  input.click();
}
// #endif

async function handleAfterChoose(items: UploadFile[], interaction: number) {
  if (!items.length || !formDisabled.isInteractionCurrent(interaction)) return;

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
    if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;
  }
  if (!valid.length) return;

  if (props.beforeRead) {
    const target = valid.length === 1 ? valid[0] : valid;
    try {
      const pass = await props.beforeRead(target, { index: fileList.value.length });
      if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;
      if (pass === false) return;
    } catch {
      return;
    }
  }

  const merged = fileList.value.concat(valid).slice(0, props.maxCount);
  const acceptedUids = valid
    .map(file => file.uid)
    .filter(uid => merged.some(file => file.uid === uid));
  if (!(await syncModel(merged, interaction))) return;
  let owned = resolveOwnedFiles(acceptedUids);
  if (!owned.length) return;

  const beforeEvent = cloneUploadFiles(owned);
  const readTarget = owned.length === 1 ? owned[0] : owned;
  emit('afterRead', readTarget, { index: fileList.value.length - valid.length });
  const eventSnapshots = snapshotOwnedFiles(owned);
  let hookChanged = owned.some((file, index) => uploadFileChanged(beforeEvent[index], file));
  if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;
  restoreOwnedSnapshots(eventSnapshots);
  owned = resolveOwnedFiles(acceptedUids);
  if (!owned.length) return;

  if (props.afterRead) {
    const beforeProp = cloneUploadFiles(owned);
    const propTarget = owned.length === 1 ? owned[0] : owned;
    await props.afterRead(propTarget, { index: fileList.value.length - owned.length });
    const propSnapshots = snapshotOwnedFiles(owned);
    hookChanged ||= owned.some((file, index) => uploadFileChanged(beforeProp[index], file));
    if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;
    restoreOwnedSnapshots(propSnapshots);
    owned = resolveOwnedFiles(acceptedUids);
    if (!owned.length) return;
  }

  if (hookChanged) owned = await publishHookChanges(acceptedUids, interaction);
  if (!owned.length) return;

  if (props.action) {
    for (const file of owned) {
      if (!formDisabled.isInteractionCurrent(interaction)) return;
      await doUpload(file, interaction);
    }
  }
}

async function doUpload(sourceFile: UploadFile, interaction?: number) {
  if (!isInteractionCurrent(interaction)) return;
  const fileIndex = fileList.value.findIndex(file => file.uid === sourceFile.uid);
  if (fileIndex < 0) return;
  // Public callbacks and controlled props may retain every previously observed object.
  // Start each upload generation from a fresh component-owned list before mutating status.
  fileList.value = cloneUploadFiles(fileList.value);
  const file = fileList.value[fileIndex];
  failedAttemptTokens.delete(file.uid);
  const record: ActiveUpload = {
    interaction,
    file,
    status: file.status,
    progress: file.progress,
    message: file.message,
    response: file.response,
    cancelled: false,
    stageGeneration: 0,
    terminalClaimed: false,
  };
  activeUploads.set(file.uid, record);
  file.status = UploadStatus.Uploading;
  file.progress = 0;
  file.message = t('uploading');
  if (
    !(await syncModel([...fileList.value], interaction, () => isUploadCurrent(record))) ||
    !isUploadCurrent(record)
  )
    return;

  if (props.customRequest) {
    const customTask = props.customRequest({
      file,
      action: props.action,
      name: props.name,
      headers: props.headers,
      data: props.data,
      async onProgress(progress: number) {
        const stage = claimUploadStage(record);
        if (stage === undefined) return;
        const currentFile = findActiveFile(record);
        if (!currentFile) return;
        currentFile.progress = progress;
        emit('progress', currentFile, { progress });
        if (!(await awaitRunCurrent(interaction)) || !ownsUploadStage(record, stage)) return;
        await syncModel([...fileList.value], interaction, () => ownsUploadStage(record, stage));
      },
      async onSuccess(response: unknown) {
        const stage = claimUploadStage(record, true);
        if (stage === undefined) return;
        const currentFile = findActiveFile(record);
        if (!currentFile) return;
        currentFile.status = UploadStatus.Success;
        currentFile.progress = 100;
        currentFile.message = '';
        currentFile.response = response;
        if (
          !(await syncModel([...fileList.value], interaction, () =>
            ownsUploadStage(record, stage)
          )) ||
          !ownsUploadStage(record, stage)
        )
          return;
        completeUpload(record);
        emit('success', currentFile, { response });
      },
      async onFail(error: unknown) {
        const stage = claimUploadStage(record, true);
        if (stage === undefined) return;
        const currentFile = findActiveFile(record);
        if (!currentFile) return;
        currentFile.status = UploadStatus.Fail;
        currentFile.message = t('failed');
        if (
          !(await syncModel([...fileList.value], interaction, () =>
            ownsUploadStage(record, stage)
          )) ||
          !ownsUploadStage(record, stage)
        )
          return;
        const failToken = Symbol(file.uid);
        if (props.autoRemoveFail) failedAttemptTokens.set(file.uid, failToken);
        completeUpload(record);
        emit('fail', currentFile, { error });
        if (!(await awaitRunCurrent(interaction))) return;
        if (isDisabled.value) return;
        if (props.autoRemoveFail) {
          scheduleAutoRemove(currentFile, failToken, interaction);
        }
      },
    });
    if (customTask && typeof customTask.abort === 'function') {
      if (isUploadCurrent(record)) record.abort = () => customTask.abort?.();
      else customTask.abort();
    }
    return;
  }

  const uploadTask = uni.uploadFile({
    url: props.action,
    filePath: file.url,
    name: props.name,
    header: props.headers,
    formData: props.data,
    async success(res) {
      const stage = claimUploadStage(record, true);
      if (stage === undefined) return;
      const currentFile = findActiveFile(record);
      if (!currentFile) return;
      currentFile.status = UploadStatus.Success;
      currentFile.progress = 100;
      currentFile.message = '';
      currentFile.response = res.data;
      if (
        !(await syncModel([...fileList.value], interaction, () =>
          ownsUploadStage(record, stage)
        )) ||
        !ownsUploadStage(record, stage)
      )
        return;
      completeUpload(record);
      emit('success', currentFile, { response: res.data });
    },
    async fail(err) {
      const stage = claimUploadStage(record, true);
      if (stage === undefined) return;
      const currentFile = findActiveFile(record);
      if (!currentFile) return;
      currentFile.status = UploadStatus.Fail;
      currentFile.message = t('failed');
      if (
        !(await syncModel([...fileList.value], interaction, () =>
          ownsUploadStage(record, stage)
        )) ||
        !ownsUploadStage(record, stage)
      )
        return;
      const failToken = Symbol(file.uid);
      if (props.autoRemoveFail) failedAttemptTokens.set(file.uid, failToken);
      completeUpload(record);
      emit('fail', currentFile, { error: err });
      if (!(await awaitRunCurrent(interaction))) return;
      if (isDisabled.value) return;

      if (props.autoRemoveFail) {
        scheduleAutoRemove(currentFile, failToken, interaction);
      }
    },
  });

  if (uploadTask && typeof uploadTask.onProgressUpdate === 'function') {
    uploadTask.onProgressUpdate(async res => {
      const stage = claimUploadStage(record);
      if (stage === undefined) return;
      const currentFile = findActiveFile(record);
      if (!currentFile) return;
      currentFile.progress = res.progress;
      emit('progress', currentFile, { progress: res.progress });
      if (!(await awaitRunCurrent(interaction)) || !ownsUploadStage(record, stage)) return;
      await syncModel([...fileList.value], interaction, () => ownsUploadStage(record, stage));
    });
  }
  if (uploadTask && typeof uploadTask.abort === 'function') {
    if (isUploadCurrent(record)) record.abort = () => uploadTask.abort();
    else uploadTask.abort();
  }
}

async function removeFileWithRun(index: number, interaction?: number) {
  if (!isInteractionCurrent(interaction)) return;
  if (index < 0 || index >= fileList.value.length) return;
  const file = fileList.value[index];
  const uid = file.uid;

  if (props.beforeDelete) {
    try {
      const pass = await props.beforeDelete(file, { index });
      if (!(await awaitRunCurrent(interaction))) return;
      if (pass === false) return;
    } catch {
      return;
    }
  }

  await doRemove(uid, interaction);
}

async function removeFile(index: number) {
  await removeFileWithRun(index);
}

async function doRemove(uid: string, interaction?: number) {
  if (!isInteractionCurrent(interaction)) return;
  const index = fileList.value.findIndex(file => file.uid === uid);
  if (index < 0) return;
  const file = fileList.value[index];
  if (!file) return;
  const next = [...fileList.value];
  next.splice(index, 1);
  // Claim cancellation before the first public removal update. An abort implementation may
  // synchronously call fail, and an update/change listener may reenter a pending progress chain.
  cancelActiveUpload(uid);
  failedAttemptTokens.delete(uid);
  if (!(await syncModel(next, interaction))) return;
  emit('delete', file, { index });
}

function onRemove(index: number) {
  if (isDisabled.value) return;
  void removeFileWithRun(index, formDisabled.captureInteraction());
}

/** 内置确认删除（通过 lk-modal） */
function confirmRemove(index: number) {
  const file = fileList.value[index];
  if (!file) return;
  pendingDeleteInteraction = undefined;
  pendingDeleteUid.value = file.uid;
  deleteConfirmVisible.value = true;
}

async function onDeleteConfirm() {
  const uid = pendingDeleteUid.value;
  deleteConfirmVisible.value = false;
  pendingDeleteUid.value = null;
  const interaction = pendingDeleteInteraction;
  pendingDeleteInteraction = null;
  if (uid && interaction !== null) await doRemove(uid, interaction);
}

function onDeleteCancel() {
  deleteConfirmVisible.value = false;
  pendingDeleteUid.value = null;
  pendingDeleteInteraction = null;
}

function cancelPendingDelete() {
  if (!deleteConfirmVisible.value && pendingDeleteUid.value === null) return;
  deleteConfirmVisible.value = false;
  pendingDeleteUid.value = null;
  pendingDeleteInteraction = null;
}

async function onPreview(index: number) {
  if (isDisabled.value) return;
  const interaction = formDisabled.captureInteraction();
  const file = fileList.value[index];
  if (!file) return;
  const uid = file.uid;
  emit('clickPreview', file, { index });
  if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;

  if (!props.previewImage) return;
  const currentFile = fileList.value.find(item => item.uid === uid);
  if (!currentFile || !isImageUrl(currentFile.url)) return;

  const urls = fileList.value.filter(f => isImageUrl(f.url)).map(f => f.url);
  const current = currentFile.url;

  // #ifdef MP
  uni.previewImage({ current, urls });
  // #endif
  // #ifdef H5
  uni.previewImage({ current, urls });
  // #endif
}

async function retryUploadWithRun(index: number, interaction?: number) {
  if (!isInteractionCurrent(interaction)) return;
  const file = fileList.value[index];
  if (!file) return;
  if (file.status !== UploadStatus.Fail) return;
  emit('retry', file, { index });
  if (!(await awaitRunCurrent(interaction))) return;
  await doUpload(file, interaction);
}

async function retryUpload(index: number) {
  await retryUploadWithRun(index);
}

function onRetry(index: number) {
  if (isDisabled.value) return;
  void retryUploadWithRun(index, formDisabled.captureInteraction());
}

async function clearFiles() {
  activeUploads.forEach(record => {
    record.cancelled = true;
    record.abort?.();
  });
  activeUploads.clear();
  clearAutoRemoveTimers();
  if (!(await syncModel([]))) return;
  emit('clear');
}

watch(
  isDisabled,
  disabled => {
    if (!disabled) return;
    cancelPendingDelete();
    clearAutoRemoveTimers();
    cancelActiveUploads();
  },
  { flush: 'sync' }
);

onBeforeUnmount(() => {
  clearAutoRemoveTimers();
  activeUploads.forEach(record => {
    record.cancelled = true;
    record.abort?.();
  });
  activeUploads.clear();
});

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
  <view :id="id" class="lk-upload-wrapper" :aria-disabled="isDisabled">
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
          @tap.stop="onRetry(i)"
        >
          <lk-icon name="arrow-clockwise" size="36" color="var(--lk-upload-mask-text)" />
          <text class="lk-upload__mask-text">{{ f.message || uploadFailedText }}</text>
        </view>

        <!-- 删除按钮 -->
        <view
          v-if="deletable && !isDisabled && f.status !== 'uploading'"
          class="lk-upload__del"
          @tap.stop="onRemove(i)"
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
