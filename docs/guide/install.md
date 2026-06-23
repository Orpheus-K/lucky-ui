# 安装与引入

## 方式一：包管理器安装（推荐）

npm registry 包名是 `uni-lucky-ui`。`lucky-ui` 只用于 `uni_modules` 本地目录名，不要把 npm 包名写成 `lucky-ui`。

```bash
pnpm add uni-lucky-ui
# 或
npm install uni-lucky-ui
# 或
yarn add uni-lucky-ui
```

然后在 `main.ts` 注册公开的 `Lk*` 全局组件。注册后模板中仍然使用 `lk-*` 标签，例如 `<lk-button>`：

```ts
// src/main.ts
import { createSSRApp } from 'vue'
import App from './App.vue'
import LuckyUI from 'uni-lucky-ui'

export function createApp() {
  const app = createSSRApp(App)
  app.use(LuckyUI)
  return { app }
}
```

同时在 `App.vue` 或全局 scss 文件中引入主题样式：

```scss
// src/uni.scss
@use 'uni-lucky-ui/theme/src/index.scss';
```

按需导入时使用 npm 包路径：

```ts
import LkButton from 'uni-lucky-ui/components/lk-button/lk-button.vue'
```

## 方式二：uni_modules 本地安装

将 `lucky-ui` 目录复制至你的 Uni-app 项目的 `src/uni_modules/` 中，
然后在 `main.ts` 注册公开的 `Lk*` 全局组件：

```ts
// src/main.ts
import { createSSRApp } from 'vue'
import App from './App.vue'
import LuckyUI from './uni_modules/lucky-ui'

export function createApp() {
  const app = createSSRApp(App)
  app.use(LuckyUI)
  return { app }
}
```

同时在 `App.vue` 或全局 scss 文件中引入主题样式：

```scss
// src/uni.scss
@use './uni_modules/lucky-ui/theme/src/index.scss';
```

`DemoBlock`、`lk-preload-debugger` 等演示/调试能力不会通过默认插件注册；业务项目如确实需要，应按需显式导入。

## 方式三：uni_modules 按需引入（减少体积）

不注册全局插件，直接在页面/组件内按需导入：

```vue
<script setup lang="ts">
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue'
import LkInput from '@/uni_modules/lucky-ui/components/lk-input/lk-input.vue'
</script>

<template>
  <view>
    <lk-input v-model="keyword" placeholder="搜索..." />
    <lk-button @click="search">搜索</lk-button>
  </view>
</template>
```

## 类型支持

在 `tsconfig.json` 中确保 `src` 路径已包含：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

组件库自带 `components.d.ts`，IDE 可自动识别公开 `lk-*` 组件的 props 类型。

## 快速验证

新建一个页面，放入以下代码，运行 `pnpm run dev:h5` 确认正常显示：

```vue
<template>
  <view style="padding: 32rpx; display: flex; flex-direction: column; gap: 16rpx">
    <lk-button>默认按钮</lk-button>
    <lk-button variant="outline">描边按钮</lk-button>
    <lk-tag type="success">安装成功</lk-tag>
  </view>
</template>
```
