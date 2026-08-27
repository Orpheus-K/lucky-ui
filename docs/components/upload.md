---
title: Upload 上传
phone: upload
---

# Upload 上传

文件选择与上传组件，支持图片/视频选择、文件大小校验、上传进度、多文件管理等。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
const fileList = ref([]);
</script>

<template>
  <lk-upload v-model="fileList" />
</template>
```

## 限制最大数量

通过 `maxCount` 限制可上传的最大文件数量。

```vue
<lk-upload v-model="fileList" :max-count="3" />
```

## 限制文件大小

通过 `maxSize` 限制单个文件的最大体积（单位 byte），超出时触发 `oversize` 事件。

```vue
<script setup lang="ts">
const onOversize = file => {
  uni.showToast({ title: '文件超出 2MB 限制', icon: 'none' });
};
</script>

<template>
  <lk-upload v-model="fileList" :max-size="2 * 1024 * 1024" @oversize="onOversize" />
</template>
```

## 上传前校验

通过 `beforeRead` 钩子在选中文件后、加入列表前进行校验，返回 `false` 可阻止。

```vue
<script setup lang="ts">
const beforeRead = file => {
  if (file.type === 'image/gif') {
    uni.showToast({ title: '请上传非 GIF 图片', icon: 'none' });
    return false;
  }
  return true;
};
</script>

<template>
  <lk-upload v-model="fileList" :before-read="beforeRead" />
</template>
```

## 删除前确认（lk-modal）

通过 `beforeDelete` 钩子配合 `lk-modal` 组件在删除前进行确认，替代原生 `uni.showModal`，体验与主题统一。

```vue
<script setup lang="ts">
import { ref } from 'vue';

const fileList = ref([]);
const deleteModalVisible = ref(false);
const pendingFileName = ref('');
let _resolve = null;

const beforeDelete = (file, { index }) => {
  return new Promise(resolve => {
    pendingFileName.value = file.name;
    deleteModalVisible.value = true;
    _resolve = resolve;
  });
};

const onConfirm = () => {
  deleteModalVisible.value = false;
  _resolve?.(true);
};

const onCancel = () => {
  deleteModalVisible.value = false;
  _resolve?.(false);
};
</script>

<template>
  <lk-upload v-model="fileList" :before-delete="beforeDelete" />
  <lk-modal v-model="deleteModalVisible" title="删除确认" @confirm="onConfirm" @cancel="onCancel">
    <text>确定删除「{{ pendingFileName }}」吗？</text>
  </lk-modal>
</template>
```

## 自动上传

配置 `action` 后选择文件将自动上传到服务器，并展示进度。

```vue
<lk-upload
  v-model="fileList"
  action="https://api.example.com/upload"
  :headers="{ Authorization: 'Bearer xxx' }"
  :data="{ folder: 'avatar' }"
  name="file"
  @success="onSuccess"
  @fail="onFail"
  @progress="onProgress"
/>
```

## 自定义上传函数

通过 `customRequest` 接管上传过程。下面直接返回原生 `UploadTask` 的取消句柄，因此删除、清空、Form disabled 或卸载都能主动终止传输；若外部请求封装只返回 Promise，就不能伪装成可取消任务。

```vue
<script setup lang="ts">
const customRequest = ({ file, action, name, headers, data, onProgress, onSuccess, onFail }) => {
  const task = uni.uploadFile({
    url: action,
    filePath: file.url,
    name,
    header: headers,
    formData: data,
    success: onSuccess,
    fail: onFail,
  });
  task.onProgressUpdate(result => onProgress(result.progress));
  return { abort: () => task.abort() };
};
</script>

<template>
  <lk-upload v-model="fileList" action="/upload" :custom-request="customRequest" />
</template>
```

## 禁用状态

```vue
<lk-upload v-model="fileList" disabled />
```

## 自定义上传按钮

通过 `trigger` 插槽自定义上传区域内容。插槽会完整替换默认图标、文案和数量提示；如需数量提示，请在插槽内自行渲染。

```vue
<lk-upload v-model="fileList">
  <template #trigger>
    <view class="custom-trigger">
      <lk-icon name="camera" size="48" />
      <text class="custom-trigger-text">拍照上传</text>
    </view>
  </template>
</lk-upload>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import UploadDemo from '@/pages_sub/components/demos/upload-demo.vue';
</script>

<template>
  <UploadDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-upload v-model="fileList" :max-count="6" :max-size="5 * 1024 * 1024" />
  </view>
