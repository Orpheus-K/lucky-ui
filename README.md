# Lucky UI

<p align="center">
  面向 Uni-app（Vue 3）的跨端移动端组件库。
</p>

<p align="center">
  <a href="https://lucky-ui.cn/">在线文档</a>
  ·
  <a href="https://lucky-ui.cn/guide/install.html">快速上手</a>
  ·
  <a href="https://lucky-ui.cn/components/">组件总览</a>
  ·
  <a href="https://github.com/Orpheus-K/lucky-ui">GitHub</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-42b883?style=flat-square" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Uni--app-3.x-2b9939?style=flat-square" alt="Uni-app 3.x" />
  <img src="https://img.shields.io/badge/TypeScript-ready-3178c6?style=flat-square" alt="TypeScript ready" />
  <img src="https://img.shields.io/badge/AI--workflow-ready-7c3aed?style=flat-square" alt="AI workflow ready" />
  <img src="https://img.shields.io/badge/License-MIT-111827?style=flat-square" alt="MIT License" />
</p>

<p align="center">
  <img src="docs/public/mp-qrcode.png" width="160" alt="微信小程序二维码" /><br>
  <sub>微信扫码体验小程序</sub>
</p>

## 定位

Lucky UI 为 Uni-app 应用提供一套开箱即用、类型完备、主题可控的移动端基础设施。它面向 H5、App 与小程序多端交付，覆盖基础元素、表单控件、数据展示、导航、反馈浮层、图表与工程化能力。

项目当前以 `src/uni_modules/lucky-ui` 为组件库主体，配套 VitePress 文档、H5 预览页、运行态采集、SVG 资产转换与 AI 协作规则。它不是简单的组件集合，而是一套可持续演进的跨端 UI 工程体系。

## 为什么选择 Lucky UI

### 组件库内核

<table>
  <thead>
    <tr>
      <th width="160" align="left">能力</th>
      <th align="left">说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>现代化 UI 风格</td>
      <td>以 Design Token、CSS 变量、暗色模式和克制的移动端视觉语言为底座，组件观感统一、轻量、现代。</td>
    </tr>
    <tr>
      <td>60+ 组件矩阵</td>
      <td>覆盖基础元素、布局、表单、数据展示、导航、反馈浮层、图表与高级能力，适合快速搭建完整应用。</td>
    </tr>
    <tr>
      <td>跨端一致性</td>
      <td>基于 Uni-app 能力实现，面向 H5、App、微信小程序及更多小程序端，优先治理平台差异。</td>
    </tr>
    <tr>
      <td>TypeScript 优先</td>
      <td>组件 Props、工具函数与 Composables 提供类型声明，IDE 补全、重构和协作更稳。</td>
    </tr>
    <tr>
      <td>主题系统</td>
      <td>品牌色、字体、间距、圆角、阴影、层级与暗色模式均由变量驱动，可在业务侧低侵入覆盖。</td>
    </tr>
    <tr>
      <td>动画体系</td>
      <td>内置 <code>useTransition</code>，支持 fade、slide、zoom、flip、bounce、rotate 等过渡形态，无额外 DOM 层级，可控制 duration、delay、easing 与生命周期回调。</td>
    </tr>
    <tr>
      <td>SVG 资产转换</td>
      <td>统一接入 Bootstrap Icons、本地 SVG 或 NPM 包内 SVG，生成 <code>lk-icon</code> 字体、codepoints、微信小程序 base64 字体与空态插画模板。</td>
    </tr>
    <tr>
      <td>图表与数据表达</td>
      <td>提供柱状图、折线图、饼图、环形图、迷你趋势线、指标卡、雷达图等轻量 Canvas 图表能力。</td>
    </tr>
    <tr>
      <td>高级交互能力</td>
      <td>内置虚拟列表、瀑布流、预加载 (实验性)、网络请求、调试面板 (实验性)、悬浮按钮、幕帘等面向真实业务的扩展能力。</td>
    </tr>
  </tbody>
</table>

### 开发支撑

<table>
  <thead>
    <tr>
      <th width="200" align="left">支撑</th>
      <th align="left">说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>在线文档与实时预览</td>
      <td>VitePress 文档承载 API、示例和指南，配合 H5 预览页验证组件真实状态。</td>
    </tr>
    <tr>
      <td>SVG 资产治理</td>
      <td><code>pnpm run assets:svg</code> 写入产物，<code>assets:svg:check</code> 预检命名冲突、非法 SVG、缺失来源，<code>assets:svg:report</code> 输出变更报告。</td>
    </tr>
    <tr>
      <td>运行态抓取</td>
      <td>基于 Playwright 抓取 H5 DOM，基于微信开发者工具 CLI 与 <code>miniprogram-automator</code> 抓取小程序 WXML、offset、size、computed style 与交互结果。</td>
    </tr>
    <tr>
      <td>跨端回归依据</td>
      <td>UI 问题优先用运行态数据闭环，减少凭源码推断样式、间距和交互状态的误差。</td>
    </tr>
    <tr>
      <td>AI 协作友好</td>
      <td>仓库内置 AGENTS 规则与组件、文档、主题、图标、运行态探针等技能说明，便于 AI 在项目约束内稳定开发、补文档、调样式和定位问题。</td>
    </tr>
    <tr>
      <td>工程质量链路</td>
      <td>提供兼容性检查、类型检查、ESLint、Stylelint、单元测试、视觉回归、多小程序端构建等命令，可按阶段接入研发流程。</td>
    </tr>
    <tr>
      <td>文档即规范</td>
      <td>组件 API、Demo、主题变量、上架指南、动画方案和资产转换均沉淀在 <code>docs/</code>，降低多人协作的隐性成本。</td>
    </tr>
  </tbody>
