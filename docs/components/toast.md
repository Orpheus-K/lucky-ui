---
title: Toast 轻提示
phone: toast
---

# Toast 轻提示

轻量级的全局通知提示，不打断用户流程，自动消失。

## 使用前准备

推荐在主页面或业务根布局使用 `LkRoot`。Root 会自动挂载 Toast 宿主：

```vue
<template>
  <lk-root>
    <page-layout />
  </lk-root>
</template>
```

如果暂不使用 `LkRoot`，也可以直接放置低层 Toast 管理器：

```vue
<template>
  <view>
    <page-layout />
    <lk-toast-manager />
  </view>
</template>
```

同一页面只保留一个 Toast 宿主。使用 `LkRoot` 默认配置时，不要再额外挂载 `<lk-toast-manager />`。

## 基础用法

```vue
<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui/components/lk-toast/toast-manager';

function showMsg() {
  toastStore.show('操作成功！');
}
</script>

<template>
  <lk-button @click="showMsg">显示 Toast</lk-button>
</template>
```

## 不同位置

```vue
<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui';

function top() {
  toastStore.show({ message: '顶部提示', position: 'top' });
}
function center() {
  toastStore.show({ message: '居中提示', position: 'center' });
}
function bottom() {
  toastStore.show({ message: '底部提示', position: 'bottom' });
}
</script>

<template>
  <view class="demo-row">
    <lk-button @click="top">顶部</lk-button>
    <lk-button @click="center">居中</lk-button>
    <lk-button @click="bottom">底部</lk-button>
  </view>
</template>
```

## 自定义时长

```vue
<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui';

function show1s() {
  toastStore.show({ message: '显示 1 秒', duration: 1000 });
}
function show4s() {
  toastStore.show({ message: '显示 4 秒', duration: 4000 });
}
function stay() {
  toastStore.show({ message: '不自动关闭', duration: 0 });
}
</script>

<template>
  <view class="demo-row">
    <lk-button @click="show1s">1 秒</lk-button>
    <lk-button @click="show4s">4 秒</lk-button>
    <lk-button @click="stay">不关闭</lk-button>
  </view>
</template>
```

## 动画效果

```vue
<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui';
</script>

<template>
  <view class="demo-row">
    <lk-button @click="toastStore.show({ message: 'slide-up', transition: 'slide-up' })">
      SlideUp
    </lk-button>
    <lk-button @click="toastStore.show({ message: 'fade', transition: 'fade' })"> Fade </lk-button>
    <lk-button @click="toastStore.show({ message: 'zoom', transition: 'zoom' })"> Zoom </lk-button>
  </view>
</template>
```

## 手动关闭

```vue
<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui';
import { ref } from 'vue';

const toastId = ref<number | null>(null);

function open() {
  toastId.value = toastStore.show({ message: '长时间 Toast，点击关闭', duration: 0 });
}

function close() {
  if (toastId.value !== null) {
    toastStore.close(toastId.value);
    toastId.value = null;
  }
}
</script>

<template>
  <lk-button @click="open">打开</lk-button>
  <lk-button variant="outline" @click="close">关闭</lk-button>
</template>
```

## 受控 Toast 生命周期

直接使用 `LkToast` 时，`v-model` 是显示状态的唯一来源。组件在每次从隐藏进入显示时触发一次 `open` 并重新计算自动关闭计时；计时到期会请求 `update:modelValue=false`，只有实际观察到 `v-model=false` 才触发 `close`。若父层拒绝这次更新并保持显示，组件不会误报关闭，也不会进行微任务忙重试，而是在又一个完整的正数 `duration` 后重新请求。无论关闭来自计时还是外部把 `v-model` 改为 `false`，本轮都只触发一次 `close`，离场动画真正结束后只触发一次 `after-leave`。

```vue
<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(true);
const openCount = ref(0);
const closeCount = ref(0);
const afterLeaveCount = ref(0);

function onOpen() {
  openCount.value += 1;
}

function onClose() {
  closeCount.value += 1;
}

function onAfterLeave() {
  afterLeaveCount.value += 1;
}
</script>

<template>
  <lk-toast
    v-model="visible"
    message="保存成功"
    :duration="1600"
    @open="onOpen"
    @close="onClose"
    @after-leave="onAfterLeave"
  />
  <lk-button @click="visible = false">手动关闭</lk-button>
  <text> open={{ openCount }} / close={{ closeCount }} / after-leave={{ afterLeaveCount }} </text>
</template>
```

