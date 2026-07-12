---
title: Animation 动画
---

# Animation 动画

Lucky UI 的弹层类组件统一复用 `useTransition` 的内置动画。凡是组件暴露 `animationType` prop，都可以传入下面任意一个内置动画类型。

## animation 与 animationType

| 参数 | 说明 | 取值 |
|------|------|------|
| animation | 动画预设名称，适合快速套用统一节奏 | `quick` / `normal` / `slow` / `bounce` / `scale` |
| animationType | 内置动画类型，直接指定最终过渡效果 | 见下方 `TransitionName` 列表 |
| duration | 动画持续时间，单位 ms | `number` |
| delay | 动画延迟时间，单位 ms | `number` |
| easing | 动画缓动函数 | 见下方缓动函数列表 |

当同一个组件同时传入 `animation` 和 `animationType` 时，`animationType` 优先级更高。

## 适用组件

以下组件的 `animationType` 均支持完整的内置动画类型：

| 组件 | 说明 |
|------|------|
| [Modal 模态框](./modal) | 对话框入场与离场动画 |
| [Popup 弹出层](./popup) | 浮层入场与离场动画 |
| [Action Sheet 动作面板](./action-sheet) | 面板入场与离场动画 |
| [Tooltip 文字提示](./tooltip) | 提示层入场与离场动画 |
| [Dropdown 下拉菜单](./dropdown) | 菜单入场与离场动画 |

## 基础用法

```vue
<lk-dropdown animation-type="dropdown" :duration="180" easing="ease-out-cubic">
  <lk-button>更多操作</lk-button>
  <template #menu>
    <lk-dropdown-item name="edit">编辑</lk-dropdown-item>
  </template>
</lk-dropdown>
```

```vue
<lk-popup v-model="show" animation-type="fade-up" :duration="220" easing="ease-out">
  <view style="padding:32rpx">内容</view>
</lk-popup>
```

## 内置动画类型

方向描述默认指入场效果；离场时会按同一轨迹反向收起。

### Dropdown

`dropdown` 是菜单类组件使用的展开动画，会结合组件设置的展开方向调整动效起点。

| 类型 | 中文含义 |
|------|----------|
| `dropdown` | 菜单从触发器边缘自然展开，适合 Dropdown、菜单、轻量浮层 |

### Fade

| 类型 | 中文含义 |
|------|----------|
| `fade` | 原地淡入淡出 |
| `fade-up` | 从下方向上淡入 |
| `fade-down` | 从上方向下淡入 |
| `fade-left` | 从左侧向右淡入 |
| `fade-right` | 从右侧向左淡入 |
| `fade-up-left` | 从左上方向右下淡入 |
| `fade-up-right` | 从右上方向左下淡入 |
| `fade-down-left` | 从左下方向右上淡入 |
| `fade-down-right` | 从右下方向左上淡入 |

### Slide

| 类型 | 中文含义 |
|------|----------|
| `slide-up` | 从下方滑入 |
| `slide-down` | 从上方滑入 |
| `slide-left` | 从左侧滑入 |
| `slide-right` | 从右侧滑入 |

### Zoom

| 类型 | 中文含义 |
|------|----------|
| `zoom-in` | 由小到大缩放进入 |
| `zoom-in-up` | 从下方轻微上浮并放大进入 |
| `zoom-in-down` | 从上方轻微下移并放大进入 |
| `zoom-in-left` | 从左侧轻微右移并放大进入 |
| `zoom-in-right` | 从右侧轻微左移并放大进入 |
| `zoom-out` | 由大到正常尺寸缩放进入 |
| `zoom-out-up` | 从下方轻微上浮并缩小到正常尺寸 |
| `zoom-out-down` | 从上方轻微下移并缩小到正常尺寸 |
| `zoom-out-left` | 从左侧轻微右移并缩小到正常尺寸 |
| `zoom-out-right` | 从右侧轻微左移并缩小到正常尺寸 |

