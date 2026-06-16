"""覆盖写入组件分类总览页"""
import os

INDEX_CONTENT = """\
# 组件总览

Lucky UI 共收录 **65+** 个组件，按功能分为以下几类。

::: tip 右侧实时预览
每个组件文档页右侧都有**手机模拟器**，
需先运行 `pnpm run dev:h5`（H5 服务默认 5173 端口），刷新文档页即可看到实时效果。
:::

## 基础元素

| 组件 | 说明 |
|------|------|
| [Button 按钮](./basic/button) | 触发操作的主入口，支持多变体、尺寸、形状 |
| [Icon 图标](./basic/icon) | Bootstrap Icons 封装，颜色/尺寸可控 |
| [Avatar 头像](./basic/avatar) | 图片/文字/图标三种形式，支持堆叠 |
| [Badge 徽标](./basic/badge) | 数字/红点/文字类型，灵活叠加在子元素上 |
| [Tag 标签](./basic/tag) | 状态和属性标注，支持关闭与多变体 |
| [Divider 分割线](./basic/divider) | 水平/垂直方向分隔，支持文字插入 |
| [Cell 单元格](./basic/cell) | 列表行，内置图标/箭头/右侧自定义插槽 |

## 布局

| 组件 | 说明 |
|------|------|
| [Grid 宫格](./grid) | 等分网格布局，图标入口首选 |
| [Space 间距](./space) | 子元素之间的统一间距容器 |

## 表单控件

| 组件 | 说明 |
|------|------|
| [Form 表单](./form) | 统一的表单验证容器 |
| [Input 输入框](./input) | 单行文本，前缀图标/清空/字数统计 |
| [Textarea 文本域](./textarea) | 多行文本，支持自适应高度 |
| [Radio 单选框](./radio) | 单选，支持 dot/check 两种图标 |
| [Checkbox 复选框](./checkbox) | 多选，支持全选/中间态 |
| [Switch 开关](./switch) | 布尔值开关，颜色可定制 |
| [Stepper 步进器](./stepper) | 数量增减控件 |
| [Slider 滑块](./slider) | 范围选择，支持区间模式 |
| [Rate 评分](./rate) | 星级评分，支持交互与只读 |
| [Upload 上传](./upload) | 图片/文件选择与预览 |
| [Date Picker 日期选择](./date-picker) | 年/月/日选择 |
| [Keyboard 键盘](./keyboard) | 数字/身份证/车牌等模式 |
| [Verify Code 验证码](./verify-code) | N 格验证码输入框 |

## 数据展示

| 组件 | 说明 |
|------|------|
| [Card 卡片](./card) | 带圆角阴影的容器 |
| [Carousel 轮播](./carousel) | 自动播放、指示点、Loop |
| [Collapse 折叠面板](./collapse) | 手风琴/多展开模式 |
| [Timeline 时间轴](./timeline) | 纵向时间线 |
| [Steps 步骤条](./steps) | 横向/纵向步骤指引 |
| [Progress 进度条](./progress) | 线形/圆形进度 |
| [Loading 加载](./loading) | 多形态加载动效 |
| [Skeleton 骨架屏](./skeleton) | 内容加载中的占位动画 |
| [Number Roller 数字滚动](./number-roller) | 数值变化卷动动效 |
| [Image 图片](./image) | 懒加载/多裁剪/加载失败兜底 |
| [Virtual List 虚拟列表](./virtual-list) | 超长列表高性能渲染 |
| [Waterfall 瀑布流](./waterfall) | 不等高卡片双列布局 |

## 图表

| 组件 | 说明 |
|------|------|
| [ChartBar 柱状图](./chart-bar) | Canvas 绘制柱形图 |
| [ChartLine 折线图](./chart-line) | Canvas 绘制折线/面积图 |
| [ChartPie 饼图](./chart-pie) | Canvas 绘制饼图/环形图 |

## 导航

| 组件 | 说明 |
|------|------|
| [Navbar 导航栏](./navbar) | 自定义顶部导航栏，适配安全区 |
| [Tabbar 底部导航](./tabbar) | 底部 Tab 栏，图标/徽标支持 |
| [Segmented 分段器](./segmented) | 紧凑分段控制 |
| [Anchor 锚点导航](./anchor) | 页面内区块快速跳转 |
| [Backtop 返回顶部](./backtop) | 滚动到顶的悬浮按钮 |

## 反馈与浮层

| 组件 | 说明 |
|------|------|
| [Modal 模态框](./modal) | 带遮罩的对话框，多种动画 |
| [Popup 弹出层](./popup) | 四方向弹出容器 |
| [Toast 轻提示](./toast) | 全局轻量通知，自动消失 |
| [Action Sheet 动作面板](./action-sheet) | 从底部弹出的操作菜单 |
| [Overlay 遮罩层](./overlay) | 独立遮罩层 |
| [Tooltip 文字提示](./tooltip) | 气泡提示 |
| [Dropdown 下拉菜单](./dropdown) | 点击触发的下拉菜单 |
| [Notice Bar 通知栏](./notice-bar) | 横幅通知，支持滚动 |

## 高级

| 组件 | 说明 |
|------|------|
| [Fab 悬浮按钮](./fab) | 可拖拽的悬浮操作按钮 |
| [Curtain 幕帘](./curtain) | 从边缘拉出的抽屉式浮层 |
| [Horizontal Scroll 横向滚动](./horizontal-scroll) | 横向滑动容器 |
| [Preload 预加载调试](./preload) | 开发阶段预加载状态面板 |
"""

with open(r'f:\luckyone\ui\docs\components\index.md', 'w', encoding='utf-8') as f:
    f.write(INDEX_CONTENT)
print('index.md written!')