每个已交付给 Toast 的 `false → true` 边沿都会取消上一轮尚未到期的计时和离场完成信号，并为新一轮重新计时。若父组件在同一个 Vue 渲染批次内先写 `false` 再写 `true`，子组件只会收到最终的 `true`，因此这不构成一次关闭和重开；需要把 `false` 作为真实边沿交付时，应在写入 `false` 后等待一次 `nextTick()` 再重开。显示期间修改 `duration` 会从修改时刻重新计算：改为正数会按新时长调度，改为 `0` 会立即取消自动关闭。组件卸载时也会废弃计时，不会在卸载后继续发出更新或生命周期事件。`duration=0` 表示不自动关闭。

## 遮罩与点击拦截

直接使用 `LkToast` 时，`overlay` 只控制是否绘制遮罩底色，`forbidClick` 只控制是否拦截对底层页面的点击。两者彼此独立：需要“透明但禁止操作”的加载提示时只开启 `forbidClick`；需要展示底色但允许页面继续操作时只开启 `overlay`。

| `overlay` | `forbidClick` | 遮罩底色 | 底层页面点击 |
| --------- | ------------- | -------- | ------------ |
| `false`   | `false`       | 无       | 允许         |
| `true`    | `false`       | 有       | 允许         |
| `false`   | `true`        | 无       | 拦截         |
| `true`    | `true`        | 有       | 拦截         |

关闭 Toast 后，拦截层会和 Toast 一起完成离场动画，再释放底层点击，避免动画仍可见时页面已经提前可操作。若父组件在关闭的同一个渲染批次内把 `overlay` 或 `forbidClick` 重置为 `false`，本轮离场仍冻结关闭前最后一次可见配置；显示期间修改这两个属性则会立即生效。离场途中快速重开时，新一轮使用重开时的当前配置，上一轮已取消的离场完成信号不得移除新一轮节点。

## API

### toastStore 方法

| 方法  | 说明                         | 参数                     | 返回值       |
| ----- | ---------------------------- | ------------------------ | ------------ |
| show  | 显示 Toast                   | `string \| ToastOptions` | `id: number` |
| close | 关闭指定 Toast（带退出动画） | `(id: number) => void`   | —            |
| clear | 关闭所有 Toast               | `() => void`             | —            |

### ToastOptions

| 参数        | 说明                             | 类型                        | 默认值     |
| ----------- | -------------------------------- | --------------------------- | ---------- |
| customClass | 组件可视根节点自定义类名         | `string \| object \| array` | `''`       |
| customStyle | 组件可视根节点自定义样式         | `string \| object`          | `''`       |
| message     | 提示内容                         | `string`                    | —          |
| duration    | 自动关闭时长（ms），0 表示不关闭 | `number`                    | `2000`     |
| position    | 显示位置                         | `top \| center \| bottom`   | `center`   |
| transition  | 动画效果                         | `slide-up \| fade \| zoom`  | `slide-up` |

### LkToast 遮罩 Props

| 参数        | 说明                     | 类型      | 默认值  |
| ----------- | ------------------------ | --------- | ------- |
| overlay     | 是否绘制遮罩底色         | `boolean` | `false` |
| forbidClick | 是否拦截对底层页面的点击 | `boolean` | `false` |

### LkToastManager 组件

