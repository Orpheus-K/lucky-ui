<script setup lang="ts">
import LkTimeline from '@/uni_modules/lucky-ui/components/lk-timeline/lk-timeline.vue';
import LkTimelineItem from '@/uni_modules/lucky-ui/components/lk-timeline/lk-timeline-item.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
</script>

<template>
  <view class="demo-page">
    <!-- ① 左侧时间 + 右侧图片信息预览（重点演示） -->
    <demo-block title="左侧时间 · 右侧图片预览">
      <lk-timeline>
        <lk-timeline-item title="拍摄：海岸日落" subtitle="Malibu Beach · CA" status="completed">
          <template #left>
            <text class="time-label">09:14</text>
            <text class="date-label">Today</text>
          </template>
          <template #extra>
            <view class="lk-timeline-preview-card">
              <image
                class="lk-timeline-preview-card__image"
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80"
                mode="aspectFill"
              />
              <view class="lk-timeline-preview-card__info">
                <text class="lk-timeline-preview-card__name">sunset_malibu_01.jpg</text>
                <text class="lk-timeline-preview-card__meta">4032 × 3024 · 8.2 MB</text>
                <text class="lk-timeline-preview-card__meta">RAW + JPEG</text>
              </view>
            </view>
          </template>
        </lk-timeline-item>

        <lk-timeline-item title="拍摄：城市夜景" subtitle="Downtown LA · 21F" status="active">
          <template #left>
            <text class="time-label">21:40</text>
            <text class="date-label">Today</text>
          </template>
          <template #extra>
            <view class="lk-timeline-preview-card">
              <image
                class="lk-timeline-preview-card__image"
                src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&q=80"
                mode="aspectFill"
              />
              <view class="lk-timeline-preview-card__info">
                <text class="lk-timeline-preview-card__name">nightscape_dtla_03.jpg</text>
                <text class="lk-timeline-preview-card__meta">5472 × 3648 · 12.1 MB</text>
                <text class="lk-timeline-preview-card__meta">长曝光 · f/8 · ISO 200</text>
              </view>
            </view>
          </template>
        </lk-timeline-item>

        <lk-timeline-item
          title="后期处理"
          subtitle="Lightroom · 导出"
          status="pending"
          desc="色调统一，等待导出完成。"
        >
          <template #left>
            <text class="time-label">23:00</text>
            <text class="date-label">Today</text>
          </template>
        </lk-timeline-item>
      </lk-timeline>
    </demo-block>

    <!-- ② 节点状态（统一品牌色） -->
    <demo-block title="节点状态 · 统一品牌色">
      <lk-timeline>
        <lk-timeline-item
          :index="0"
          status="completed"
          title="需求确认"
          desc="完成范围梳理与用户故事评审。"
          time="Day 1"
        />
        <lk-timeline-item
          :index="1"
          status="active"
          title="开发进行中"
          desc="接口联调，组件拆分迭代。"
          time="Day 3"
        />
        <lk-timeline-item
          :index="2"
          status="pending"
          title="测试验收"
          desc="等待开发完成后回归测试。"
          time="Day 5"
        />
        <lk-timeline-item
          :index="3"
          status="error"
          title="上线发布"
          desc="CI/CD 流水线异常，待修复。"
          time="Day 6"
        />
      </lk-timeline>
    </demo-block>

    <!-- ③ 空心节点 outlined -->
    <demo-block title="空心节点 outlined">
      <lk-timeline dot-variant="outlined">
        <lk-timeline-item
          title="提交 PR"
          subtitle="feat/timeline-v2"
          desc="新增苹果风格时间轴组件。"
          time="10:02"
        />
        <lk-timeline-item
          title="Code Review"
          subtitle="@senior"
          desc="补充注释与边界处理。"
          time="11:15"
          status="active"
        />
        <lk-timeline-item
          title="合并主干"
          subtitle="main"
          desc="通过全量 CI 检查。"
          time="13:40"
          status="pending"
        />
      </lk-timeline>
    </demo-block>

    <!-- ④ 数字序号节点 numbered -->
    <demo-block title="数字序号节点 numbered">
      <lk-timeline dot-variant="numbered">
        <lk-timeline-item :index="0" title="账户验证" desc="输入手机号完成验证。" />
        <lk-timeline-item :index="1" title="补充信息" desc="填写姓名与企业名称。" />
        <lk-timeline-item :index="2" title="上传证件" desc="身份证正反面拍照。" />
        <lk-timeline-item
          :index="3"
          title="等待审核"
          desc="通常 1 个工作日完成。"
          status="pending"
        />
      </lk-timeline>
    </demo-block>

    <!-- ⑤ activeIndex 激活高亮 -->
    <demo-block title="activeIndex 激活高亮">
      <lk-timeline :active-index="1">
        <lk-timeline-item
          :index="0"
          title="已完成"
          desc="Step 1 done."
          time="09:00"
          status="completed"
        />
        <lk-timeline-item :index="1" title="进行中" desc="Step 2 in progress." time="10:00" />
        <lk-timeline-item
          :index="2"
          title="待开始"
          desc="Step 3 pending."
          time="11:00"
          status="pending"
        />
      </lk-timeline>
    </demo-block>

    <!-- ⑥ 水平滚动流光轴 (优化：不拥挤，支持滑动) -->
    <demo-block title="水平滚动 · 依次流光">
      <lk-timeline direction="horizontal" line-mode="streaming" :total="6">
        <lk-timeline-item :index="0" date="Jan" title="项目立项" status="completed" />
        <lk-timeline-item :index="1" date="Feb" title="原型设计" status="completed" />
        <lk-timeline-item :index="2" date="Mar" title="架构评审" status="active" />
        <lk-timeline-item :index="3" date="Apr" title="核心开发" status="pending" />
        <lk-timeline-item :index="4" date="May" title="集成测试" status="pending" />
        <lk-timeline-item :index="5" date="Jun" title="正式发布" status="pending" />
      </lk-timeline>
    </demo-block>

    <!-- ⑧ 轴线变体 (虚线 / 点线) -->

    <!-- ⑦ 自定义 extra 插槽 -->
    <demo-block title="自定义 extra 插槽">
      <lk-timeline>
        <lk-timeline-item date="Feb 20" time="15:30" title="App Store 审核通过" subtitle="v2.3.1">
          <template #extra>
            <view class="badge-row">
              <text class="badge badge--primary">iOS</text>
              <text class="badge badge--soft">macOS</text>
            </view>
          </template>
        </lk-timeline-item>
        <lk-timeline-item
          date="Feb 18"
          time="11:00"
          title="提交审核"
          subtitle="包含 5 项新功能"
          status="pending"
        >
          <template #extra>
            <view class="badge-row">
              <text class="badge badge--soft">Pending Review</text>
            </view>
          </template>
        </lk-timeline-item>
      </lk-timeline>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.demo-page {
  padding: 0;
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 24rpx;
  }
  background: var(--lk-bg-page);
}

// 左侧时间列（demo 用）
.time-label {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--lk-text-primary);
  font-variant-numeric: tabular-nums;
  text-align: right;
  line-height: 1.2;
}

.date-label {
  font-size: 20rpx;
  font-weight: 600;
  color: var(--lk-color-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: right;
  line-height: 1.2;
}

// 徽章（演示用）
.badge-row {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 10rpx;
  }
  margin-top: 10rpx;
}

.badge {
  font-size: 20rpx;
  font-weight: 600;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  letter-spacing: 0.03em;

  &--primary {
    background: rgba(0, 122, 255, 0.12);
    color: var(--lk-color-primary);
  }

  &--soft {
    background: var(--lk-fill-1);
    color: var(--lk-text-secondary);
  }
}
</style>