</template>
```

## API

### Props

| 属性名           | 说明                             | 类型                                            | 默认值                      |
| ---------------- | -------------------------------- | ----------------------------------------------- | --------------------------- |
| `v-model`        | 文件列表                         | `UploadFile[]`                                  | `[]`                        |
| `action`         | 上传服务器地址，为空则不自动上传 | `string`                                        | `''`                        |
| `headers`        | 上传请求 header                  | `Record<string, string>`                        | `{}`                        |
| `data`           | 上传附带数据                     | `Record<string, any>`                           | `{}`                        |
| `name`           | 上传文件字段名                   | `string`                                        | `'file'`                    |
| `accept`         | 接受的文件类型                   | `'image' \| 'video' \| 'all'`                   | `'image'`                   |
| `inputAccept`    | H5 端 input 的 accept 属性       | `string`                                        | `'image/*'`                 |
| `multiple`       | 是否支持多选                     | `boolean`                                       | `true`                      |
| `maxCount`       | 最大文件数量                     | `number`                                        | `9`                         |
| `maxSize`        | 单个文件最大体积（byte）         | `number`                                        | `10485760` (10MB)           |
| `disabled`       | 是否禁用                         | `boolean`                                       | `false`                     |
| `previewSize`    | 预览图尺寸                       | `string \| number`                              | `'180rpx'`                  |
| `deletable`      | 是否可删除                       | `boolean`                                       | `true`                      |
| `previewImage`   | 是否可预览大图                   | `boolean`                                       | `true`                      |
| `showUpload`     | 是否展示上传按钮                 | `boolean`                                       | `true`                      |
| `sizeType`       | 图片尺寸类型（小程序）           | `string[]`                                      | `['original','compressed']` |
| `sourceType`     | 文件来源（小程序）               | `string[]`                                      | `['album','camera']`        |
| `uploadText`     | 上传按钮文字                     | `string`                                        | `'上传'`                    |
| `uploadIcon`     | 上传按钮图标                     | `string`                                        | `'plus'`                    |
| `beforeRead`     | 选中文件前的钩子                 | `(file, detail) => boolean \| Promise<boolean>` | —                           |
| `afterRead`      | 选中文件后的回调                 | `(file, detail) => void`                        | —                           |
| `beforeDelete`   | 删除前的钩子                     | `(file, detail) => boolean \| Promise<boolean>` | —                           |
| `customRequest`  | 自定义上传函数（替代内置上传）   | `CustomRequestFn`                               | —                           |
| `autoRemoveFail` | 是否自动移除上传失败的文件       | `boolean`                                       | `false`                     |
| `imageFit`       | 图片填充模式                     | `string`                                        | `'aspectFill'`              |

### UploadFile 数据结构

| 字段       | 说明            | 类型                                            |
| ---------- | --------------- | ----------------------------------------------- |
| `uid`      | 唯一标识        | `string`                                        |
| `name`     | 文件名          | `string`                                        |
| `size`     | 文件大小 (字节) | `number`                                        |
| `type`     | 文件类型 (MIME) | `string`                                        |
| `url`      | 预览地址        | `string`                                        |
| `thumb`    | 缩略图地址      | `string`                                        |
| `status`   | 上传状态        | `'ready' \| 'uploading' \| 'success' \| 'fail'` |
| `progress` | 上传进度 0-100  | `number`                                        |
| `message`  | 提示信息        | `string`                                        |
| `response` | 服务端响应数据  | `any`                                           |

### Events

| 事件名              | 说明                         | 回调参数                                        |
| ------------------- | ---------------------------- | ----------------------------------------------- |
| `update:modelValue` | 文件列表变化，支持 `v-model` | `(fileList: UploadFile[])`                      |
| `change`            | 文件列表变化                 | `(fileList: UploadFile[])`                      |
| `afterRead`         | 文件读取完毕                 | `(file: UploadFile \| UploadFile[], { index })` |
| `oversize`          | 文件超出大小限制             | `(file: UploadFile \| UploadFile[])`            |
| `overcount`         | 文件数量超出限制             | `({ maxCount, currentCount })`                  |
| `delete`            | 删除文件                     | `(file: UploadFile, { index })`                 |
| `clear`             | 清空文件                     | `()`                                            |
| `clickPreview`      | 点击预览                     | `(file: UploadFile, { index })`                 |
| `clickUpload`       | 点击上传区域                 | `(event)`                                       |
| `retry`             | 点击失败遮罩重新上传前触发   | `(file: UploadFile, { index })`                 |
| `progress`          | 上传进度                     | `(file: UploadFile, { progress })`              |
| `success`           | 上传成功                     | `(file: UploadFile, { response })`              |
| `fail`              | 上传失败                     | `(file: UploadFile, { error })`                 |

### Slots

| 插槽名    | 说明               |
| --------- | ------------------ |
| `trigger` | 自定义上传按钮内容 |

### Methods（通过 ref 调用）

| 方法名          | 说明                                                               | 参数              |
| --------------- | ------------------------------------------------------------------ | ----------------- |
| `chooseFile`    | 手动触发文件选择；组件或祖先 Form disabled 时不执行                | —                 |
| `retryUpload`   | 重新上传指定文件；程序化维护方法，Form disabled 时仍可执行         | `(index: number)` |
| `removeFile`    | 直接删除指定文件；程序化维护方法，Form disabled 时仍可执行         | `(index: number)` |
| `confirmRemove` | 弹出删除确认；程序化维护方法，Form disabled 时仍可执行             | `(index: number)` |
| `clearFiles`    | 清空全部文件并取消活动任务；程序化维护方法，Form disabled 时仍执行 | —                 |
