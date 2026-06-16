# 介绍

Lucky UI 是一套面向 **Uni-app（Vue 3）** 的跨端移动端组件库，面向 H5、App 与各类小程序运行端。

## 特性

- **60+ 组件**：涵盖所有常用移动端 UI 场景
- **跨端兼容**：同一套代码面向 H5、App 与小程序多端运行
- **TypeScript**：全量类型，完善的 IDE 提示
- **主题系统**：Design Token + CSS 变量，支持暗色模式
- **按需引用**：Tree-shaking 友好，只引入你需要的

## 技术栈

| 项目 | 版本 |
|------|------|
| Vue | ^3.4 |
| Uni-app | 3.x |
| TypeScript | ^5.0 |
| Vite | ^5.0 |

## 目录结构

```
src/uni_modules/lucky-ui/
├── components/          # 所有组件
│   ├── lk-button/       # 单个组件 SFC + Props
│   ├── lk-input/
│   └── ...
├── core/
│   └── src/
│       ├── utils/       # 工具函数（addUnit、throttle 等）
│       └── hooks/       # 通用 Composables
├── theme/
│   └── src/
│       ├── tokens/      # Design Tokens
│       ├── base/        # 基础样式层
│       └── lk-button.scss   # 组件样式入口
└── composables/         # 跨组件复用 Composables
```

## 跨端兼容性

| 平台 | 支持情况 |
|------|---------|
| H5（Chrome / Safari） | 支持 |
| App（plus） | 支持 |
| 微信小程序 | 支持 |
| 支付宝 / 百度 / 抖音 / QQ 等小程序 | 基于 UniApp 当前运行端能力支持 |

> 组件默认按 UniApp 跨端能力实现；涉及开放能力、原生组件、Canvas、CSS 渲染或系统安全区的差异，以当前运行端能力和目标端验收为准。
