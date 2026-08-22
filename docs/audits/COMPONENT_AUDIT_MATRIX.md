# Lucky UI 组件审计矩阵

## 使用说明

- 源码基线：`develop@c8071e6`。
- `文件` 统计组件目录内全部文件，`行数` 统计全部文本扩展名的 UTF-8 物理行；当前表格已重新生成，分母为 324 个文件，其中 322 个文本文件共 58,674 行，另有 2 个字体二进制文件。
- `文档/单测/demo` 只表示文件是否存在，不代表内容正确或覆盖充分。
- 静态状态只有在组件目录、共享依赖、文档、demo、测试逐行核对完成后才能改为“完成”。
- H5 与微信状态只有在确定性演练场完成结构化抓取后才能改为“完成”。
- 组件表的“主归属问题数”只统计报告中唯一主归属到该组件的问题；批次级文档、演练场、测试与无障碍问题单列在报告中，因此批次问题总数可能大于组件列之和。问题在完成双端前后证据前保持 open、fixing 或 verifying。
- 风险等级来自现有兼容矩阵，仅用于排序，不是审计结论。`未分类` 本身就是工具覆盖缺口。

当前真实进度：共享层静态 77/77 文件、10,338/10,338 行；组件静态 73/73，包含 A1 6 个、A2 11 个、A3 11 个、A4 15 个、A5A 16 个、A5B 6 个、A6 8 个组件。H5 仅对 Anchor 滚动与 Form 校验取得部分 E2 证据，不能折算为任一组件“全场景完成”；微信运行态仍为 0/73。静态 73/73 只证明当前基线已经逐行审阅，不代表问题已修复或跨端已通过。

## 共享层覆盖

| 区域 | 文件 | 行数 | 静态 | H5 | 微信 | 问题数 |
| --- | ---: | ---: | --- | --- | --- | ---: |
| `components/common` | 1 | 195 | 完成（A0） | 待抓取 | 待抓取 | 2 |
| `core` | 21 | 3,782 | 完成（A0） | 待抓取 | 待抓取 | 20 |
| `composables` | 6 | 1,593 | 完成（A0） | 待抓取 | 待抓取 | 7 |
| `utils` | 4 | 293 | 完成（A0） | 待抓取 | 待抓取 | 2 |
| `theme` | 32 | 2,632 | 完成（A0） | 待抓取 | 待抓取 | 8 |
| `locale` | 9 | 1,374 | 完成（A0） | 待抓取 | 待抓取 | 2 |
| 包入口、导出、类型与发布元数据 | 4 | 469 | 完成（A0） | 不适用 | 不适用 | 2 |

## 组件覆盖

