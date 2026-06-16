"""写入所有组件文档的辅助脚本"""
import os

BASE = r'f:\luckyone\ui\docs\components'

def w(rel, content):
    p = os.path.join(BASE, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  ✓ {rel}')

# ─── Icon ───────────────────────────────────────────────────────────────────
w('basic/icon.md', """\
---
title: Icon 图标
phone: icon
---

# Icon 图标

基于 Bootstrap Icons 封装的图标组件，支持颜色、尺寸等常用定制。

## 基础用法

```vue
<template>
  <view class="demo-row">
    <lk-icon name="house" />
    <lk-icon name="heart" />
    <lk-icon name="star" />
    <lk-icon name="bell" />
    <lk-icon name="person" />
  </view>
</template>
```

## 尺寸

通过 `size` 设置像素尺寸（单位 px，组件内部自动转 rpx）。

```vue
<template>
  <view class="demo-row">
    <lk-icon name="star" :size="16" />
    <lk-icon name="star" :size="24" />
    <lk-icon name="star" :size="32" />
    <lk-icon name="star" :size="48" />
  </view>
</template>
```

## 颜色

```vue
<template>
  <view class="demo-row">
    <lk-icon name="heart-fill" color="#ef4444" />
    <lk-icon name="patch-check-fill" color="#22c55e" />
    <lk-icon name="lightning-charge-fill" color="#f59e0b" />
    <lk-icon name="info-circle-fill" color="#3b82f6" />
    <lk-icon name="shield-fill" color="var(--lk-color-primary)" />
  </view>
</template>
```

## 与文字/按钮组合

```vue
<template>
  <view class="demo-col">
    <!-- 与文字组合 -->
    <view style="display:flex; align-items:center; gap:8rpx">
      <lk-icon name="geo-alt-fill" color="var(--lk-color-primary)" :size="18" />
      <text>北京市朝阳区</text>
    </view>

    <!-- 作为按钮前缀 -->
    <lk-button>
      <lk-icon name="upload" style="margin-right:8rpx" />
      上传图片
    </lk-button>

    <!-- 独立操作图标 -->
    <view class="demo-row">
      <lk-icon name="trash" color="#ef4444" :size="22" />
      <lk-icon name="pencil" color="var(--lk-color-primary)" :size="22" />
      <lk-icon name="share" color="#64748b" :size="22" />
    </view>
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 图标名称 | `string` | — |
| size | 图标尺寸（px） | `number \\| string` | `24` |
| color | 图标颜色 | `string` | 继承文本色 |
| customClass | 额外类名 | `string` | `''` |
| customStyle | 额外样式 | `string \\| object` | `''` |

::: tip 图标列表
所有图标名称请参考 [Bootstrap Icons](https://icons.getbootstrap.com/)，
使用图标名的**小写连字符**形式（如 `chevron-right`、`arrow-up-circle`）。
:::
""")

# ─── Avatar ─────────────────────────────────────────────────────────────────
w('basic/avatar.md', """\
---
title: Avatar 头像
phone: avatar
---

# Avatar 头像

展示用户或实体头像，支持图片、文字、图标三种形式。

## 基础用法

```vue
<template>
  <view class="demo-row">
    <lk-avatar src="https://i.pravatar.cc/100?img=1" />
    <lk-avatar text="张" />
    <lk-avatar icon="person" />
  </view>
</template>
```

## 尺寸

```vue
<template>
  <view class="demo-row" style="align-items:flex-end">
    <lk-avatar src="https://i.pravatar.cc/100" size="sm" />
    <lk-avatar src="https://i.pravatar.cc/100" size="md" />
    <lk-avatar src="https://i.pravatar.cc/100" size="lg" />
    <lk-avatar src="https://i.pravatar.cc/100" size="xl" />
    <lk-avatar src="https://i.pravatar.cc/100" :size="90" />
  </view>
</template>
```

## 形状

```vue
<template>
  <view class="demo-row">
    <lk-avatar src="https://i.pravatar.cc/100?img=2" shape="circle" />
    <lk-avatar src="https://i.pravatar.cc/100?img=2" shape="square" />
    <lk-avatar src="https://i.pravatar.cc/100?img=2" shape="rounded" />
  </view>
</template>
```

## 头像堆叠

```vue
<script setup lang="ts">
const avatars = [
  'https://i.pravatar.cc/100?img=1',
  'https://i.pravatar.cc/100?img=2',
  'https://i.pravatar.cc/100?img=3',
]
</script>

<template>
  <view style="display:flex">
    <lk-avatar
      v-for="(src, i) in avatars" :key="i"
      :src="src"
      :style="{ marginLeft: i > 0 ? '-16rpx' : 0, zIndex: avatars.length - i }"
    />
    <lk-avatar
      text="+3"
      :style="{ marginLeft: '-16rpx', background: '#e2e8f0', color: '#64748b' }"
    />
  </view>
</template>
```

## 图片加载兜底

```vue
<template>
  <view class="demo-row">
    <!-- 有效图片 -->
    <lk-avatar src="https://i.pravatar.cc/100?img=3" />
    <!-- 无效图片 → 显示备用图标 -->
    <lk-avatar src="invalid-url.jpg" fallback-icon="person" />
    <!-- 无效图片 → 显示备用文字 -->
    <lk-avatar src="invalid-url.jpg" fallback-text="U" />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| src | 图片地址 | `string` | `''` |
| text | 文字内容（无 src 时显示） | `string` | `''` |
| icon | 图标名（无 src 和 text 时显示） | `string` | `'person'` |
| size | 尺寸，支持预设或数字（rpx） | `sm \\| md \\| lg \\| xl \\| number` | `md` |
| shape | 形状 | `circle \\| square \\| rounded` | `circle` |
| fallbackIcon | 图片加载失败时的图标 | `string` | `'person'` |
| fallbackText | 图片加载失败时的文字 | `string` | `''` |
| customClass | 额外类名 | `string` | `''` |
| customStyle | 额外样式 | `string \\| object` | `''` |
""")

# ─── Badge ───────────────────────────────────────────────────────────────────
w('basic/badge.md', """\
---
title: Badge 徽标
phone: badge
---

# Badge 徽标

在图标、按钮或内容上标注通知数字或状态点。

## 基础用法

```vue
<template>
  <view class="demo-row">
    <lk-badge :count="3">
      <lk-button>消息</lk-button>
    </lk-badge>
    <lk-badge dot>
      <lk-icon name="bell" :size="28" />
    </lk-badge>
    <lk-badge text="新">
      <lk-button>功能</lk-button>
    </lk-badge>
  </view>
</template>
```

## 最大值

超过 `max` 时显示 `max+`。

```vue
<template>
  <view class="demo-row">
    <lk-badge :count="5" :max="99"><lk-icon name="chat" :size="28" /></lk-badge>
    <lk-badge :count="100" :max="99"><lk-icon name="chat" :size="28" /></lk-badge>
    <lk-badge :count="999" :max="99"><lk-icon name="chat" :size="28" /></lk-badge>
  </view>
</template>
```

## 颜色类型

```vue
<template>
  <view class="demo-row">
    <lk-badge :count="8" type="danger"><lk-icon name="bell" :size="28" /></lk-badge>
    <lk-badge :count="8" type="success"><lk-icon name="bell" :size="28" /></lk-badge>
    <lk-badge :count="8" type="warning"><lk-icon name="bell" :size="28" /></lk-badge>
    <lk-badge :count="8" type="info"><lk-icon name="bell" :size="28" /></lk-badge>
  </view>
</template>
```

## 独立使用

不包裹子内容时，作为纯徽标展示。

```vue
<template>
  <view class="demo-row" style="align-items:center">
    <lk-badge :count="12" />
    <lk-badge dot />
    <lk-badge text="HOT" type="danger" />
    <lk-badge text="NEW" type="success" />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| count | 显示数字 | `number` | `0` |
| max | 数字上限，超出显示 `max+` | `number` | `99` |
| dot | 显示小红点 | `boolean` | `false` |
| text | 显示文字（优先于 count） | `string` | `''` |
| type | 颜色类型 | `danger \\| success \\| warning \\| info` | `danger` |
| showZero | count=0 时是否显示 | `boolean` | `false` |
| offset | 徽标偏移量 `[x, y]` | `[number, number]` | `[0, 0]` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 被徽标包裹的内容 |
""")

# ─── Tag ─────────────────────────────────────────────────────────────────────
w('basic/tag.md', """\
---
title: Tag 标签
phone: tag
---

# Tag 标签

标注内容属性、元信息或操作状态的小型标签。

## 基础用法

```vue
<template>
  <view class="demo-row">
    <lk-tag>默认</lk-tag>
    <lk-tag type="success">成功</lk-tag>
    <lk-tag type="warning">警告</lk-tag>
    <lk-tag type="danger">危险</lk-tag>
    <lk-tag type="info">信息</lk-tag>
  </view>
</template>
```

## 样式变体

```vue
<template>
  <!-- 实体（默认） -->
  <view class="demo-row">
    <lk-tag>实体</lk-tag>
    <lk-tag type="success">实体</lk-tag>
    <lk-tag type="danger">实体</lk-tag>
  </view>

  <!-- 描边 -->
  <view class="demo-row">
    <lk-tag variant="outline">描边</lk-tag>
    <lk-tag variant="outline" type="success">描边</lk-tag>
    <lk-tag variant="outline" type="danger">描边</lk-tag>
  </view>

  <!-- 浅色背景 -->
  <view class="demo-row">
    <lk-tag variant="light">浅色</lk-tag>
    <lk-tag variant="light" type="success">浅色</lk-tag>
    <lk-tag variant="light" type="danger">浅色</lk-tag>
  </view>
</template>
```

## 尺寸

```vue
<template>
  <view class="demo-row" style="align-items:center">
    <lk-tag size="sm">小标签</lk-tag>
    <lk-tag size="md">中标签</lk-tag>
    <lk-tag size="lg">大标签</lk-tag>
  </view>
</template>
```

## 可关闭

```vue
<script setup lang="ts">
import { ref } from 'vue'
const tags = ref(['Vue 3', 'TypeScript', 'Uni-app', 'Lucky UI'])
function remove(t: string) {
  tags.value = tags.value.filter(x => x !== t)
}
</script>

<template>
  <view class="demo-row">
    <lk-tag
      v-for="t in tags" :key="t"
      closable @close="remove(t)"
    >{{ t }}</lk-tag>
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 语义类型 | `default \\| success \\| warning \\| danger \\| info` | `default` |
| variant | 样式变体 | `solid \\| outline \\| light` | `solid` |
| size | 尺寸 | `sm \\| md \\| lg` | `md` |
| closable | 是否可关闭 | `boolean` | `false` |
| round | 是否胶囊圆角 | `boolean` | `false` |

### Events

| 事件名 | 说明 |
|--------|------|
| click | 点击标签 |
| close | 点击关闭按钮 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 标签内容 |
""")

# ─── Divider ─────────────────────────────────────────────────────────────────
w('basic/divider.md', """\
---
title: Divider 分割线
phone: divider
---

# Divider 分割线

内容区块之间的视觉分隔，支持水平、垂直方向及中间插入文字。

## 基础用法

```vue
<template>
  <view>
    <view>上方内容区块</view>
    <lk-divider />
    <view>下方内容区块</view>
  </view>
</template>
```

## 带文字

```vue
<template>
  <view>
    <lk-divider>居中文字</lk-divider>
    <lk-divider align="left">左对齐文字</lk-divider>
    <lk-divider align="right">右对齐文字</lk-divider>
  </view>
</template>
```

## 虚线与自定义颜色

```vue
<template>
  <view>
    <lk-divider dashed />
    <lk-divider :border-width="2" border-color="#7c3aed" />
    <lk-divider dashed border-color="#f59e0b">自定义颜色</lk-divider>
  </view>
</template>
```

## 垂直分割线

```vue
<template>
  <view style="display:flex; align-items:center; height:48rpx; padding:0 24rpx">
    <text>首页</text>
    <lk-divider direction="vertical" />
    <text>产品</text>
    <lk-divider direction="vertical" />
    <text>关于我们</text>
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| direction | 方向 | `horizontal \\| vertical` | `horizontal` |
| dashed | 是否虚线 | `boolean` | `false` |
| align | 文字对齐 | `left \\| center \\| right` | `center` |
| borderWidth | 线条粗细（rpx） | `number` | `1` |
| borderColor | 线条颜色 | `string` | — |
| textColor | 文字颜色 | `string` | — |
| margin | 上下外边距（rpx） | `number` | `24` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 中间文字内容 |
""")

# ─── Cell ─────────────────────────────────────────────────────────────────────
w('basic/cell.md', """\
---
title: Cell 单元格
phone: cell
---

# Cell 单元格

列表中最常见的展示行，适用于设置页、信息列表等场景。

## 基础用法

```vue
<template>
  <lk-cell-group>
    <lk-cell title="个人信息" value="查看" />
    <lk-cell title="收货地址" value="北京市朝阳区" />
    <lk-cell title="支付方式" value="微信支付" arrow />
  </lk-cell-group>
</template>
```

## 带图标

```vue
<template>
  <lk-cell-group>
    <lk-cell title="消息通知" prefix-icon="bell" arrow />
    <lk-cell title="账号安全" prefix-icon="shield-lock" arrow />
    <lk-cell title="隐私设置" prefix-icon="eye-slash" arrow />
    <lk-cell title="帮助中心" prefix-icon="question-circle" arrow />
  </lk-cell-group>
</template>
```

## 带描述（label）

```vue
<template>
  <lk-cell-group>
    <lk-cell
      title="当前版本"
      value="v1.2.0"
      label="已是最新版本"
    />
    <lk-cell
      title="存储空间"
      value="128 GB"
      label="已使用 48.6 GB"
    />
  </lk-cell-group>
</template>
```

## 右侧自定义内容

```vue
<script setup lang="ts">
import { ref } from 'vue'
const notify = ref(true)
</script>

<template>
  <lk-cell-group>
    <lk-cell title="消息推送" prefix-icon="bell">
      <template #value>
        <lk-switch v-model="notify" size="sm" />
      </template>
    </lk-cell>
    <lk-cell title="我的标签" prefix-icon="tag">
      <template #value>
        <view style="display:flex; gap:8rpx">
          <lk-tag size="sm" type="success">前端</lk-tag>
          <lk-tag size="sm">UI</lk-tag>
        </view>
      </template>
    </lk-cell>
  </lk-cell-group>
</template>
```

## 分组标题 & 卡片样式

```vue
<template>
  <lk-cell-group title="账号设置" card>
    <lk-cell title="修改头像" prefix-icon="person-circle" arrow clickable />
    <lk-cell title="修改昵称" prefix-icon="pencil" arrow clickable />
    <lk-cell title="绑定手机" prefix-icon="phone" value="已绑定" arrow clickable />
  </lk-cell-group>
</template>
```

## API

### CellGroup Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 分组标题 | `string` | `''` |
| border | 是否显示边框 | `boolean` | `true` |
| card | 卡片样式（带圆角和阴影） | `boolean` | `false` |
| inset | 内嵌圆角样式 | `boolean` | `false` |

### Cell Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 左侧标题 | `string` | `''` |
| value | 右侧内容 | `string` | `''` |
| label | 标题下方描述 | `string` | `''` |
| prefixIcon | 左侧图标名 | `string` | `''` |
| arrow | 显示右侧箭头 | `boolean` | `false` |
| clickable | 开启点击高亮 | `boolean` | `false` |
| required | 显示必填星号 | `boolean` | `false` |
| valueColor | 右侧文字颜色 | `string` | — |

### Cell Events

| 事件名 | 说明 |
|--------|------|
| click | 点击单元格 |

### Cell Slots

| 插槽名 | 说明 |
|--------|------|
| default / value | 右侧完全自定义 |
| title | 左侧标题自定义 |
| icon | 左侧图标自定义 |
""")

print('All basic component docs written!')