| 参数        | 说明                     | 类型                        | 默认值 |
| ----------- | ------------------------ | --------------------------- | ------ |
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''`   |
| customStyle | 组件可视根节点自定义样式 | `string \| object`          | `''`   |
| zIndex      | 全局 Toast 宿主层级      | `number`                    | `2000` |

### Events

| 事件名            | 说明                         | 回调参数           |
| ----------------- | ---------------------------- | ------------------ |
| update:modelValue | 显隐状态变化，用于 `v-model` | `(value: boolean)` |
| open              | Toast 显示时触发             | `()`               |
| close             | Toast 关闭时触发             | `()`               |
| after-leave       | 离开动画结束后触发           | `()`               |

## 发布验收

`lk-toast` 已纳入 needs-hardening showcase 回归，发布前按下面边界验收：

| 场景       | 验收方式  | 要点                                                                                    |
| ---------- | --------- | --------------------------------------------------------------------------------------- |
| 展示台基线 | 自动回归  | `tests/visual/needs-hardening-showcase.spec.ts` 校验组件路由、verified 状态与中风险标记 |
| 全局管理   | 自动/人工 | 多个 Toast 连续触发时 id、关闭动画和 `clear()` 行为稳定                                 |
| 定位与时序 | 人工验收  | `top/center/bottom` 与自动关闭时长在 H5/App/小程序端一致                                |

### H5 与微信小程序 Peekit 验收

Toast 演练页提供了不依赖文案和 DOM 层级的稳定选择器：

| 选择器                              | 用途                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `#toast-lifecycle-fixture`          | 读取 `data-toast-visible`、`data-toast-open-count`、`data-toast-close-count`、`data-toast-after-leave-count` |
| `#toast-lifecycle-open`             | 开始一轮新的受控 Toast                                                                                       |
| `#toast-lifecycle-close`            | 在 duration 到期前手动关闭                                                                                   |
| `#toast-lifecycle-rapid-reopen`     | 触发一次关闭并在下一次响应式刷新后立即重开                                                                   |
| `#toast-blocker-fixture`            | 读取四态模式、显隐状态与底层按钮点击计数                                                                     |
| `#toast-blocker-mode-*`             | 切换 `none/visual/lock/visual-lock` 四种组合                                                                 |
| `#toast-blocker-under-button`       | 在遮罩覆盖区域重放底层点击                                                                                   |
| `#toast-blocker-close`              | 同批关闭并把两项配置重置为 `false`，验证离场仍冻结上一份配置                                                 |
| `#toast-blocker-close-reset-forbid` | 同批关闭且只重置 `forbidClick`，验证离场期间仍维持点击拦截                                                   |
| `#toast-blocker-rapid-none`         | 交付一次真实关闭边沿后立即重开为无视觉、无拦截                                                               |
| `#toast-blocker-rapid-visual`       | 交付一次真实关闭边沿后立即重开为仅视觉遮罩                                                                   |

H5 和微信小程序必须分别通过 Peekit 连接真实运行页并留存查询结果或快照，按同一套断言验收：

1. 重新载入演练页。初始 `open=1`；经过 `1600ms + 260ms` 后，状态必须收敛为 `visible=false / close=1 / after-leave=1`，且继续等待不再增长。
2. 点击 `#toast-lifecycle-open`，在 1600ms 内点击 `#toast-lifecycle-close`。本轮三个计数各只增加 1；继续等待超过原 duration，计数不得再次变化。
3. 再次打开后点击 `#toast-lifecycle-rapid-reopen`。等待 300ms 时必须仍为 `visible=true`，上一轮的 `after-leave` 不得增加；新一轮到期后 `close` 与 `after-leave` 才各增加 1。
4. 全流程页面错误与控制台错误均为 0，截图中 Toast 位置、文字和离场后的页面布局无跳动。

遮罩与点击拦截还必须在同一页面逐一重放四种组合：只有 `overlay=true` 时 `.lk-toast__overlay` 的 computed background 才能为非透明；只有 `forbidClick=true` 时点击 `#toast-blocker-under-button` 不得增加 `data-under-click-count`。在 `visual-lock` 模式点击 `#toast-blocker-close` 后，fixture 必须立即显示两项配置都已重置，但离场动画结束前遮罩节点仍保留 `is-visible/is-lock` 且底层点击仍被拦截；动画结束后节点移除并恢复点击。`#toast-blocker-close-reset-forbid` 必须证明仅重置 `forbidClick` 也不会提前解锁。两种快速重开动作等待超过旧离场时限后，新 Toast 及其 `none/visual` 当前配置仍必须存在，并且 `data-after-leave-count` 不得被旧轮次增加。每一步都要保存 fixture 属性、遮罩节点数量、computed background/pointer-events、点击前后计数和页面错误。

H5 构建、微信小程序构建和单元测试只是静态门禁，不能替代以上两端运行态证据；任一端未实际连接时，应明确记录为“未验收”，不能标记为通过。