| 组件 | 风险 | 文件 | 行数 | 文档 | 单测 | demo | 静态 | H5 | 微信 | 主归属问题数 |
| --- | --- | ---: | ---: | :---: | :---: | :---: | --- | --- | --- | ---: |
| lk-action-sheet | 中 | 4 | 440 | Y | Y | Y | 完成（A2） | 待抓取 | 待抓取 | 2 |
| lk-anchor | 中 | 5 | 819 | Y | Y | Y | 完成（A3） | 部分 E2，非全场景 | 待抓取 | 3 |
| lk-avatar | 低 | 4 | 227 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 3 |
| lk-backtop | 中 | 4 | 365 | Y | Y | Y | 完成（A3） | 待抓取 | 待抓取 | 1 |
| lk-badge | 低 | 4 | 265 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 2 |
| lk-button | 低 | 4 | 608 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 1 |
| lk-calendar | 低 | 4 | 1,475 | Y | Y | Y | 完成（A5B） | 待抓取 | 待抓取 | 8 |
| lk-calendar-picker | 低 | 4 | 703 | Y | Y | Y | 完成（A5B） | 待抓取 | 待抓取 | 4 |
| lk-card | 低 | 4 | 293 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 3 |
| lk-carousel | 中 | 5 | 1,013 | Y | Y | Y | 完成（A3） | 待抓取 | 待抓取 | 3 |
| lk-cell | 低 | 5 | 359 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 3 |
| lk-chart-area | 低 | 4 | 561 | Y | Y | Y | 完成（A6） | 待抓取 | 待抓取 | 0 |
| lk-chart-bar | 低 | 4 | 873 | Y | Y | Y | 完成（A6） | 待抓取 | 待抓取 | 1 |
| lk-chart-line | 低 | 4 | 1,003 | Y | Y | Y | 完成（A6） | 待抓取 | 待抓取 | 1 |
| lk-chart-pie | 低 | 4 | 889 | Y | Y | Y | 完成（A6） | 待抓取 | 待抓取 | 3 |
| lk-chart-radar-lite | 低 | 4 | 562 | Y | Y | Y | 完成（A6） | 待抓取 | 待抓取 | 0 |
| lk-chart-ring | 低 | 4 | 485 | Y | Y | Y | 完成（A6） | 待抓取 | 待抓取 | 0 |
| lk-chart-sparkline | 低 | 4 | 524 | Y | Y | Y | 完成（A6） | 待抓取 | 待抓取 | 0 |
| lk-chart-stat-card | 低 | 4 | 319 | Y | Y | Y | 完成（A6） | 待抓取 | 待抓取 | 1 |
| lk-checkbox | 低 | 5 | 658 | Y | Y | Y | 完成（A4） | 待抓取 | 待抓取 | 1 |
| lk-choice | 低 | 4 | 291 | Y | Y | Y | 完成（A4） | 待抓取 | 待抓取 | 1 |
| lk-collapse | 中 | 5 | 473 | Y | Y | Y | 完成（A3） | 待抓取 | 待抓取 | 3 |
| lk-countdown | 中 | 4 | 759 | Y | Y | Y | 完成（A5B） | 待抓取 | 待抓取 | 5 |
| lk-curtain | 中 | 4 | 478 | Y | Y | Y | 完成（A2） | 待抓取 | 待抓取 | 2 |
| lk-divider | 低 | 4 | 253 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 1 |
| lk-dropdown | 中 | 6 | 1,205 | Y | Y | Y | 完成（A2） | 待抓取 | 待抓取 | 3 |
| lk-empty | 低 | 6 | 540 | Y | Y | Y | 完成（A2） | 待抓取 | 待抓取 | 1 |
| lk-fab | 中 | 4 | 891 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 7 |
| lk-form | 中 | 6 | 1,147 | Y | Y | Y | 完成（A4） | 部分 E2，非全场景 | 待抓取 | 8 |
| lk-form-group | 低 | 3 | 78 | Y | N | Y | 完成（A4） | 待抓取 | 待抓取 | 0 |
| lk-grid | 低 | 7 | 316 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 6 |
| lk-horizontal-scroll | 中 | 4 | 139 | Y | Y | Y | 完成（A3） | 待抓取 | 待抓取 | 2 |
| lk-icon | 低 | 15 | 15,927 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 5 |
| lk-image | 中 | 4 | 285 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 5 |
| lk-input | 中 | 4 | 832 | Y | Y | Y | 完成（A4） | 待抓取 | 待抓取 | 1 |
| lk-keyboard | 中 | 4 | 1,023 | Y | Y | Y | 完成（A4） | 待抓取 | 待抓取 | 3 |
| lk-loading | 中 | 4 | 458 | Y | Y | Y | 完成（A2） | 待抓取 | 待抓取 | 2 |
| lk-meta-row | 低 | 4 | 204 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 2 |
| lk-modal | 中 | 4 | 574 | Y | Y | Y | 完成（A2） | 待抓取 | 待抓取 | 3 |
| lk-navbar | 中 | 4 | 613 | Y | Y | Y | 完成（A3） | 待抓取 | 待抓取 | 3 |
| lk-notice-bar | 中 | 4 | 442 | Y | Y | Y | 完成（A2） | 待抓取 | 待抓取 | 2 |
| lk-number-roller | 低 | 4 | 408 | Y | Y | Y | 完成（A5B） | 待抓取 | 待抓取 | 4 |
| lk-overlay | 中 | 4 | 218 | Y | Y | Y | 完成（A2） | 待抓取 | 待抓取 | 1 |
| lk-page | 低 | 3 | 241 | Y | N | Y | 完成（A5A） | 待抓取 | 待抓取 | 2 |
| lk-picker | 高 | 4 | 1,153 | Y | Y | Y | 完成（A1） | 待抓取 | 待抓取 | 3 |
| lk-popup | 中 | 4 | 1,122 | Y | Y | Y | 完成（A2） | 待抓取 | 待抓取 | 5 |
| lk-preload-debugger | 未分类 | 4 | 546 | Y | Y | 嵌入 | 完成（A1） | 待抓取 | 待抓取 | 3 |
| lk-progress | 低 | 4 | 273 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 4 |
| lk-pull-refresh | 中 | 4 | 575 | Y | Y | Y | 完成（A3） | 待抓取 | 待抓取 | 3 |
| lk-radio | 低 | 5 | 553 | Y | Y | Y | 完成（A4） | 待抓取 | 待抓取 | 0 |
| lk-rate | 低 | 4 | 264 | Y | Y | Y | 完成（A4） | 待抓取 | 待抓取 | 2 |
| lk-root | 未分类 | 4 | 252 | Y | N | Y | 完成（A1） | 待抓取 | 待抓取 | 2 |
| lk-segmented | 低 | 4 | 472 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 5 |
| lk-select-list | 低 | 4 | 551 | Y | Y | Y | 完成（A4） | 待抓取 | 待抓取 | 1 |
| lk-skeleton | 低 | 4 | 258 | Y | Y | Y | 完成（A2） | 待抓取 | 待抓取 | 2 |
| lk-slider | 中 | 4 | 767 | Y | Y | Y | 完成（A4） | 待抓取 | 待抓取 | 3 |
| lk-space | 低 | 4 | 213 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 2 |
| lk-stepper | 低 | 4 | 584 | Y | Y | Y | 完成（A4） | 待抓取 | 待抓取 | 2 |
| lk-sticky | 中 | 4 | 187 | Y | Y | Y | 完成（A3） | 待抓取 | 待抓取 | 3 |
| lk-switch | 中 | 4 | 424 | Y | Y | Y | 完成（A4） | 待抓取 | 待抓取 | 1 |
| lk-tab | 低 | 4 | 797 | Y | N | Y | 完成（A3） | 待抓取 | 待抓取 | 2 |
| lk-tabbar | 中 | 7 | 1,115 | Y | Y | Y | 完成（A3） | 待抓取 | 待抓取 | 5 |
| lk-tabbar-container | 高 | 4 | 1,029 | Y | Y | Y | 完成（A1） | 待抓取 | 待抓取 | 7 |
| lk-tag | 低 | 4 | 354 | Y | Y | Y | 完成（A5A） | 待抓取 | 待抓取 | 3 |
| lk-textarea | 低 | 4 | 594 | Y | Y | Y | 完成（A4） | 待抓取 | 待抓取 | 3 |
| lk-timeline | 中 | 6 | 1,074 | Y | Y | Y | 完成（A5B） | 待抓取 | 待抓取 | 5 |
| lk-toast | 中 | 7 | 568 | Y | Y | Y | 完成（A2） | 待抓取 | 待抓取 | 5 |
| lk-tooltip | 高 | 4 | 792 | Y | Y | Y | 完成（A1） | 待抓取 | 待抓取 | 4 |
| lk-upload | 中 | 4 | 967 | Y | Y | Y | 完成（A4） | 待抓取 | 待抓取 | 7 |
| lk-verify-code | 低 | 4 | 851 | Y | Y | Y | 完成（A4） | 待抓取 | 待抓取 | 3 |
| lk-virtual-list | 中 | 4 | 640 | Y | Y | Y | 完成（A3） | 待抓取 | 待抓取 | 4 |
| lk-waterfall | 高 | 4 | 1,127 | Y | Y | Y | 完成（A1） | 待抓取 | 待抓取 | 7 |
| lk-watermark | 中 | 4 | 336 | Y | Y | Y | 完成（A5B） | 待抓取 | 待抓取 | 4 |

