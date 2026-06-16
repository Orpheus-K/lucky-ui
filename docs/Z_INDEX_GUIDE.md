# Lucky UI Z-Index 层级管理规范

## 设计原则

为确保组件的正确层叠顺序，Lucky UI 采用了标准化的 z-index 分层设计。所有弹出类组件应始终显示在固定导航组件（Navbar、Tabbar）之上。

## 层级分布

```
┌─────────────────────────────────────────────────────────────┐
│  调试层 (9999)         - 开发调试工具                         │
├─────────────────────────────────────────────────────────────┤
│  消息层 (2000-2499)                                          │
│    └─ Toast (2000)     - 轻提示                              │
│    └─ Notify (2100)    - 通知消息                            │
│    └─ Loading (2200)   - 全局加载                            │
├─────────────────────────────────────────────────────────────┤
│  高优先级模态层 (1500-1999)                                   │
│    └─ Modal (1500)     - 模态框/对话框                        │
├─────────────────────────────────────────────────────────────┤
│  模态层 (1000-1499)                                          │
│    └─ Popup (1000)     - 弹出层                              │
│    └─ ActionSheet      - 动作面板 (继承 Popup)                │
│    └─ Picker           - 选择器 (继承 Popup)                  │
├─────────────────────────────────────────────────────────────┤
│  遮罩层 (900-999)                                            │
│    └─ Overlay (900)    - 遮罩/蒙层                           │
├─────────────────────────────────────────────────────────────┤
│  弹出层-无遮罩 (500-899)                                      │
│    └─ Dropdown (500)   - 下拉菜单                            │
│    └─ Tooltip (600)    - 提示框                              │
│    └─ Popover (700)    - 气泡弹出                            │
├─────────────────────────────────────────────────────────────┤
│  导航层 (100-499)                                            │
│    └─ Sticky (100)     - 吸顶元素                            │
│    └─ Navbar (200)     - 顶部导航栏                          │
│    └─ Tabbar (300)     - 底部标签栏                          │
│    └─ FAB (400)        - 悬浮按钮                            │
├─────────────────────────────────────────────────────────────┤
│  内容层 (1-99)                                               │
│    └─ Base (1)         - 基础元素                            │
│    └─ Content (10)     - 浮动内容                            │
└─────────────────────────────────────────────────────────────┘
```

## CSS 变量

所有层级值已定义为 CSS 变量，可在 `component-vars.scss` 中找到：

```scss
:root {
  /* 导航层 */
  --lk-z-index-sticky: 100;
  --lk-z-index-navbar: 200;
  --lk-z-index-tabbar: 300;
  --lk-z-index-fab: 400;

  /* 弹出层（不带遮罩） */
  --lk-z-index-dropdown: 500;
  --lk-z-index-tooltip: 600;
  --lk-z-index-popover: 700;

  /* 遮罩层 */
  --lk-z-index-overlay: 900;

  /* 模态层（带遮罩） */
  --lk-z-index-popup: 1000;
  --lk-z-index-modal: 1500;

  /* 消息层 */
  --lk-z-index-toast: 2000;
  --lk-z-index-notify: 2100;
  --lk-z-index-loading: 2200;
}
```

## SCSS 变量

同时提供 SCSS 变量供样式文件直接使用（见 `theme/src/tokens/_z-index.scss`）：

```scss
$z-index-base: 1;
$z-index-content: 10;
$z-index-sticky: 100;
$z-index-navbar: 200;
$z-index-tabbar: 300;
$z-index-fab: 400;
$z-index-dropdown: 500;
$z-index-tooltip: 600;
$z-index-popover: 700;
$z-index-overlay: 900;
$z-index-popup: 1000;
$z-index-modal: 1500;
$z-index-toast: 2000;
$z-index-notify: 2100;
$z-index-loading: 2200;
$z-index-top: 9999;
```

## 组件默认 zIndex

| 组件              | 默认 zIndex | 说明                   |
| ----------------- | ----------- | ---------------------- |
| `lk-navbar`       | 200         | 顶部导航栏             |
| `lk-tabbar`       | 300         | 底部标签栏             |
| `lk-overlay`      | 900         | 遮罩层                 |
| `lk-popup`        | 1000        | 弹出层（面板 +1）      |
| `lk-action-sheet` | 1000        | 动作面板（继承 popup） |
| `lk-modal`        | 1500        | 模态框（面板 +1）      |
| `lk-toast`        | 2000        | 轻提示（面板 +1）      |

## 使用建议

1. **不要随意修改默认值**：默认层级经过精心设计，能满足绝大多数场景
2. **如需自定义**：通过 `z-index` prop 传入，而非直接覆盖 CSS
3. **嵌套弹出层**：后打开的弹出层应使用更高的 z-index

```vue
<!-- 例：在 Popup 内部打开 Modal -->
<lk-popup v-model="showPopup" :z-index="1000">
  <lk-modal v-model="showModal" :z-index="1600">
    <!-- Modal 内容 -->
  </lk-modal>
</lk-popup>
```

## 常见问题

### Q: Popup 显示在 Tabbar 下方？

A: 检查 Tabbar 的 z-index 是否被错误设置为高于 1000。默认 Tabbar 为 300，Popup 为 1000。

### Q: Modal 被 Popup 遮挡？

A: Modal 默认 z-index 为 1500，高于 Popup 的 1000。如有特殊需求，可通过 prop 调整。

### Q: Toast 不显示或被遮挡？

A: Toast 默认 z-index 为 2000，是最高优先级的用户反馈组件，正常情况下不会被遮挡。
