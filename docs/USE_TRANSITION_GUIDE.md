# useTransition - 过渡动画 Composable

一个灵活、高性能的动画解决方案，采用 Composable 设计，避免了额外的 DOM 层级。

## 为什么不用组件？

### 组件方式的问题
```vue
<!-- ❌ 组件方式 - 增加 DOM 层级 -->
<lk-transition :show="visible" name="fade-up">
  <view class="modal">...</view>
</lk-transition>
```

问题：
- 增加了额外的 DOM 层级
- 影响 fixed/absolute 定位
- z-index 管理复杂
- 组件实例创建和销毁的性能开销

### Composable 方式的优势
```vue
<!-- ✅ Composable 方式 - 无额外 DOM -->
<view v-if="display" :class="classes" :style="styles" class="modal">
  ...
</view>
```

优势：
- 无额外 DOM 层级
- 直接控制元素，定位准确
- 性能更好
- 更加灵活

## 基础用法

### 1. 在组件中使用

```vue
<template>
  <view v-if="display" :class="classes" :style="styles" class="my-component">
    <text>Hello World</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTransition } from '@/uni_modules/lucky-ui/composables';

const visible = ref(false);

const { classes, styles, display } = useTransition(
  () => visible.value,
  { name: 'fade-up', duration: 300 }
);

// 显示
const show = () => {
  visible.value = true;
};

// 隐藏
const hide = () => {
  visible.value = false;
};
</script>
```

### 2. 带回调的使用

```vue
<script setup lang="ts">
import { useTransition } from '@/uni_modules/lucky-ui/composables';

const { classes, styles, display } = useTransition(
  () => visible.value,
  { 
    name: 'zoom-in', 
    duration: 300,
    easing: 'ease-out-back'
  },
  {
    onBeforeEnter: () => console.log('开始进入'),
    onAfterEnter: () => console.log('进入完成'),
    onBeforeLeave: () => console.log('开始离开'),
    onAfterLeave: () => console.log('离开完成'),
  }
);
</script>
```

## API

### useTransition

```typescript
function useTransition(
  show: () => boolean,
  config?: TransitionConfig,
  callbacks?: TransitionCallbacks
): {
  classes: ComputedRef<string>;
  styles: ComputedRef<CSSProperties>;
  display: ComputedRef<boolean>;
  state: ComputedRef<TransitionState>;
  elRef: Ref<any | null>;        // 可选：绑定目标元素以启用事件驱动的精确结束
  cancel: () => void;            // 取消当前动画（清理计时器/监听），不改变显示状态
}
```

#### 参数

**show**: `() => boolean`
- 控制显示/隐藏的响应式函数

**config**: `TransitionConfig`
```typescript
{
  name?: string;        // 动画名称，默认 'fade'
  duration?: number;    // 持续时间(ms)，默认 300
  delay?: number;       // 延迟时间(ms)，默认 0
  easing?: string;      // 缓动函数，默认 'ease'
  appear?: boolean;     // 初次为 true 时是否执行进入动画，默认 true；false 则初次直接激活
  // 阶段样式（可选，按需覆盖）
  enterFrom?: CSSProperties | (() => CSSProperties);
  enterTo?: CSSProperties | (() => CSSProperties);
  leaveFrom?: CSSProperties | (() => CSSProperties);
  leaveTo?: CSSProperties | (() => CSSProperties);
  // 事件驱动完成（可选）
  target?: Ref<HTMLElement | null>; // 提供元素引用将使用 transitionend/animationend 精确结束
  useEvents?: boolean;   // 默认 true，target 存在时生效
}
```

**callbacks**: `TransitionCallbacks`
```typescript
{
  onBeforeEnter?: () => void;
  onEnter?: () => void;
  onAfterEnter?: () => void;
  onBeforeLeave?: () => void;
  onLeave?: () => void;
  onAfterLeave?: () => void;
}
```

#### 返回值

- `classes`: 动画类名（字符串）
- `styles`: 动画样式对象（含 CSS 变量：--lk-transition-duration/ delay/ easing）
- `display`: 是否显示（用于 v-if）
- `state`: 动画状态对象
- `elRef`: 目标元素引用；当提供时将启用基于 transitionend/animationend 的精确结束
- `cancel`: 取消当前动画（清理计时器与监听）

## 动画类型

### Fade - 淡入淡出
```typescript
'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' |
'fade-up-left' | 'fade-up-right' | 'fade-down-left' | 'fade-down-right'
```

### Slide - 滑动
```typescript
'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
```

### Zoom - 缩放
```typescript
'zoom-in' | 'zoom-in-up' | 'zoom-in-down' | 'zoom-in-left' | 'zoom-in-right' |
'zoom-out' | 'zoom-out-up' | 'zoom-out-down' | 'zoom-out-left' | 'zoom-out-right'
```

### Flip - 翻转
```typescript
'flip-left' | 'flip-right' | 'flip-up' | 'flip-down'
```

### Bounce - 弹跳
```typescript
'bounce-in' | 'bounce-in-up' | 'bounce-in-down' | 
'bounce-in-left' | 'bounce-in-right'
```

### Rotate - 旋转
```typescript
'rotate-in' | 'rotate-in-up-left' | 'rotate-in-up-right' |
'rotate-in-down-left' | 'rotate-in-down-right'
```

## 缓动函数

```typescript
'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' |
'ease-in-sine' | 'ease-out-sine' | 'ease-in-out-sine' |
'ease-in-cubic' | 'ease-out-cubic' | 'ease-in-out-cubic' |
'ease-in-back' | 'ease-out-back' | 'ease-in-out-back'
```