## 审计批次

| 批次 | 范围 | 目的 |
| --- | --- | --- |
| A0 | common、core、composables、utils、theme、locale、导出与类型 | 先确认所有组件共同依赖的行为与 token |
| A1 | picker、tabbar-container、tooltip、waterfall、root、preload-debugger | 高风险与风险矩阵漏项；已完成，前四个 29 文件/7,184 行，Root/Debugger 另行登记 |
| A2 | action-sheet、curtain、dropdown、modal、overlay、popup、toast、loading、skeleton、empty、notice-bar | 已完成：116 个唯一文件、16,120 行、31 项问题；H5/微信待修复后抓取 |
| A3 | anchor、backtop、carousel、collapse、horizontal-scroll、navbar、pull-refresh、sticky、tab、tabbar、virtual-list | 已完成：100 个唯一文件、15,267 行、35 项问题；仅 Anchor 有部分 H5 E2 |
| A4 | form、form-group、input、textarea、checkbox、radio、choice、select-list、slider、stepper、switch、rate、upload、verify-code、keyboard | 已完成：123 个唯一文件、20,045 行、40 项问题；仅 Form 有部分 H5 E2 |
| A5A | avatar、badge、button、card、cell、divider、fab、grid、icon、image、meta-row、page、progress、segmented、space、tag | 已完成：176 个唯一文件；174 个文本文件 35,603 行、2 个字体二进制 148,404 bytes；60 项问题；H5/微信待修复后抓取 |
| A5B | calendar、calendar-picker、countdown、number-roller、timeline、watermark | 已完成：79 个唯一文件、14,598 行、31 项问题；H5/微信待修复后抓取 |
| A6 | chart-area、chart-bar、chart-line、chart-pie、chart-radar-lite、chart-ring、chart-sparkline、chart-stat-card | 已完成：89 个唯一文件、16,425 行、28 项问题；H5/微信待修复后抓取 |

## 已确认的覆盖缺口

| 编号 | 严重度 | 分类 | 内容 | 状态 |
| --- | --- | --- | --- | --- |
| AUD-TOOL-001 | P2 | DOC/test-gap | 现有风险矩阵漏掉 `lk-root` 与 `lk-preload-debugger`，并用聚合展示项 `lk-chart-lite` 占据一行，实际覆盖 71/73 | open |
| AUD-TEST-001 | P2 | DOC/test-gap | `lk-form-group`、`lk-page`、`lk-root`、`lk-tab` 无独立单测文件 | open |
| AUD-DEMO-001 | P2 | DOC/demo-only | `lk-preload-debugger` 无独立 demo，无法进入统一运行态演练 | open |

后续问题必须使用审计协议中的完整模板，不能只在本表增加一句描述。
