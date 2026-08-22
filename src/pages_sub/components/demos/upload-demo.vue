<script setup lang="ts">
import { ref } from 'vue';
import LkUpload from '@/uni_modules/lucky-ui/components/lk-upload/lk-upload.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import type { UploadFile } from '@/uni_modules/lucky-ui/components/lk-upload/upload.props';

/* ── 基础用法 ── */
const fileList1 = ref<UploadFile[]>([]);

/* ── 限制数量 ── */
const fileList2 = ref<UploadFile[]>([]);

/* ── 限制大小 ── */
const fileList3 = ref<UploadFile[]>([]);

/* ── 上传前校验 ── */
const fileList4 = ref<UploadFile[]>([]);

/* ── 删除前确认（lk-modal） ── */
const fileList5 = ref<UploadFile[]>([]);
const deleteModalVisible = ref(false);
const pendingDeleteIndex = ref(-1);
const pendingDeleteName = ref('');

/* ── 禁用状态 ── */
const fileList6 = ref<UploadFile[]>([]);

/* ── 自定义上传按钮 ── */
const fileList7 = ref<UploadFile[]>([]);

/* ── 带初始值 ── */
const fileList8 = ref<UploadFile[]>([
  {
    uid: 'init-1',
    name: 'demo.jpg',
    url: 'https://picsum.photos/200/200.jpg?random=1',
    status: 'success',
  },
  {
    uid: 'init-2',
    name: 'demo2.jpg',
    url: 'https://picsum.photos/200/200.jpg?random=2',
    status: 'success',
  },
]);

/* ── 自定义上传函数（演示 customRequest） ── */
const fileList9 = ref<UploadFile[]>([]);

/* ── 状态与反色展示 ── */
const fileList10 = ref<UploadFile[]>([
  {
    uid: 'state-1',
    name: 'success.jpg',
    url: 'https://picsum.photos/200/200.jpg?random=11',
    status: 'success',
  },
  {
    uid: 'state-2',
    name: 'uploading.jpg',
    url: 'https://picsum.photos/200/200.jpg?random=12',
    status: 'uploading',
    progress: 62,
  },
  {
    uid: 'state-3',
    name: 'failed.jpg',
    url: 'https://picsum.photos/200/200.jpg?random=13',
    status: 'fail',
    message: '重试',
  },
]);

/* ── 回调函数 ── */

const handleChange = (files: UploadFile[]) => {
  console.log('文件列表变化:', files);
};

const handleAfterRead = (file: UploadFile | UploadFile[]) => {
  console.log('文件读取完毕:', file);
};

const handleOversize = (file: UploadFile | UploadFile[]) => {
  const name = Array.isArray(file) ? file.map(f => f.name).join(', ') : file.name;
  uni.showToast({ title: `${name} 超出 2MB 限制`, icon: 'none' });
};

const beforeRead = (file: UploadFile | UploadFile[]) => {
  const check = (f: UploadFile) => {
    if (f.type && f.type.includes('gif')) {
      uni.showToast({ title: '不支持 GIF 格式', icon: 'none' });
      return false;
    }
    return true;
  };
  if (Array.isArray(file)) return file.every(check);
  return check(file);
};

/* 使用 lk-modal 进行删除前确认 */
const beforeDelete = (file: UploadFile, { index }: { index: number }) => {
  return new Promise<boolean>(resolve => {
    pendingDeleteIndex.value = index;
    pendingDeleteName.value = file.name;
    deleteModalVisible.value = true;
    // 将 resolve 暂存到 ref 上，由 modal 回调决定
    _deleteResolve = resolve;
  });
};

let _deleteResolve: ((val: boolean) => void) | null = null;

const onDeleteConfirm = () => {
  deleteModalVisible.value = false;
  if (_deleteResolve) _deleteResolve(true);
  _deleteResolve = null;
};

const onDeleteCancel = () => {
  deleteModalVisible.value = false;
  if (_deleteResolve) _deleteResolve(false);
  _deleteResolve = null;
};

const handleDelete = (file: UploadFile, { index }: { index: number }) => {
  console.log(`已删除第 ${index + 1} 个文件:`, file.name);
};

const handleClickPreview = (file: UploadFile, { index }: { index: number }) => {
  console.log(`预览第 ${index + 1} 个文件:`, file.url);
};

/* 模拟自定义上传（演示 customRequest 用法） */
const mockCustomRequest: InstanceType<typeof LkUpload>['$props']['customRequest'] = ({
  file,
  onProgress,
  onSuccess,
}) => {
  let progress = 0;
  const timer = setInterval(() => {
    progress += Math.floor(Math.random() * 20) + 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(timer);
      onSuccess({ id: file.uid, url: file.url });
    }
    onProgress(progress);
  }, 300);
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法" desc="选择图片后展示缩略图列表">
      <lk-upload v-model="fileList1" @change="handleChange" @after-read="handleAfterRead" />
    </demo-block>

    <demo-block title="限制上传数量" desc="maxCount 限制最多上传 3 张">
      <lk-upload v-model="fileList2" :max-count="3" @change="handleChange" />
    </demo-block>

    <demo-block title="限制文件大小" desc="单个文件不超过 2MB，超出触发 oversize">
      <lk-upload
        v-model="fileList3"
        :max-size="2 * 1024 * 1024"
        @oversize="handleOversize"
        @change="handleChange"
      />
    </demo-block>

    <demo-block title="上传前校验" desc="beforeRead 校验文件类型，拒绝 GIF">
      <lk-upload v-model="fileList4" :before-read="beforeRead" @change="handleChange" />
    </demo-block>

    <demo-block title="删除前确认（lk-modal）" desc="通过 beforeDelete + lk-modal 弹窗确认">
      <lk-upload
        v-model="fileList5"
        :before-delete="beforeDelete"
        @delete="handleDelete"
        @change="handleChange"
      />
      <!-- 删除确认弹窗 -->
      <lk-modal
        v-model="deleteModalVisible"
        title="删除确认"
        @confirm="onDeleteConfirm"
        @cancel="onDeleteCancel"
      >
        <text>确定删除「{{ pendingDeleteName }}」吗？</text>
      </lk-modal>
    </demo-block>

    <demo-block title="禁用状态">
      <lk-upload v-model="fileList6" disabled />
    </demo-block>

    <demo-block title="自定义上传按钮" desc="通过 trigger 插槽自定义">
      <lk-upload v-model="fileList7" upload-text="" :max-count="1">
        <template #trigger>
          <lk-icon name="camera" size="48" />
          <text class="upload-custom-text">拍照上传</text>
        </template>
      </lk-upload>
    </demo-block>

    <demo-block title="带初始值" desc="v-model 传入已有文件列表">
      <lk-upload
        v-model="fileList8"
        :max-count="5"
        @click-preview="handleClickPreview"
        @delete="handleDelete"
        @change="handleChange"
      />
    </demo-block>

    <demo-block title="自定义上传函数" desc="customRequest 模拟上传进度">
      <lk-upload
        v-model="fileList9"
        action="/mock/upload"
        :custom-request="mockCustomRequest"
        :max-count="3"
        @change="handleChange"
      />
    </demo-block>

    <demo-block title="状态与反色" desc="上传中、失败和成功状态在亮暗主题下保持清晰对比">
      <lk-upload
        v-model="fileList10"
        :max-count="4"
        :preview-size="168"
        upload-text="继续添加"
        @change="handleChange"
      />
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.component-demo {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
}

.upload-custom-text {
  margin-top: var(--lk-spacing-xs);
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
}
</style>
