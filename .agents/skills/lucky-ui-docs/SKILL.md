---
name: lucky-ui-docs
description: 用于为 lucky-ui 组件库编写、修改或补充 VitePress 文档。包括新组件文档、API 表格、使用示例、Demo 演示页等。
---

# Lucky-UI 文档系统指南

## 文档技术栈

- **框架**：VitePress 1.x
- **文档目录**：`docs/`
- **演示页目录**：`src/pages/` (UniApp H5 页面)
- **开发预览**：`pnpm run docs:dev`（端口 4173）

---

## 文档目录结构

```
docs/
├── .vitepress/
│   ├── config.ts          # VitePress 配置（导航、侧边栏）
│   └── theme/             # 自定义主题
├── components/            # 各组件文档
│   ├── button.md
│   ├── tabs.md
│   └── ...
├── guide/                 # 指南文档
│   ├── quickstart.md
│   ├── theme.md
│   └── ...
└── index.md               # 首页
```

---

## 新建组件文档模板

创建 `docs/components/{name}.md`：

```markdown
# ComponentName 组件名

> 一句话描述组件的用途和适用场景。

## 基础用法

<demo-preview path="../../src/pages/component-name/index" />

\`\`\`vue
<template>
  <lk-component-name :prop-a="value">
    内容
  </lk-component-name>
</template>
\`\`\`

## 变体示例

### 尺寸

<demo-preview path="..." />

\`\`\`vue
<lk-component-name size="sm">小</lk-component-name>
<lk-component-name size="md">中</lk-component-name>
<lk-component-name size="lg">大</lk-component-name>
\`\`\`

### 状态

\`\`\`vue
<lk-component-name disabled>禁用</lk-component-name>
<lk-component-name loading>加载中</lk-component-name>
\`\`\`

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| variant | 样式变体 | `string` | `primary / secondary / danger` | `primary` |
| size | 尺寸 | `string` | `sm / md / lg` | `md` |
| disabled | 是否禁用 | `boolean` | — | `false` |
| loading | 是否加载中 | `boolean` | — | `false` |
| customClass | 自定义类名 | `string / object / array` | — | — |
| customStyle | 自定义样式 | `string / object` | — | — |

### Emits

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击时触发 | `(event: Event)` |
| change | 值变化时触发 | `(value: string)` |

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| default | 默认内容 | — |
| prefix | 前置内容 | — |
| suffix | 后置内容 | — |
| title | `#title` 标题 | — |

### Methods（通过 ref 调用）

| 方法名 | 说明 | 参数 |
|--------|------|------|
| open() | 打开 | — |
| close() | 关闭 | — |
| toggle() | 切换 | — |

## 主题定制

通过 CSS 变量覆盖组件样式：

| CSS 变量 | 说明 | 默认值 |
|----------|------|--------|
| `--lk-btn-height` | 按钮高度 | `var(--lk-control-height-md)` |
| `--lk-btn-radius` | 圆角 | `var(--lk-radius-md)` |

## 注意事项

> [!WARNING]
> 在小程序中使用时，请注意 xxx 限制。

> [!TIP]
> 建议在 xxx 场景下使用 yyy 替代方案。
```

---

## 在 VitePress 配置中注册新组件文档

编辑 `docs/.vitepress/config.ts`：

```typescript
export default defineConfig({
  themeConfig: {
    sidebar: {
      '/components/': [
        {
          text: '基础组件',
          items: [
            { text: 'Button 按钮', link: '/components/button' },
            // 新增：
            { text: 'MyComponent 组件名', link: '/components/my-component' },
          ]
        },
        {
          text: '表单组件',
          items: [/* ... */]
        },
      ]
    }
  }
})
```

---

## 演示页（Demo Page）规范

演示页位于 `src/pages/{component-name}/index.vue`，是组件在 UniApp 中的实际运行示例。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { DemoBlock } from '@/uni_modules/lucky-ui/components';

const value = ref('');
const show = ref(false);
</script>

<template>
  <view class="page">
    <!-- 基础用法 -->
    <demo-block title="基础用法">
      <lk-component-name :model-value="value" @change="v => value = v" />
    </demo-block>

    <!-- 变体 -->
    <demo-block title="变体类型">
      <lk-component-name variant="primary">主要</lk-component-name>
      <lk-component-name variant="secondary">次要</lk-component-name>
    </demo-block>

    <!-- 禁用状态 -->
    <demo-block title="禁用状态">
      <lk-component-name disabled>禁用</lk-component-name>
    </demo-block>
  </view>
</template>

<style lang="scss" scoped>
.page {
  padding: var(--lk-spacing-md);
  background: var(--lk-bg-page);
  min-height: 100vh;
}
</style>
```

---

## DemoBlock 组件用法

`demo-block` 是内置的演示容器组件：

| Prop | 类型 | 说明 |
|------|------|------|
| `title` | String | 示例标题 |
| `desc` | String | 描述文字（可选） |

---

## 演示页在 pages.json 中注册

编辑 `src/pages.json`：

```json
{
  "pages": [
    {
      "path": "pages/my-component/index",
      "style": {
        "navigationBarTitleText": "MyComponent 组件名"
      }
    }
  ]
}
```

---

## Markdown 常用技巧

### 代码块自动高亮

支持语言：`vue`, `typescript`, `javascript`, `scss`, `bash`, `json`

### 自定义容器

```markdown
::: tip 提示
这是一条提示信息
:::

::: warning 注意
这是一条警告信息
:::

::: danger 危险
这是一条危险提示
:::

::: details 展开查看
折叠的内容
:::
```

### API 表格规范

- **参数列**：使用驼峰（`modelValue`）
- **类型列**：用反引号包裹（`` `string` ``）
- **可选值列**：用 ` / ` 分隔（`primary / secondary`）
- **默认值列**：无则写 `—`

---

## 文档预览命令

```bash
# 启动文档开发服务（端口 4173）
pnpm run docs:dev

# 构建文档
pnpm run docs:build

# 预览构建产物
pnpm run docs:preview
```
