# Lucky UI 组件演示实施方案

## 项目目标

将 Lucky UI 的 50+ 组件完整演示到各个 Tab 页面中,方便用户体验和测试各个组件功能。

## 页面规划

### 1. HomePage - 基础组件演示 ✅ 已完成基础架构

#### 组件列表
- **NoticeBar** 通知栏
- **Button** 按钮(所有变体、尺寸、状态)
- **Icon** 图标(常用图标展示+复制功能)
- **Tag** 标签(类型、尺寸、可关闭)
- **Badge** 徽章(数字、小红点、自定义内容)
- **Avatar** 头像(形状、尺寸、颜色)
- **Divider** 分割线(文字、虚线、自定义)

#### 实现要点
```vue
<!-- 使用 DemoBlock 组件统一布局 -->
<demo-block title="组件名称">
  <view class="demo-section">
    <text class="section-label">子分类</text>
    <view class="demo-row">
      <!-- 组件演示 -->
    </view>
  </view>
</demo-block>
```

### 2. DiscoverPage - 表单组件演示

#### 组件列表
- **Form** 表单(完整的表单验证示例)
- **Input** 输入框(各种类型、前后缀、清除、计数)
- **Textarea** 文本域(自适应高度、字数统计)
- **Select** 选择器(单选、多选)
- **Radio** 单选框(组合使用)
- **Checkbox** 复选框(单个、组、最大数量限制)
- **Switch** 开关(异步确认)
- **Stepper** 步进器(最小最大值)
- **Slider** 滑块(范围、步长)
- **Rate** 评分(半星、只读)
- **DateRangePicker** 日期范围选择器

#### 实现示例
```vue
<demo-block title="Form 表单验证">
  <lk-form ref="formRef" :model="form" :rules="rules">
    <lk-form-item prop="username" label="用户名">
      <lk-input v-model="form.username" placeholder="请输入" clearable />
    </lk-form-item>
    <!-- 更多表单项 -->
    <view class="form-actions">
      <lk-button @click="handleSubmit" type="primary" block>提交</lk-button>
    </view>
  </lk-form>
</demo-block>

<demo-block title="Input 输入框">
  <!-- 基础输入框 -->
  <lk-input v-model="text" placeholder="基础输入框" />
  
  <!-- 带图标 -->
  <lk-input v-model="search" placeholder="搜索">
    <template #prefix>
      <lk-icon name="search" />
    </template>
  </lk-input>
  
  <!-- 可清除 + 字数统计 -->
  <lk-input 
    v-model="note" 
    :maxlength="50" 
    show-count 
    clearable 
    placeholder="最多50字"
  />
</demo-block>
```

### 3. MessagePage - 数据展示组件

#### 组件列表
- **Card** 卡片(标题、副标题、操作按钮)
- **Cell** 单元格(标题、标签、箭头、图标)
- **CellGroup** 单元格组
- **Collapse** 折叠面板(手风琴模式)
- **Table** 表格(基础表格、边框、斑马纹)
- **Timeline** 时间轴(默认、镂空、自定义图标)
- **Steps** 步骤条(横向、纵向、点击切换)
- **Progress** 进度条(线性、环形、条纹动画)
- **Loading** 加载(各种样式)
- **Skeleton** 骨架屏(加载占位)
- **Carousel** 轮播(自动播放、指示器)
- **Breadcrumb** 面包屑(分隔符)
- **Pagination** 分页(页码、简洁模式)
- **Segmented** 分段控制器

#### 实现示例
```vue
<demo-block title="Card 卡片">
  <lk-card title="标题" sub-title="副标题" shadow="base">
    <text>卡片内容</text>
    <template #footer>
      <lk-button size="small">操作</lk-button>
    </template>
  </lk-card>
</demo-block>

<demo-block title="Progress 进度">
  <lk-progress :percentage="50" striped animated />
  <lk-progress type="circle" :percentage="75" :size="120" />
</demo-block>
```

### 4. MinePage - 反馈组件演示

#### 组件列表
- **Modal** 模态框(确认、取消、自定义内容)
- **Popup** 弹出层(上下左右中、圆角)
- **Toast** 轻提示(位置、图标、持续时间)
- **ActionSheet** 动作面板(选项列表)
- **Drawer** 抽屉(左右侧滑)
- **Overlay** 遮罩层
- **Tooltip** 文字提示(悬浮、点击触发)
- **Dropdown** 下拉菜单
- **Image** 图片(懒加载、预览)
- **Upload** 上传(多选、限制数量、预览)