## 使用场景

### 模态框
```vue
<script setup lang="ts">
import { useTransition } from '@/uni_modules/lucky-ui/composables';

const visible = ref(false);
const { classes, styles, display, elRef } = useTransition(
  () => visible.value,
  { name: 'zoom-in', duration: 250, easing: 'ease-out' }
);
</script>

<template>
  <view ref="elRef" v-if="display" :class="['modal', classes]" :style="styles">
    <!-- 模态框内容 -->
  </view>
</template>
```

### Toast 提示
```vue
<script setup lang="ts">
const { classes, styles, display } = useTransition(
  () => visible.value,
  { name: 'zoom-in', duration: 260 }
);
</script>

<template>
  <view v-if="display" :class="['toast', classes]" :style="styles">
    <text>{{ message }}</text>
  </view>
</template>
```

### 列表交错动画
```vue
<script setup lang="ts">
import { useTransition } from '@/uni_modules/lucky-ui/composables';

const items = ref([...]);
const visible = ref(false);

// 为每个项目创建独立的动画
const itemAnimations = computed(() => 
  items.value.map((_, index) => 
    useTransition(
      () => visible.value,
      { 
        name: 'fade-right', 
        duration: 300,
        delay: index * 50  // 交错延迟
      }
    )
  )
);
</script>

<template>
  <view
    v-for="(item, index) in items"
    v-if="itemAnimations[index].display.value"
    :key="item.id"
    :class="['list-item', itemAnimations[index].classes.value]"
    :style="itemAnimations[index].styles.value"
  >
    {{ item.text }}
  </view>
</template>
```

## 静态工具函数

### getTransitionClass

获取动画类名（不需要响应式）：

```typescript
import { getTransitionClass } from '@/uni_modules/lucky-ui/composables';

const className = getTransitionClass('fade-up', true);
// 返回: 'lk-transition lk-transition-fade-up lk-transition-active'
```

### getTransitionStyle

获取动画样式（不需要响应式）：

```typescript
import { getTransitionStyle } from '@/uni_modules/lucky-ui/composables';

const style = getTransitionStyle({
  duration: 300,
  delay: 100,
  easing: 'ease-out'
});
// 返回: { transitionDuration: '300ms', ... }
```

## 与组件方式的对比

| 特性 | Composable | 组件 |
|------|-----------|------|
| DOM 层级 | ✅ 无额外层级 | ❌ 增加一层 |
| 定位控制 | ✅ 精确 | ⚠️ 可能受影响 |
| 性能 | ✅ 更好 | ⚠️ 额外开销 |
| 灵活性 | ✅ 极高 | ⚠️ 受限 |
| z-index | ✅ 好管理 | ⚠️ 复杂 |
| 学习成本 | ⚠️ 稍高 | ✅ 低 |

## 注意事项

1. **必须配合 v-if 使用**
   ```vue
   <view v-if="display" :class="classes" :style="styles">
     <!-- 使用 display，不是 show -->
   </view>
   ```

2. **样式需要引入**
   - 确保全局引入了 transition 样式文件
   - 或在组件中单独引入
  - 我们已在主题入口引入 `base/animations`，通常无需额外操作

3. **类名合并**
   ```vue
   <view :class="['my-class', classes]" :style="{ ...myStyle, ...styles }">
   ```

4. **性能优化**
   - 避免同时动画过多元素
   - 使用合理的 duration
   - 考虑使用虚拟滚动处理长列表

5. **事件驱动精确结束（可选）**
  - 若需要依赖 transitionend/animationend 精确结束，给目标元素绑定 `elRef`
  - 未绑定时仍会使用持续时间+延迟的超时兜底逻辑

6. **首次出现(appear)**
  - 默认 `appear: true`，即 `show()` 首次为 true 时会执行进入动画
  - 如需首次直接显示而不执行动画，设置 `appear: false`

7. **阶段样式 from/to（可选）**
  - `enterFrom/enterTo/leaveFrom/leaveTo` 可用于细粒度样式控制（如自定义 transform/opacity）
  - 它们会在相应阶段通过内联样式与基础样式合并

## 完整示例

```vue
<template>
  <view class="demo">
    <button @click="toggle">切换</button>
    
    <view 
      v-if="display" 
      :class="['card', classes]" 
      :style="{ ...styles, padding: '20px' }"
    >
      <text>这是一个带动画的卡片</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTransition } from '@/uni_modules/lucky-ui/composables';

const visible = ref(false);

const { classes, styles, display, state } = useTransition(
  () => visible.value,
  { 
    name: 'zoom-in', 
    duration: 400,
    easing: 'ease-out-back'
  },
  {
    onAfterEnter: () => console.log('动画进入完成'),
    onAfterLeave: () => console.log('动画离开完成'),
  }
);

const toggle = () => {
  visible.value = !visible.value;
};

// 可以访问动画状态
watch(() => state.value, (newState) => {
  console.log('动画状态:', newState);
});
</script>

<style>
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
```

## 总结

`useTransition` 提供了一个高性能、灵活的动画解决方案：

- ✅ **无额外 DOM** - 直接应用到目标元素
- ✅ **完全控制** - 精确控制样式和行为
- ✅ **TypeScript** - 完整类型支持
- ✅ **灵活** - 支持各种使用场景
- ✅ **高性能** - 避免不必要的组件开销
