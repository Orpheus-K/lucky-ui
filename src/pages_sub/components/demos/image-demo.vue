<script setup lang="ts">
import LkImage from '@/uni_modules/lucky-ui/components/lk-image/lk-image.vue';
import LkTag from '@/uni_modules/lucky-ui/components/lk-tag/lk-tag.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <view class="demo-row">
        <view class="image-inline-item">
          <lk-image src="https://picsum.photos/200/200?random=1" width="200rpx" height="200rpx" />
        </view>
        <view class="image-inline-item">
          <lk-image
            src="https://picsum.photos/200/200?random=2"
            width="200rpx"
            height="200rpx"
            radius="var(--lk-radius-md)"
          />
        </view>
        <view class="image-inline-item">
          <lk-image
            src="https://picsum.photos/200/200?random=3"
            width="200rpx"
            height="200rpx"
            radius="50%"
          />
        </view>
      </view>
    </demo-block>

    <demo-block title="图片形状">
      <view class="demo-row">
        <view class="image-demo-item">
          <lk-image src="https://picsum.photos/200/200?random=4" width="160rpx" height="160rpx" />
          <text>默认</text>
        </view>
        <view class="image-demo-item">
          <lk-image
            src="https://picsum.photos/200/200?random=5"
            width="160rpx"
            height="160rpx"
            radius="var(--lk-radius-md)"
          />
          <text>圆角</text>
        </view>
        <view class="image-demo-item">
          <lk-image
            src="https://picsum.photos/200/200?random=6"
            width="160rpx"
            height="160rpx"
            radius="50%"
          />
          <text>圆形</text>
        </view>
      </view>
    </demo-block>

    <demo-block title="适配模式">
      <view class="image-grid">
        <view class="image-mode-item">
          <lk-image
            src="https://picsum.photos/400/300?random=7"
            width="200rpx"
            height="160rpx"
            mode="scaleToFill"
            radius="var(--lk-radius-sm)"
          />
          <text>scaleToFill</text>
        </view>
        <view class="image-mode-item">
          <lk-image
            src="https://picsum.photos/400/300?random=8"
            width="200rpx"
            height="160rpx"
            mode="aspectFit"
            radius="var(--lk-radius-sm)"
          />
          <text>aspectFit</text>
        </view>
        <view class="image-mode-item">
          <lk-image
            src="https://picsum.photos/400/300?random=9"
            width="200rpx"
            height="160rpx"
            mode="aspectFill"
            radius="var(--lk-radius-sm)"
          />
          <text>aspectFill</text>
        </view>
      </view>
    </demo-block>

    <demo-block title="图片预览">
      <view class="demo-row">
        <view class="image-inline-item">
          <lk-image
            src="https://picsum.photos/800/600?random=10"
            width="200rpx"
            height="150rpx"
            radius="var(--lk-radius-md)"
          />
        </view>
        <view class="image-inline-item">
          <lk-image
            src="https://picsum.photos/800/600?random=11"
            width="200rpx"
            height="150rpx"
            radius="var(--lk-radius-md)"
          />
        </view>
        <view class="image-inline-item">
          <lk-image
            src="https://picsum.photos/800/600?random=12"
            width="200rpx"
            height="150rpx"
            radius="var(--lk-radius-md)"
            :preview="false"
          />
        </view>
      </view>
      <view class="preview-tip">
        <text>前两张默认点击可预览，第三张关闭预览。</text>
      </view>
    </demo-block>

    <demo-block title="卡片式图片">
      <view class="image-card">
        <lk-image
          src="https://picsum.photos/600/400?random=30"
          width="100%"
          height="300rpx"
          mode="aspectFill"
        />
        <view class="image-card-content">
          <text class="image-card-title">美丽风景</text>
          <text class="image-card-desc">这是一张美丽的风景图片</text>
          <view class="image-card-footer">
            <lk-tag size="sm" type="solid">风景</lk-tag>
            <lk-tag size="sm">摄影</lk-tag>
            <text class="image-card-time">2小时前</text>
          </view>
        </view>
      </view>
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

.demo-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  > :not(.preview-spacing-placeholder) {
    margin: 8rpx;
  }
}

.image-inline-item {
  margin: 8rpx;
}

.preview-tip {
  margin-top: 12rpx;

  text {
    font-size: 22rpx;
    color: var(--lk-text-secondary);
  }
}

.image-demo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  > :not(:first-child) {
    margin-top: 12rpx;
  }

  text {
    font-size: 22rpx;
    color: var(--lk-text-secondary);
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  > :not(.preview-spacing-placeholder) {
    margin: 8rpx;
  }
}

.image-mode-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  > :not(:first-child) {
    margin-top: 12rpx;
  }

  text {
    font-size: 20rpx;
    color: var(--lk-text-tertiary);
    text-align: center;
  }
}

.image-grid-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  > :not(.preview-spacing-placeholder) {
    margin: 6rpx;
  }
}

.image-card {
  background: var(--lk-bg-container);
  border-radius: var(--lk-radius-lg);
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.image-card-content {
  padding: 24rpx;
}

.image-card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--lk-text-primary);
  display: block;
  margin-bottom: 12rpx;
}

.image-card-desc {
  font-size: 24rpx;
  color: var(--lk-text-secondary);
  line-height: 1.6;
  display: block;
  margin-bottom: 16rpx;
}

.image-card-footer {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 12rpx;
  }
  flex-wrap: wrap;
}

.image-card-time {
  margin-left: auto;
  font-size: 22rpx;
  color: var(--lk-text-tertiary);
}
</style>