#### 实现示例
```vue
<demo-block title="Modal 模态框">
  <lk-button @click="showModal = true">打开模态框</lk-button>
  <lk-modal 
    v-model="showModal" 
    title="提示" 
    @confirm="handleConfirm"
  >
    <text>这是模态框内容</text>
  </lk-modal>
</demo-block>

<demo-block title="Toast 提示">
  <view class="demo-row">
    <lk-button @click="showSuccessToast">成功提示</lk-button>
    <lk-button @click="showErrorToast">错误提示</lk-button>
    <lk-button @click="showLoadingToast">加载提示</lk-button>
  </view>
  <!-- 使用 ToastManager 全局管理 -->
  <lk-toast-manager />
</demo-block>

<demo-block title="ActionSheet 动作面板">
  <lk-button @click="sheetShow = true">打开动作面板</lk-button>
  <lk-action-sheet
    v-model="sheetShow"
    title="选择操作"
    :actions="[
      { name: '选项1' },
      { name: '选项2' },
      { name: '删除', color: 'red' }
    ]"
    @select="handleSelect"
  />
</demo-block>
```

### 5. 高级组件演示(可选单独页面)

#### 组件列表
- **Cascader** 级联选择器(省市区)
- **Tree** 树形控件(展开、勾选、懒加载)
- **VirtualList** 虚拟列表(大数据量渲染)

## 样式规范

### 统一的演示布局

```scss
// 页面容器
.tab-page {
  width: 100%;
  background: var(--lk-color-bg-page);
}

.tab-content {
  padding: 24rpx;
}

// 演示区块
.demo-section {
  margin-bottom: 24rpx;
}

.section-label {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--lk-color-text-secondary);
  margin-bottom: 16rpx;
}

// 横向排列
.demo-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

// 纵向排列
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
```

## 交互增强

### 1. 提示反馈
所有可点击的演示都应该有反馈:
```typescript
const showToast = (message: string) => {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
};
```

### 2. 复制功能
对于代码、图标名称等,提供复制功能:
```typescript
const copyText = (text: string) => {
  // #ifdef H5
  navigator.clipboard?.writeText(text);
  // #endif
  
  // #ifdef MP || APP-PLUS
  uni.setClipboardData({ data: text });
  // #endif
  
  showToast(`已复制: ${text}`);
};
```

### 3. 状态管理
演示中的状态要有初始值和重置功能:
```typescript
const formData = ref({
  username: '',
  password: '',
  // ...
});

const resetForm = () => {
  formData.value = {
    username: '',
    password: '',
  };
};
```

## 实施步骤

### 第一阶段:基础组件 (已完成)
- ✅ 创建富应用架构
- ✅ 使用 lk-tabbar 实现页面切换
- ✅ HomePage 基础框架

### 第二阶段:完善演示内容
1. 补充 HomePage 的所有基础组件演示
2. 改造 DiscoverPage 为表单组件演示
3. 改造 MessagePage 为数据展示组件演示
4. 改造 MinePage 为反馈组件演示

### 第三阶段:优化体验
1. 添加组件说明文案
2. 完善交互反馈
3. 添加代码复制功能
4. 性能优化(懒加载、按需渲染)

### 第四阶段:测试验证
1. H5 端测试
2. 小程序端测试
3. App 端测试
4. 修复兼容性问题

## 参考的优秀 UI 库演示

- **Ant Design Mobile**: https://mobile.ant.design/zh/components
  - 每个组件独立演示
  - 代码示例可展开
  - 实时交互预览

- **Vant**: https://vant-ui.github.io/vant/
  - 简洁明了的分类
  - 完整的 API 文档
  - 移动端优先

- **Element Plus**: https://element-plus.org/zh-CN/
  - 详细的组件说明
  - 多种使用场景
  - 代码高亮显示

## 注意事项

1. **组件属性验证**: 在使用组件前,先查看组件的 types 定义,确保属性类型正确
2. **条件编译**: 针对不同平台使用条件编译 `#ifdef H5 / MP / APP-PLUS`
3. **性能考虑**: 避免在同一页面渲染过多组件,可以按页面、路由或懒加载区块拆分
4. **主题适配**: 确保所有演示在亮色/暗色主题下都正常显示
5. **响应式**: 考虑不同屏幕尺寸的显示效果

## 快速开始

当前已完成:
- ✅ 富应用架构(使用 v-show 切换页面)
- ✅ lk-tabbar 集成(带 FAB 按钮)
- ✅ HomePage / DiscoverPage / MessagePage / MinePage 基础框架

下一步:
1. 完善 HomePage 的组件演示代码
2. 逐步添加其他页面的组件演示
3. 测试所有组件的交互功能
4. 优化样式和体验

## 开发建议

- 每完成一个组件的演示,立即测试功能是否正常
- 使用 `demo-block` 组件统一布局风格
- 为每个交互添加 Toast 提示反馈
- 保持代码简洁,注释清晰
- 参考原始的 `index-old.vue` 中的演示方式

---

**当前进度**: 架构搭建完成,等待添加详细组件演示 ✅
