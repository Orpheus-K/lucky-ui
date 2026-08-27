<script setup lang="ts">
import { ref } from 'vue';
import LkCollapse from '@/uni_modules/lucky-ui/components/lk-collapse/lk-collapse.vue';
import LkCollapseItem from '@/uni_modules/lucky-ui/components/lk-collapse/lk-collapse-item.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const defaultActive = ref(['1']);
const accordionActive = ref('1');
const iconAccordionActive = ref('1');
const asyncActive = ref(['1']);
const groupActive = ref(['1']);
const cardActive = ref(['1']);
const ghostActive = ref(['1']);
const disabledActive = ref(['1']);

function handleBeforeToggle(_name: string | number, expanded: boolean) {
  if (!expanded) return true; // 收起直接允许
  return new Promise<boolean>(resolve => {
    setTimeout(() => {
      resolve(true);
    }, 600);
  });
}
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-collapse v-model="defaultActive">
        <lk-collapse-item name="1" title="平滑折叠体验">
          <view class="collapse-content">
            提供跨端一致的平滑折叠展开动效，折叠时彻底收起内边距与高度。
          </view>
        </lk-collapse-item>
        <lk-collapse-item name="2" title="多项同时展开">
          <view class="collapse-content">
            支持同时展开多个面板，默认风格轻量简洁，与页面自然融合。
          </view>
        </lk-collapse-item>
      </lk-collapse>
    </demo-block>

    <demo-block title="手风琴模式">
      <lk-collapse v-model="accordionActive" accordion>
        <lk-collapse-item name="1" title="什么是手风琴模式">
          <view class="collapse-content">
            手风琴模式下，展开任意一项将自动收起其他已展开项。
          </view>
        </lk-collapse-item>
        <lk-collapse-item name="2" title="适用场景">
          <view class="collapse-content">
            适合帮助中心、常见问题（FAQ）等需要单项聚焦的场景。
          </view>
        </lk-collapse-item>
        <lk-collapse-item name="3" title="平滑切换">
          <view class="collapse-content">
            切换过程高度动态抵消，页面无上下漂移。
          </view>
        </lk-collapse-item>
      </lk-collapse>
    </demo-block>

    <demo-block title="加减号图标（手风琴）">
      <lk-collapse
        v-model="iconAccordionActive"
        accordion
        arrow-icon="plus-lg"
        open-icon="dash-lg"
      >
        <lk-collapse-item name="1" title="如何办理退换货">
          <view class="collapse-content">
            在订单详情中提交售后申请，审核通过后寄回商品。
          </view>
        </lk-collapse-item>
        <lk-collapse-item name="2" title="配送服务范围">
          <view class="collapse-content">
            支持全国主要城市及部分偏远地区配送服务。
          </view>
        </lk-collapse-item>
        <lk-collapse-item name="3" title="发票开具说明">
          <view class="collapse-content">
            确认收货后可在订单页面自助申请开具电子普通发票。
          </view>
        </lk-collapse-item>
      </lk-collapse>
    </demo-block>

    <demo-block title="异步展开">
      <lk-collapse v-model="asyncActive">
        <lk-collapse-item
          name="1"
          title="异步加载内容 (600ms)"
          :before-toggle="handleBeforeToggle"
        >
          <view class="collapse-content">
            点击展开时触发异步校验或数据请求，加载完成后平滑展开。
          </view>
        </lk-collapse-item>
      </lk-collapse>
    </demo-block>

    <demo-block title="整体分组">
      <lk-collapse v-model="groupActive" variant="group">
        <lk-collapse-item name="1" title="账号与安全">
          <view class="collapse-content">
            管理个人基本信息、登录密码与绑定手机号。
          </view>
        </lk-collapse-item>
        <lk-collapse-item name="2" title="消息与通知">
          <view class="collapse-content">
            设置系统通知、活动推送与免打扰时段。
          </view>
        </lk-collapse-item>
        <lk-collapse-item name="3" title="通用设置">
          <view class="collapse-content">
            多语言、亮暗主题模式与缓存清理。
          </view>
        </lk-collapse-item>
      </lk-collapse>
    </demo-block>

    <demo-block title="卡片布局">
      <lk-collapse v-model="cardActive" variant="card">
        <lk-collapse-item name="1" title="订单进度">
          <view class="collapse-content">
            包裹已由配送员揽收，正在发往目的地。
          </view>
        </lk-collapse-item>
        <lk-collapse-item name="2" title="费用明细">
          <view class="collapse-content">
            商品总价 ¥128.00，优惠减免 ¥20.00，实付 ¥108.00。
          </view>
        </lk-collapse-item>
      </lk-collapse>
    </demo-block>

    <demo-block title="轻量布局">
      <lk-collapse v-model="ghostActive" variant="ghost" :bordered="false">
        <lk-collapse-item name="1" title="什么是轻量布局">
          <view class="collapse-content">
            去除边框与外层背景，以更轻量的方式组织内容。
          </view>
        </lk-collapse-item>
        <lk-collapse-item name="2" title="适用场景">
          <view class="collapse-content">
            适合嵌在卡片内部、弹窗中或纯文本展示页面。
          </view>
        </lk-collapse-item>
      </lk-collapse>
    </demo-block>

    <demo-block title="禁用状态">
      <lk-collapse v-model="disabledActive">
        <lk-collapse-item name="1" title="正常面板">
          <view class="collapse-content"> 可以正常展开收起 </view>
        </lk-collapse-item>
        <lk-collapse-item name="2" title="禁用面板" disabled>
          <view class="collapse-content"> 此面板已禁用 </view>
        </lk-collapse-item>
      </lk-collapse>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.component-demo {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: var(--lk-spacing-xl);
  }
}
</style>
