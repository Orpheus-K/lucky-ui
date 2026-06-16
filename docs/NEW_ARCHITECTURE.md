# Lucky UI 组件演示系统 - 新架构设计

## 📋 架构概述

采用 **组件分类 + 详情页跳转** 的双层架构,提供更好的组件浏览和学习体验。

## 🏗️ 页面结构

### 一级导航 (Tabbar)

```
┌─────────────────────────────────────┐
│  [总览] [基础] [表单] [反馈]  🔍   │
└─────────────────────────────────────┘
```

1. **总览页** (`overview`) - 组件导航中心
   - 展示所有 52 个组件的分类卡片
   - 按 7 大分类展示:基础/表单/数据展示/反馈/导航/布局/高级
   - 点击卡片跳转到详情页

2. **基础页** (`basic`) - 基础组件列表
   - Button、Icon、Tag、Badge、Avatar、Divider、NoticeBar、Image
   - 列表形式展示,点击跳转详情

3. **表单页** (`form`) - 表单组件列表
   - Form、Input、Textarea、Select、Radio、Checkbox、Switch、Stepper、Slider、Rate、Upload 等
   - 列表形式展示,点击跳转详情

4. **反馈页** (`feedback`) - 反馈组件列表
   - Modal、Popup、Toast、ActionSheet、Drawer、Overlay、Tooltip、Dropdown 等
   - 列表形式展示,点击跳转详情

### 二级页面 (详情页)

**路径**: `/pages/component-detail/index`

**参数**: `componentName` (组件名称,如 'button', 'input')

**功能**:
- 动态加载对应组件的详细演示
- 展示所有属性、尺寸、状态、事件等
- 提供代码示例和 API 文档
- 可复制代码片段

## 📦 组件分类

### 1. 基础组件 (Basic) - 8个
- Button 按钮
- Icon 图标
- Tag 标签
- Badge 徽标
- Avatar 头像
- Divider 分割线
- NoticeBar 通知栏
- Image 图片

### 2. 表单组件 (Form) - 11个
- Form 表单
- Input 输入框
- Textarea 多行输入
- Select 选择器
- Radio 单选框
- Checkbox 复选框
- Switch 开关
- Stepper 步进器
- Slider 滑块
- Rate 评分
- Upload 上传

### 3. 数据展示 (Display) - 12个
- Card 卡片
- Cell 单元格
- Collapse 折叠面板
- Table 表格
- Timeline 时间轴
- Steps 步骤条
- Progress 进度条
- Loading 加载
- Skeleton 骨架屏
- Carousel 轮播图
- Segmented 分段器
- Pagination 分页

### 4. 反馈组件 (Feedback) - 8个
- Modal 模态框
- Popup 弹出层
- Toast 轻提示
- ActionSheet 动作面板
- Drawer 抽屉
- Overlay 遮罩层
- Tooltip 文字提示
- Dropdown 下拉菜单

### 5. 导航组件 (Navigation) - 3个
- Navbar 导航栏
- Tabbar 标签栏
- Breadcrumb 面包屑

### 6. 布局组件 (Layout) - 0个
- (暂无独立布局组件,使用 uni-app 内置布局)

### 7. 高级组件 (Advanced) - 6个
- Cascader 级联选择
- Tree 树形控件
- VirtualList 虚拟列表

## 🎨 UI 设计

### 总览页卡片样式

```vue
<view class="category-section">
  <view class="category-title">基础组件</view>
  <view class="component-grid">
    <view class="component-card" @click="navigateToDetail('button')">
      <lk-icon name="square-fill" size="48" color="primary" />
      <text class="card-name">Button</text>
      <text class="card-desc">按钮</text>
    </view>
    <!-- 更多卡片... -->
  </view>
</view>
```

### 列表页样式

```vue
<view class="component-list">
  <lk-cell 
    title="Button 按钮" 
    label="用于触发操作的交互元素"
    is-link
    @click="navigateToDetail('button')"
  >
    <template #icon>
      <lk-icon name="square-fill" size="40" color="primary" />
    </template>
  </lk-cell>
  <!-- 更多列表项... -->
</view>
```

### 详情页结构

```vue
<template>
  <view class="detail-page">
    <lk-navbar title="Button 按钮" />
    
    <!-- 组件预览 -->
    <view class="preview-section">
      <component :is="currentDemo" />
    </view>
    
    <!-- API 文档 -->
    <view class="api-section">
      <view class="api-title">属性</view>
      <lk-table :data="props" />
      
      <view class="api-title">事件</view>
      <lk-table :data="events" />
    </view>
  </view>
</template>
```

## 🚀 路由跳转

```typescript
// 从总览/列表页跳转到详情页
const navigateToDetail = (componentName: string) => {
  uni.navigateTo({
    url: `/pages/component-detail/index?name=${componentName}`
  });
};

// 详情页接收参数
onLoad((options) => {
  const componentName = options.name;
  // 加载对应组件演示
});
```

## 📁 文件结构

```
src/pages/
├── index/
│   ├── index.vue           # 主容器(Tabbar)
│   ├── HomePage.vue        # 总览页(组件导航中心)
│   ├── BasicPage.vue       # 基础组件列表
│   ├── FormPage.vue        # 表单组件列表
│   └── FeedbackPage.vue    # 反馈组件列表
└── component-detail/
    └── index.vue           # 组件详情页(动态加载)

src/components/demos/       # 各组件详细演示
├── ButtonDemo.vue
├── InputDemo.vue
├── ModalDemo.vue
└── ...

src/components/
└── ComponentCard.vue       # 组件卡片(复用组件)
```

## 🎯 实现步骤

### Phase 1: 架构重构 ✅
- [x] 修改 Tabbar 为组件分类导航
- [x] 重命名子页面组件
- [x] 更新路由和标题

### Phase 2: 总览页 (HomePage)
- [ ] 设计 7 大分类卡片布局
- [ ] 实现组件卡片网格
- [ ] 添加分类筛选和搜索
- [ ] 实现跳转逻辑

### Phase 3: 列表页 (BasicPage/FormPage/FeedbackPage)
- [ ] 使用 Cell 组件展示组件列表
- [ ] 添加图标和描述
- [ ] 实现点击跳转

### Phase 4: 详情页
- [ ] 创建详情页路由
- [ ] 实现动态组件加载
- [ ] 添加 API 文档展示

### Phase 5: 组件演示
- [ ] 为每个组件创建详细演示组件
- [ ] 实现代码示例和复制功能
- [ ] 添加交互演示

## 💡 优势

1. **清晰的分类** - 用户可以快速找到需要的组件
2. **深度演示** - 每个组件有独立详情页,展示更完整
3. **良好的导航** - Tabbar + 跳转双层导航,体验流畅
4. **易于扩展** - 添加新组件只需创建对应 Demo 组件
5. **代码复用** - ComponentCard 等组件可复用
