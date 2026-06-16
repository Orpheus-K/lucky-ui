"""写入表单 + 反馈 + 导航组件文档"""
import os

BASE = r'f:\luckyone\ui\docs\components'

def w(rel, content):
    p = os.path.join(BASE, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  ✓ {rel}')

# ─── Radio ───────────────────────────────────────────────────────────────────
w('radio.md', """\
---
title: Radio 单选框
phone: radio
---

# Radio 单选框

在一组选项中进行单项选择，通常配合 `RadioGroup` 使用。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
const checked = ref('A')
</script>

<template>
  <lk-radio-group v-model="checked">
    <lk-radio name="A">选项 A</lk-radio>
    <lk-radio name="B">选项 B</lk-radio>
    <lk-radio name="C">选项 C</lk-radio>
  </lk-radio-group>
  <view>当前选中：{{ checked }}</view>
</template>
```

## 横向排列

```vue
<script setup lang="ts">
import { ref } from 'vue'
const plan = ref('lite')
</script>

<template>
  <lk-radio-group v-model="plan" direction="row">
    <lk-radio name="lite">基础版</lk-radio>
    <lk-radio name="pro">专业版</lk-radio>
    <lk-radio name="enterprise">企业版</lk-radio>
  </lk-radio-group>
</template>
```

## 图标类型

```vue
<template>
  <!-- dot（默认）：选中显示中心圆点 -->
  <lk-radio-group v-model="val" icon-type="dot">
    <lk-radio name="1">选项 1</lk-radio>
    <lk-radio name="2">选项 2</lk-radio>
  </lk-radio-group>

  <!-- check：选中显示勾选图标 -->
  <lk-radio-group v-model="val" icon-type="check">
    <lk-radio name="1">选项 1</lk-radio>
    <lk-radio name="2">选项 2</lk-radio>
  </lk-radio-group>
</template>
```

## 方形外观

```vue
<template>
  <lk-radio-group v-model="val" shape="square">
    <lk-radio name="yes">同意</lk-radio>
    <lk-radio name="no">不同意</lk-radio>
  </lk-radio-group>
</template>
```

## 禁用状态

```vue
<template>
  <!-- 整组禁用 -->
  <lk-radio-group v-model="val" disabled>
    <lk-radio name="A">选项 A（禁用）</lk-radio>
    <lk-radio name="B">选项 B（禁用）</lk-radio>
  </lk-radio-group>

  <!-- 单项禁用 -->
  <lk-radio-group v-model="val2">
    <lk-radio name="X">可选</lk-radio>
    <lk-radio name="Y" disabled>不可选</lk-radio>
    <lk-radio name="Z">可选</lk-radio>
  </lk-radio-group>
</template>
```

## 自定义选中颜色

```vue
<template>
  <lk-radio-group v-model="val" active-color="#f59e0b">
    <lk-radio name="gold">黄金选项</lk-radio>
    <lk-radio name="silver">白银选项</lk-radio>
  </lk-radio-group>
</template>
```

## 与表单结合

```vue
<script setup lang="ts">
import { ref } from 'vue'
const gender = ref('male')
const agree = ref(false)
</script>

<template>
  <lk-form>
    <lk-form-item label="性别" required>
      <lk-radio-group v-model="gender" direction="row">
        <lk-radio name="male">男</lk-radio>
        <lk-radio name="female">女</lk-radio>
      </lk-radio-group>
    </lk-form-item>
  </lk-form>
</template>
```

## API

### RadioGroup Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值（v-model） | `string \\| number \\| boolean` | `''` |
| direction | 排列方向 | `row \\| column` | `row` |
| shape | 外观形状 | `circle \\| square` | `circle` |
| iconType | 图标样式 | `dot \\| check` | `dot` |
| size | 尺寸 | `sm \\| md \\| lg` | `md` |
| disabled | 是否全部禁用 | `boolean` | `false` |
| activeColor | 选中颜色 | `string` | — |

### RadioGroup Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 绑定值变化 | `(value: any) => void` |
| change | 选项改变 | `(value: any) => void` |

### Radio Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 唯一标识符（作为选中值） | `string \\| number \\| boolean` | `''` |
| label | 标签文字（等价于 default slot） | `string` | `''` |
| disabled | 是否禁用该项 | `boolean` | `false` |
| labelDisabled | 点击文字是否触发选择 | `boolean` | `false` |
| shape | 覆盖 group 的形状 | `circle \\| square` | — |
| iconType | 覆盖 group 的图标类型 | `dot \\| check` | — |
| activeColor | 覆盖 group 的选中色 | `string` | — |
| iconSize | 图标尺寸 | `string \\| number` | — |

### Radio Slots

| 插槽名 | 说明 |
|--------|------|
| default | 标签内容 |
| icon | 自定义选中图标（参数：`{ checked, disabled }`） |
""")

# ─── Input ───────────────────────────────────────────────────────────────────
w('input.md', """\
---
title: Input 输入框
phone: input
---

# Input 输入框

单行文本输入框，支持清空、前缀图标、字数统计等常见功能。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
const val = ref('')
</script>

<template>
  <lk-input v-model="val" placeholder="请输入内容" />
</template>
```

## 输入类型

```vue
<template>
  <view class="demo-col">
    <lk-input type="text" placeholder="文本输入" />
    <lk-input type="password" placeholder="密码输入" />
    <lk-input type="number" placeholder="数字输入" />
    <lk-input type="tel" placeholder="电话号码" />
  </view>
</template>
```

## 前缀图标

```vue
<template>
  <view class="demo-col">
    <lk-input prefix-icon="search" placeholder="搜索..." />
    <lk-input prefix-icon="person" placeholder="用户名" />
    <lk-input prefix-icon="lock" type="password" placeholder="密码" />
    <lk-input prefix-icon="envelope" type="email" placeholder="电子邮箱" />
  </view>
</template>
```

## 尺寸

```vue
<template>
  <view class="demo-col">
    <lk-input size="sm" placeholder="小尺寸" />
    <lk-input size="md" placeholder="中尺寸（默认）" />
    <lk-input size="lg" placeholder="大尺寸" />
  </view>
</template>
```

## 可清空 & 字数统计

```vue
<script setup lang="ts">
import { ref } from 'vue'
const bio = ref('')
</script>

<template>
  <!-- clearable 默认已启用 -->
  <lk-input v-model="bio" placeholder="请输入昵称" clearable />

  <!-- 字数统计（配合 maxlength） -->
  <lk-input
    v-model="bio"
    placeholder="一句话介绍自己"
    :maxlength="50"
    show-count
  />
</template>
```

## 禁用 & 只读

```vue
<template>
  <view class="demo-col">
    <lk-input value="禁用状态" disabled />
    <lk-input value="只读状态" readonly />
  </view>
</template>
```

## 与表单验证结合

```vue
<script setup lang="ts">
import { ref } from 'vue'
const formRef = ref()
const form = ref({ username: '', phone: '' })

async function submit() {
  await formRef.value.validate()
}
</script>

<template>
  <lk-form ref="formRef" :model="form">
    <lk-form-item
      label="用户名"
      prop="username"
      :rules="[{ required: true, message: '请输入用户名' }]"
    >
      <lk-input v-model="form.username" prefix-icon="person" placeholder="请输入用户名" />
    </lk-form-item>
    <lk-form-item
      label="手机号"
      prop="phone"
      :rules="[
        { required: true, message: '请输入手机号' },
        { pattern: /^1[3-9]\\d{9}$/, message: '手机号格式不正确' }
      ]"
    >
      <lk-input v-model="form.phone" type="tel" prefix-icon="phone" placeholder="请输入手机号" />
    </lk-form-item>
    <lk-button block @click="submit">提交</lk-button>
  </lk-form>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值（v-model） | `string \\| number` | `''` |
| type | 输入类型 | `text \\| password \\| number \\| tel \\| email` | `text` |
| size | 尺寸 | `sm \\| md \\| lg` | `md` |
| placeholder | 占位文字 | `string` | `''` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| clearable | 是否显示清空按钮 | `boolean` | `true` |
| maxlength | 最大长度（-1 不限） | `number` | `-1` |
| showCount | 是否显示字数统计 | `boolean` | `false` |
| prefixIcon | 前缀图标名 | `string` | `''` |
| autofocus | 是否自动聚焦 | `boolean` | `false` |
| prop | 表单字段名（配合 Form 校验） | `string` | `''` |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 值变化 | `(value: string) => void` |
| input | 输入时触发 | `(value: string) => void` |
| change | 失焦后值变化时触发 | `(value: string) => void` |
| focus | 聚焦 | `(event: Event) => void` |
| blur | 失焦 | `(event: Event) => void` |
| clear | 点击清空按钮 | `() => void` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| prefix | 前缀自定义内容 |
| suffix | 后缀自定义内容 |
""")

# ─── Switch ───────────────────────────────────────────────────────────────────
w('switch.md', """\
---
title: Switch 开关
phone: switch
---

# Switch 开关

用于开启或关闭某个功能状态，是替代 Checkbox 的更直观表单控件。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
const on = ref(false)
</script>

<template>
  <lk-switch v-model="on" />
  <view>状态：{{ on ? '已开启' : '已关闭' }}</view>
</template>
```

## 尺寸

```vue
<template>
  <view class="demo-row" style="align-items:center">
    <lk-switch size="sm" />
    <lk-switch size="md" />
    <lk-switch size="lg" />
  </view>
</template>
```

## 自定义颜色

```vue
<template>
  <view class="demo-col">
    <lk-switch :model-value="true" active-color="#22c55e" />
    <lk-switch :model-value="true" active-color="#f59e0b" />
    <lk-switch :model-value="true" active-color="#ef4444" />
  </view>
</template>
```

## 禁用与加载

```vue
<template>
  <view class="demo-row">
    <lk-switch :model-value="true" disabled />
    <lk-switch :model-value="false" disabled />
    <lk-switch :model-value="true" loading />
  </view>
</template>
```

## 带文字标签

```vue
<script setup lang="ts">
import { ref } from 'vue'
const receive = ref(true)
const auto = ref(false)
</script>

<template>
  <lk-cell-group>
    <lk-cell title="接收通知">
      <template #value>
        <lk-switch v-model="receive" size="sm" />
      </template>
    </lk-cell>
    <lk-cell title="自动同步">
      <template #value>
        <lk-switch v-model="auto" size="sm" />
      </template>
    </lk-cell>
  </lk-cell-group>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值（v-model） | `boolean` | `false` |
| size | 尺寸 | `sm \\| md \\| lg` | `md` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| activeColor | 开启状态颜色 | `string` | — |
| inactiveColor | 关闭状态颜色 | `string` | — |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 状态变化 | `(value: boolean) => void` |
| change | 状态变化 | `(value: boolean) => void` |
""")

# ─── Modal ───────────────────────────────────────────────────────────────────
w('modal.md', """\
---
title: Modal 模态框
phone: modal
---

# Modal 模态框

带遮罩的对话框，适用于重要信息确认、表单填写等需要打断用户流程的场景。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
const show = ref(false)
</script>

<template>
  <lk-button @click="show = true">打开模态框</lk-button>

  <lk-modal v-model="show" title="提示">
    <view>这是弹框内容，请确认操作。</view>
    <template #footer>
      <lk-button variant="text" @click="show = false">取消</lk-button>
      <lk-button @click="show = false">确认</lk-button>
    </template>
  </lk-modal>
</template>
```

## 确认对话框

```vue
<script setup lang="ts">
import { ref } from 'vue'
const show = ref(false)

function onConfirm() {
  show.value = false
  // 执行删除逻辑...
}
</script>

<template>
  <lk-button type="danger" variant="outline" @click="show = true">删除账号</lk-button>

  <lk-modal v-model="show" title="确认删除">
    <view style="text-align:center; padding: 16rpx 0">
      <lk-icon name="exclamation-triangle-fill" color="#ef4444" :size="48" />
      <view style="margin-top:16rpx">此操作不可撤销，确定要删除账号吗？</view>
    </view>
    <template #footer>
      <lk-button block variant="outline" @click="show = false">取消</lk-button>
      <lk-button block type="danger" @click="onConfirm">确认删除</lk-button>
    </template>
  </lk-modal>
</template>
```

## 无头部弹框

```vue
<script setup lang="ts">
import { ref } from 'vue'
const show = ref(false)
</script>

<template>
  <lk-button @click="show = true">纯内容弹框</lk-button>

  <lk-modal v-model="show" :show-header="false" :show-footer="false">
    <view style="padding:48rpx; text-align:center">
      <lk-icon name="check-circle-fill" color="#22c55e" :size="64" />
      <view style="font-size:36rpx; font-weight:600; margin-top:24rpx">支付成功！</view>
      <view style="color:#64748b; margin-top:8rpx">金额 ¥128.00 已到账</view>
      <lk-button block style="margin-top:48rpx" @click="show = false">我知道了</lk-button>
    </view>
  </lk-modal>
</template>
```

## 表单弹框

```vue
<script setup lang="ts">
import { ref } from 'vue'
const show = ref(false)
const form = ref({ name: '', phone: '' })
</script>

<template>
  <lk-button @click="show = true">填写信息</lk-button>

  <lk-modal v-model="show" title="完善资料" width="640rpx">
    <lk-form :model="form" style="padding:0">
      <lk-form-item label="姓名">
        <lk-input v-model="form.name" placeholder="请输入真实姓名" />
      </lk-form-item>
      <lk-form-item label="手机">
        <lk-input v-model="form.phone" type="tel" placeholder="请输入手机号" />
      </lk-form-item>
    </lk-form>
    <template #footer>
      <lk-button variant="text" @click="show = false">取消</lk-button>
      <lk-button @click="show = false">保存</lk-button>
    </template>
  </lk-modal>
</template>
```

## 动画类型

```vue
<template>
  <view class="demo-row">
    <lk-button @click="show1 = true">缩放（默认）</lk-button>
    <lk-button @click="show2 = true">从下方滑入</lk-button>
    <lk-button @click="show3 = true">渐显</lk-button>
  </view>

  <lk-modal v-model="show1" animation="scale" title="缩放动画">内容</lk-modal>
  <lk-modal v-model="show2" animation="slide-up" title="滑入动画">内容</lk-modal>
  <lk-modal v-model="show3" animation="fade" title="渐显动画">内容</lk-modal>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 是否显示（v-model） | `boolean` | `false` |
| title | 标题文字 | `string` | `''` |
| width | 弹框宽度 | `string` | `600rpx` |
| showClose | 显示右上角关闭按钮 | `boolean` | `true` |
| closeOnOverlay | 点击遮罩关闭 | `boolean` | `true` |
| showHeader | 是否显示标题栏 | `boolean` | `true` |
| showFooter | 是否显示底部区域 | `boolean` | `true` |
| animation | 动画预设 | `scale \\| slide-up \\| fade \\| slide-down` | `scale` |
| zIndex | 层级 | `number` | `1500` |

### Events

| 事件名 | 说明 |
|--------|------|
| update:modelValue | 显示状态变化 |
| open | 弹框打开后 |
| close | 弹框关闭后 |
| confirm | 点击确认按钮 |
| cancel | 点击取消按钮 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 弹框主体内容 |
| header | 自定义头部（会覆盖 title） |
| footer | 自定义底部按钮区域 |
""")

# ─── Toast ───────────────────────────────────────────────────────────────────
w('toast.md', """\
---
title: Toast 轻提示
phone: toast
---

# Toast 轻提示

轻量级的全局通知提示，不打断用户流程，自动消失。

## 使用前准备

在应用入口页面放置 Toast 管理器：

```vue
<!-- App.vue 或根布局 -->
<template>
  <view>
    <router-view />
    <!-- Toast 渲染容器，放在最外层 -->
    <lk-toast-manager />
  </view>
</template>
```

## 基础用法

```vue
<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui/components/lk-toast/toast-manager'

function showMsg() {
  toastStore.show('操作成功！')
}
</script>

<template>
  <lk-button @click="showMsg">显示 Toast</lk-button>
</template>
```

## 不同位置

```vue
<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui'

function top() { toastStore.show({ message: '顶部提示', position: 'top' }) }
function center() { toastStore.show({ message: '居中提示', position: 'center' }) }
function bottom() { toastStore.show({ message: '底部提示', position: 'bottom' }) }
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
import { toastStore } from '@/uni_modules/lucky-ui'

function show1s() { toastStore.show({ message: '显示 1 秒', duration: 1000 }) }
function show4s() { toastStore.show({ message: '显示 4 秒', duration: 4000 }) }
function stay() { toastStore.show({ message: '不自动关闭', duration: 0 }) }
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
import { toastStore } from '@/uni_modules/lucky-ui'
</script>

<template>
  <view class="demo-row">
    <lk-button @click="toastStore.show({ message: 'slide-up', transition: 'slide-up' })">
      SlideUp
    </lk-button>
    <lk-button @click="toastStore.show({ message: 'fade', transition: 'fade' })">
      Fade
    </lk-button>
    <lk-button @click="toastStore.show({ message: 'zoom', transition: 'zoom' })">
      Zoom
    </lk-button>
  </view>
</template>
```

## 手动关闭

```vue
<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui'
import { ref } from 'vue'

const toastId = ref<number | null>(null)

function open() {
  toastId.value = toastStore.show({ message: '长时间 Toast，点击关闭', duration: 0 })
}

function close() {
  if (toastId.value !== null) {
    toastStore.close(toastId.value)
    toastId.value = null
  }
}
</script>

<template>
  <lk-button @click="open">打开</lk-button>
  <lk-button variant="outline" @click="close">关闭</lk-button>
</template>
```

## API

### toastStore 方法

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| show | 显示 Toast | `string \\| ToastOptions` | `id: number` |
| close | 关闭指定 Toast（带退出动画） | `(id: number) => void` | — |
| clear | 关闭所有 Toast | `() => void` | — |

### ToastOptions

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| message | 提示内容 | `string` | — |
| duration | 自动关闭时长（ms），0 表示不关闭 | `number` | `2000` |
| position | 显示位置 | `top \\| center \\| bottom` | `center` |
| transition | 动画效果 | `slide-up \\| fade \\| zoom` | `slide-up` |

### LkToastManager 组件

无需传入 Props，直接放置在根节点即可（全局单例）。
""")

# ─── Modal 同时写 popup ──────────────────────────────────────────────────────
w('popup.md', """\
---
title: Popup 弹出层
phone: popup
---

# Popup 弹出层

从屏幕四个方向弹出的浮层容器，适合抽屉菜单、选择面板、半屏表单等场景。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
const show = ref(false)
</script>

<template>
  <lk-button @click="show = true">从底部弹出</lk-button>

  <lk-popup v-model="show" position="bottom">
    <view style="padding:48rpx; text-align:center">
      <view style="font-size:32rpx; font-weight:600">底部弹出内容</view>
      <lk-button block style="margin-top:32rpx" @click="show = false">关闭</lk-button>
    </view>
  </lk-popup>
</template>
```

## 四个方向

```vue
<script setup lang="ts">
import { ref } from 'vue'
const pos = ref<'top' | 'bottom' | 'left' | 'right' | ''>('')
</script>

<template>
  <view class="demo-grid-2">
    <lk-button @click="pos = 'top'">从顶部</lk-button>
    <lk-button @click="pos = 'bottom'">从底部</lk-button>
    <lk-button @click="pos = 'left'">从左侧</lk-button>
    <lk-button @click="pos = 'right'">从右侧</lk-button>
  </view>

  <lk-popup v-model="pos" :position="pos || 'bottom'" @close="pos = ''">
    <view style="padding:48rpx">弹出自 {{ pos }}</view>
  </lk-popup>
</template>
```

## 圆角弹框

```vue
<template>
  <lk-popup v-model="show" position="bottom" round>
    <view style="padding:32rpx">
      <!-- 顶部拖动条 -->
      <view style="width:60rpx;height:8rpx;border-radius:4rpx;background:#e2e8f0;margin:0 auto 32rpx" />
      <view>圆角底部弹框内容</view>
    </view>
  </lk-popup>
</template>
```

## 禁止背景滚动

```vue
<template>
  <lk-popup v-model="show" position="bottom" lock-scroll>
    <!-- 当 Popup 打开时，背景页面不可滚动 -->
    <scroll-view style="height:600rpx" scroll-y>
      <view v-for="i in 30" :key="i">列表项 {{ i }}</view>
    </scroll-view>
  </lk-popup>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 是否显示（v-model） | `boolean` | `false` |
| position | 弹出位置 | `top \\| bottom \\| left \\| right \\| center` | `center` |
| round | 是否圆角 | `boolean` | `false` |
| closeOnOverlay | 点击遮罩关闭 | `boolean` | `true` |
| lockScroll | 锁定背景滚动 | `boolean` | `true` |
| showOverlay | 是否显示遮罩 | `boolean` | `true` |
| zIndex | 层级 | `number` | `1000` |

### Events

| 事件名 | 说明 |
|--------|------|
| update:modelValue | 显示状态变化 |
| open | 弹出后 |
| close | 关闭后 |
| overlay-click | 点击遮罩 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 弹出层内容 |
""")

# ─── Navbar ───────────────────────────────────────────────────────────────────
w('navbar.md', """\
---
title: Navbar 导航栏
phone: navbar
---

# Navbar 导航栏

自定义顶部导航栏，适配 H5 安全区域和小程序状态栏高度。

## 基础用法

```vue
<template>
  <lk-navbar title="页面标题" />
</template>
```

## 带返回按钮

```vue
<template>
  <lk-navbar title="订单详情" back @back="handleBack" />
</template>

<script setup lang="ts">
function handleBack() {
  uni.navigateBack()
}
</script>
```

## 自定义左侧 / 右侧

```vue
<template>
  <lk-navbar title="Lucky UI">
    <template #left>
      <lk-button variant="text" size="sm" @click="goHome">
        <lk-icon name="house" :size="20" />
      </lk-button>
    </template>
    <template #right>
      <view style="display:flex; gap:16rpx">
        <lk-icon name="search" :size="22" @click="openSearch" />
        <lk-icon name="person-circle" :size="22" @click="goProfile" />
      </view>
    </template>
  </lk-navbar>
</template>
```

## 透明导航栏

```vue
<template>
  <!-- 适合有封面大图的页面 -->
  <lk-navbar title="详情" transparent dark back />

  <view class="cover-image" style="height:500rpx; background:#7c3aed" />
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 标题文字 | `string` | `''` |
| back | 是否显示返回按钮 | `boolean` | `false` |
| transparent | 是否透明背景 | `boolean` | `false` |
| dark | 暗色文字（配合透明） | `boolean` | `false` |
| fixed | 是否固定在顶部 | `boolean` | `true` |
| border | 是否显示底部边框 | `boolean` | `true` |
| zIndex | 层级 | `number` | `100` |

### Events

| 事件名 | 说明 |
|--------|------|
| back | 点击返回按钮 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 标题区域自定义内容 |
| left | 左侧区域自定义 |
| right | 右侧区域自定义 |
""")

print('All form/feedback/nav component docs written!')