</table>

## 快速开始

### 在本仓库开发

```bash
pnpm install
pnpm run dev:h5
```

文档站点本地预览：

```bash
pnpm run docs:dev
```

默认文档端口为 `4188`，H5 预览端口为 `5188`。

### 在 Uni-app 项目中接入

推荐通过 npm 安装：

```bash
npm install uni-lucky-ui
```

然后注册插件。注册后模板标签仍然使用 `lk-*` 前缀：

```ts
// src/main.ts
import { createSSRApp } from 'vue';
import App from './App.vue';
import LuckyUI from 'uni-lucky-ui';

export function createApp() {
  const app = createSSRApp(App);
  app.use(LuckyUI);
  return { app };
}
```

也可以将 `src/uni_modules/lucky-ui` 放入业务项目的 `src/uni_modules/` 目录，然后从本地目录注册插件：

```ts
// src/main.ts
import { createSSRApp } from 'vue';
import App from './App.vue';
import LuckyUI from './uni_modules/lucky-ui';

export function createApp() {
  const app = createSSRApp(App);
  app.use(LuckyUI);
  return { app };
}
```

The default plugin registers only public `Lk*` components. Demo and debugging utilities should be imported explicitly when needed.

引入主题样式。npm 安装时使用包路径：

```scss
// src/uni.scss
@use 'uni-lucky-ui/theme/src/index.scss';
```

如果使用 `src/uni_modules/lucky-ui` 本地目录，则使用本地路径：

```scss
// src/uni.scss
@use './uni_modules/lucky-ui/theme/src/index.scss';
```

页面中直接使用：

```vue
<template>
  <view class="page">
    <lk-button variant="solid">提交</lk-button>
    <lk-tag bg-color="var(--lk-color-success)" text-color="#fff">已启用</lk-tag>
  </view>
</template>
```

## 组件版图

| 分类       | 代表组件                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| 基础元素   | Button、Icon、Avatar、Badge、Tag、Divider、Cell                                                                        |
| 布局       | Root、Grid、Space、MetaRow、Choice                                                                                     |
| 表单控件   | Form、Input、Textarea、Radio、Checkbox、SelectList、Switch、Stepper、Slider、Rate、Upload、Picker、Calendar            |
| 数据展示   | Card、Carousel、Collapse、Timeline、Progress、PullRefresh、Loading、Skeleton、Empty、VirtualList、Waterfall、Watermark |
| 图表       | ChartBar、ChartLine、ChartPie、ChartLite、ChartRing、ChartSparkline、ChartStatCard、ChartRadarLite                     |
| 导航       | Navbar、Tab、Tabbar、TabbarContainer、Segmented、Anchor、Sticky、Backtop                                               |
| 反馈与浮层 | Modal、Popup、Toast、ActionSheet、Overlay、Tooltip、Dropdown、NoticeBar                                                |
| 高级能力   | Fab、Curtain、HorizontalScroll、Request、Preload (实验性)、PreloadDebugger (实验性)                                    |

完整 API 与示例见 [组件总览](https://lucky-ui.cn/components/)。

## 目录结构

```text
.
├── docs/                         # VitePress 文档站点
├── src/
│   ├── components/demos/         # H5 组件演示
│   ├── pages_sub/                # 预览与业务示例页面
│   └── uni_modules/lucky-ui/     # Lucky UI 组件库源码
│       ├── components/           # lk-* 组件
│       ├── composables/          # 跨组件复用逻辑
│       ├── core/                 # 核心工具与能力
│       ├── locale/               # 国际化文案
│       ├── theme/                # Design Token 与主题样式
│       └── utils/                # 通用工具
├── scripts/                      # 工程脚本
└── tests/                        # 自动化与回归用例
```

## 常用命令

| 命令                        | 说明                                        |
| --------------------------- | ------------------------------------------- |
| `pnpm run dev:h5`           | 启动 H5 开发预览                            |
| `pnpm run dev:mp-weixin`    | 编译微信小程序开发包                        |
| `pnpm run docs:dev`         | 启动文档站点                                |
| `pnpm run docs:build`       | 构建文档站点                                |
| `pnpm run build:h5`         | 构建 H5 产物                                |
| `pnpm run build:mp:all`     | 构建多小程序端产物                          |
| `pnpm run assets:svg`       | 转换 SVG 资产并写入图标、字体与空态插画产物 |
| `pnpm run assets:svg:check` | 预检 SVG 配置、命名冲突与计划写入           |
| `pnpm run compat-check`     | 执行跨端兼容性静态检查                      |
| `pnpm run type-check`       | TypeScript 类型检查                         |
| `pnpm run lint`             | ESLint 与 Stylelint 检查                    |
| `pnpm run test:unit`        | 单元测试                                    |
| `pnpm run test:visual`      | Playwright 视觉回归                         |

## 文档

- 在线文档：[lucky-ui.cn](https://lucky-ui.cn/)
- 快速上手：[安装与引入](https://lucky-ui.cn/guide/install.html)
- 组件总览：[组件总览](https://lucky-ui.cn/components/)
- 主题定制：[主题定制](https://lucky-ui.cn/guide/theme.html)
- GitHub：[Orpheus-K/lucky-ui](https://github.com/Orpheus-K/lucky-ui)

## 兼容性

| 平台                            | 状态                        |
| ------------------------------- | --------------------------- |
| H5                              | 支持                        |
| App                             | 支持                        |
| 微信小程序                      | 支持                        |
| 支付宝、百度、抖音、QQ 等小程序 | 基于 Uni-app 运行端能力支持 |

涉及 Canvas、原生组件、开放能力、系统安全区与平台私有样式的场景，应以目标端实测结果为准。

## 开源协议

MIT
