"""
批量清理组件文档:
1. 重写 basic/button.md（加 phone frontmatter）
2. 所有残余文件: 去掉 Naive UI/Ant Design 引用，替换 "规范示例(推荐)" 模板块
"""
import os, re

BASE = r'f:\luckyone\ui\docs\components'

# ─── 重写 button.md ───────────────────────────────────────────────────────
BUTTON_MD = """\
---
title: Button 按钮
phone: button
---

# Button 按钮

用于触发操作的按钮，支持多种变体、尺寸与形状。

## 基础用法

```vue
<template>
  <view class="demo-row">
    <lk-button>默认按钮</lk-button>
    <lk-button variant="outline">描边按钮</lk-button>
    <lk-button variant="soft">柔和按钮</lk-button>
    <lk-button variant="text">文字按钮</lk-button>
  </view>
</template>
```

## 尺寸

```vue
<template>
  <view class="demo-row">
    <lk-button size="sm">小</lk-button>
    <lk-button size="md">中（默认）</lk-button>
    <lk-button size="lg">大</lk-button>
  </view>
  <lk-button block size="lg" shape="round" style="margin-top:24rpx">
    块级胶囊按钮
  </lk-button>
</template>
```

## 形状

```vue
<template>
  <view class="demo-row">
    <lk-button shape="default">默认圆角</lk-button>
    <lk-button shape="square">直角</lk-button>
    <lk-button shape="round">胶囊</lk-button>
    <lk-button shape="circle">
      <lk-icon name="plus" />
    </lk-button>
  </view>
</template>
```

## 加载与禁用

```vue
<script setup lang="ts">
import { ref } from 'vue'
const loading = ref(false)
function submit() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 2000)
}
</script>

<template>
  <view class="demo-row">
    <lk-button :loading="loading" @click="submit">
      {{ loading ? '提交中...' : '点击提交' }}
    </lk-button>
    <lk-button disabled>已禁用</lk-button>
  </view>
</template>
```

## 图标按钮

```vue
<template>
  <view class="demo-row">
    <lk-button>
      <lk-icon name="search" style="margin-right:8rpx" />
      搜索
    </lk-button>
    <lk-button variant="outline">
      <lk-icon name="download" style="margin-right:8rpx" />
      下载
    </lk-button>
    <lk-button shape="circle" variant="soft">
      <lk-icon name="heart" />
    </lk-button>
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| variant | 按钮变体 | `solid \\| outline \\| soft \\| text` | `solid` |
| size | 按钮尺寸 | `sm \\| md \\| lg` | `md` |
| shape | 按钮形状 | `default \\| square \\| round \\| circle` | `default` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| block | 是否块级 | `boolean` | `false` |
| icon | 图标名称 | `string` | `''` |
| nativeType | 原生类型 | `button \\| submit \\| reset` | `button` |
| customClass | 额外类名 | `string` | `''` |
| customStyle | 额外样式 | `string \\| object` | `''` |

### Events

| 事件名 | 说明 |
|--------|------|
| click | 非禁用/非加载状态下的点击 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 按钮内容 |
"""

with open(os.path.join(BASE, 'basic/button.md'), 'w', encoding='utf-8') as f:
    f.write(BUTTON_MD)
print('  ✓ basic/button.md (rewritten)')

# ─── 批量清理其余文件 ─────────────────────────────────────────────────────
# 要删除的大段模板文本（正则匹配）
REMOVE_PATTERNS = [
    # "规范示例（推荐）" 整个章节
    r'## 规范示例（推荐）.*?(?=## [^#]|\Z)',
    # 旧的 API 模板说明
    r'## API\s*\n\s*- 建议按.*?(?=\Z)',
    # 参考链接行
    r'参考 Demo：\s*\n- https?://[^\n]+\n',
    r'运行示例参考：\s*`src/components/demos/[^`]+`\s*\n',
]

def clean_file(fp):
    content = open(fp, encoding='utf-8', errors='replace').read()
    original = content

    # 去掉整个"规范示例"章节（可能跨多行到下一个 ## 或文件末尾）
    content = re.sub(
        r'## 规范示例（推荐）[\s\S]*?(?=\n## |\Z)',
        '',
        content
    )
    # 去掉空的 API 章节（只有说明，没有实际表格）
    content = re.sub(
        r'## API\s*\n\s*- 建议按.*?\n\s*- 推荐使用.*?\n',
        '## API\n\n> 详细 API 请参考组件源码 `src/uni_modules/lucky-ui/components/` 目录。\n',
        content,
        flags=re.DOTALL
    )
    # 去掉 Naive UI / Ant Design 引用
    content = content.replace('Naive UI / Ant Design 的文档组织方式，', '')
    content = content.replace('Naive UI / Ant Design', 'Lucky UI')
    # 去掉 demo 参考链接行
    content = re.sub(r'参考 Demo：\s*\n- https?://[^\n]+\n', '', content)
    # 去掉多余空行（超过 2 个连续换行压缩为 2 个）
    content = re.sub(r'\n{3,}', '\n\n', content).strip() + '\n'

    if content != original:
        with open(fp, 'w', encoding='utf-8') as fh:
            fh.write(content)
        return True
    return False

cleaned = 0
for root, dirs, files in os.walk(BASE):
    for fn in files:
        if fn.endswith('.md'):
            fp = os.path.join(root, fn)
            # 跳过已完整重写的文件
            skip_names = {
                'button.md', 'icon.md', 'avatar.md', 'badge.md',
                'tag.md', 'divider.md', 'cell.md',
                'radio.md', 'input.md', 'switch.md', 'modal.md',
                'toast.md', 'popup.md', 'navbar.md',
                'index.md',
            }
            if fn in skip_names:
                continue
            if clean_file(fp):
                print(f'  ✓ cleaned: {os.path.relpath(fp, BASE)}')
                cleaned += 1

print(f'\nTotal cleaned: {cleaned} files')