### Flip

| 类型 | 中文含义 |
|------|----------|
| `flip-left` | 绕 Y 轴从左侧翻转进入 |
| `flip-right` | 绕 Y 轴从右侧翻转进入 |
| `flip-up` | 绕 X 轴从上方翻转进入 |
| `flip-down` | 绕 X 轴从下方翻转进入 |

### Bounce

| 类型 | 中文含义 |
|------|----------|
| `bounce-in` | 原地弹性缩放进入 |
| `bounce-in-up` | 从下方弹入 |
| `bounce-in-down` | 从上方弹入 |
| `bounce-in-left` | 从左侧弹入 |
| `bounce-in-right` | 从右侧弹入 |

### Rotate

| 类型 | 中文含义 |
|------|----------|
| `rotate-in` | 原地旋转进入 |
| `rotate-in-up-left` | 以上左角为轴旋转进入 |
| `rotate-in-up-right` | 以上右角为轴旋转进入 |
| `rotate-in-down-left` | 以下左角为轴旋转进入 |
| `rotate-in-down-right` | 以下右角为轴旋转进入 |

## 动画预设

`animation` 传入的是预设名，不是动画类型。预设会自动带出默认动画类型、时长和缓动函数。

| 预设 | 默认动画 | 默认时长 | 默认缓动 |
|------|----------|----------|----------|
| quick | `fade-up` | `200` | `ease-out` |
| normal | `fade-up` | `300` | `ease` |
| slow | `fade-up` | `500` | `ease-in-out` |
| bounce | `bounce-in-up` | `600` | `ease-out-back` |
| scale | `zoom-in` | `300` | `ease-out-cubic` |

## 缓动函数

| 缓动函数 | 中文含义 | 适用场景 |
|----------|----------|----------|
| `linear` | 匀速运动 | 进度、循环、机械式位移 |
| `ease` | 默认缓入缓出 | 通用过渡，不强调方向和节奏时使用 |
| `ease-in` | 慢启动，后段加速 | 元素离场、收起、逐渐离开视线 |
| `ease-out` | 快启动，后段减速 | 元素入场、弹层展开、按钮反馈 |
| `ease-in-out` | 两端慢，中段快 | 页面切换、较长距离位移 |
| `ease-in-sine` | 柔和慢启动 | 轻量离场、弱提示收起 |
| `ease-out-sine` | 柔和减速进入 | 轻量入场、Tooltip、Dropdown |
| `ease-in-out-sine` | 柔和缓入缓出 | 不希望动效过强的通用过渡 |
| `ease-in-cubic` | 明显加速离场 | 弹层收起、菜单关闭、内容退出 |
| `ease-out-cubic` | 明显减速入场 | 推荐用于菜单、弹层、卡片入场 |
| `ease-in-out-cubic` | 强一点的缓入缓出 | 页面级切换、较大面积组件位移 |
| `ease-in-back` | 先轻微反向再加速离场 | 有回拉感的关闭动效 |
| `ease-out-back` | 入场时轻微越界回弹 | 弹性按钮、强调型弹层、成功反馈 |
| `ease-in-out-back` | 两端都有轻微回拉/回弹 | 强表现型动效，谨慎用于小组件 |

也可以直接传入标准 CSS easing，例如：

```vue
<lk-modal animation-type="zoom-in" easing="cubic-bezier(0.16, 1, 0.3, 1)" />
```

## useTransition

组件内部统一通过 `useTransition` 管理进入和离开状态。业务组件也可以直接使用它：

```ts
import { useTransition } from '@/uni_modules/lucky-ui/composables';

const { classes, styles, display } = useTransition(
  () => visible.value,
  { name: 'fade-up', duration: 300, easing: 'ease-out-cubic' }
);
```

更多 hook 参数和状态说明见 [Hooks 与工具](./hooks-utils#usetransition)。
