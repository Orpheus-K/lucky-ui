import { defineConfig } from 'vitepress';

const LUCKY_UI_DOCS_PORT = 4188;

export default defineConfig({
  lang: 'zh-CN',
  title: 'Lucky UI',
  description: '注入精致美学设计的 Uni-app 跨端组件库，让跨端应用拥有令人心动的高颜值。',
  appearance: 'dark',
  lastUpdated: true,

  vite: {
    server: {
      port: LUCKY_UI_DOCS_PORT,
      strictPort: true,
    },
    preview: {
      port: LUCKY_UI_DOCS_PORT,
      strictPort: true,
    },
  },

  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'theme-color', content: '#837fe1' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,500&family=Inter:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@300;400;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap' }],
  ],

  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'Lucky UI',

    nav: [
      { text: '指南', link: '/guide/', activeMatch: '/guide/' },
      { text: '组件', link: '/components/', activeMatch: '/components/' },
      {
        text: '资源',
        items: [
          { text: '更新日志', link: '/changelog' },
          { text: 'GitHub', link: 'https://github.com/Orpheus-K/lucky-ui' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '安装与引入', link: '/guide/install' },
            { text: '主题定制', link: '/guide/theme' },
            { text: 'SVG 资产转换', link: '/guide/svg-assets' },
            { text: '国际化', link: '/guide/i18n' },
          ],
        },
        {
          text: 'UniApp 实战上架',
          collapsed: false,
          items: [
            { text: '真实开发技巧', link: '/guide/uniapp-production' },
            { text: '微信小程序发布', link: '/guide/uniapp-mp-weixin-release' },
            { text: 'App 打包上架', link: '/guide/uniapp-app-release' },
            { text: 'App 热更新策略', link: '/guide/uniapp-hot-update' },
            { text: 'iOS App Store 上架', link: '/guide/uniapp-ios-appstore' },
            { text: '上线与提审清单', link: '/guide/uniapp-release-checklist' },
          ],
        },
      ],

      '/components/': [
        {
          text: '概览',
          items: [{ text: '组件总览', link: '/components/' }],
        },
        {
          text: '基础元素',
          collapsed: false,
          items: [
            { text: 'Button 按钮', link: '/components/button' },
            { text: 'Icon 图标', link: '/components/icon' },
            { text: 'Avatar 头像', link: '/components/avatar' },
            { text: 'Badge 徽标', link: '/components/badge' },
            { text: 'Tag 标签', link: '/components/tag' },
            { text: 'Divider 分割线', link: '/components/divider' },
            { text: 'Cell 单元格', link: '/components/cell' },
          ],
        },
        {
          text: '布局',
          collapsed: false,
          items: [
            { text: 'Root 根节点', link: '/components/root' },
            { text: 'Page 页面容器', link: '/components/page' },
            { text: 'Grid 宫格', link: '/components/grid' },
            { text: 'Space 间距', link: '/components/space' },
            { text: 'MetaRow 结构行', link: '/components/meta-row' },
            { text: 'Choice 快选', link: '/components/choice' },
          ],
        },
        {
          text: '表单控件',
          collapsed: false,
          items: [
            { text: 'Form 表单', link: '/components/form' },
            { text: 'FormGroup 表单分组', link: '/components/form-group' },
            { text: 'Input 输入框', link: '/components/input' },
            { text: 'Textarea 文本域', link: '/components/textarea' },
            { text: 'Radio 单选框', link: '/components/radio' },
            { text: 'Checkbox 复选框', link: '/components/checkbox' },
            { text: 'SelectList 选择列表', link: '/components/select-list' },
            { text: 'Switch 开关', link: '/components/switch' },
            { text: 'Stepper 步进器', link: '/components/stepper' },
            { text: 'Slider 滑块', link: '/components/slider' },
            { text: 'Rate 评分', link: '/components/rate' },
            { text: 'Upload 文件上传', link: '/components/upload' },
            { text: 'Picker 选择器', link: '/components/picker' },
            { text: 'Calendar 日历', link: '/components/calendar' },
            { text: 'CalendarPicker 日历选择器', link: '/components/calendar-picker' },
            { text: 'Keyboard 键盘', link: '/components/keyboard' },
            { text: 'Verify Code 验证码', link: '/components/verify-code' },
          ],
        },
        {
          text: '数据展示',
          collapsed: false,
          items: [
            { text: 'Card 卡片', link: '/components/card' },
            { text: 'Carousel 轮播', link: '/components/carousel' },
            { text: 'Collapse 折叠面板', link: '/components/collapse' },
            { text: 'Timeline 时间轴', link: '/components/timeline' },
            { text: 'Progress 进度条', link: '/components/progress' },
            { text: 'PullRefresh 下拉刷新', link: '/components/pull-refresh' },
            { text: 'Loading 加载', link: '/components/loading' },
            { text: 'Countdown 倒计时', link: '/components/countdown' },
            { text: 'Skeleton 骨架屏', link: '/components/skeleton' },
            { text: 'Empty 空状态', link: '/components/empty' },
            { text: 'Number Roller 数字滚动', link: '/components/number-roller' },
            { text: 'Image 图片', link: '/components/image' },
            { text: 'Virtual List 虚拟列表', link: '/components/virtual-list' },
            { text: 'Waterfall 瀑布流', link: '/components/waterfall' },
            { text: 'Watermark 水印', link: '/components/watermark' },
          ],
        },
        {
          text: '图表',
          collapsed: true,
          items: [
            { text: 'ChartBar 柱状图', link: '/components/chart-bar' },
            { text: 'ChartLine 折线图', link: '/components/chart-line' },
            { text: 'ChartArea 面积趋势图', link: '/components/chart-area' },
            { text: 'ChartPie 饼图', link: '/components/chart-pie' },
            { text: 'ChartLite 聚合图表', link: '/components/chart-lite' },
            { text: 'ChartRing 环形图', link: '/components/chart-ring' },
            { text: 'ChartSparkline 迷你趋势线', link: '/components/chart-sparkline' },
            { text: 'ChartStatCard 指标卡', link: '/components/chart-stat-card' },
            { text: 'ChartRadarLite 雷达图', link: '/components/chart-radar-lite' },
          ],
        },
        {
          text: '导航',
          collapsed: false,
          items: [
            { text: 'Navbar 导航栏', link: '/components/navbar' },
            { text: 'Tab 标签页', link: '/components/tab' },
            { text: 'Tabbar 底部导航', link: '/components/tabbar' },
            { text: 'Tabbar 容器', link: '/components/tabbar-container' },
            { text: 'Segmented 分段器', link: '/components/segmented' },
            { text: 'Anchor 锚点导航', link: '/components/anchor' },
            { text: 'Sticky 粘性布局', link: '/components/sticky' },
            { text: 'Backtop 返回顶部', link: '/components/backtop' },
          ],
        },
        {
          text: '反馈与浮层',
          collapsed: false,
          items: [
            { text: 'Modal 模态框', link: '/components/modal' },
            { text: 'Popup 弹出层', link: '/components/popup' },
            { text: 'Toast 轻提示', link: '/components/toast' },
            { text: 'Action Sheet 动作面板', link: '/components/action-sheet' },
            { text: 'Overlay 遮罩层', link: '/components/overlay' },
            { text: 'Tooltip 文字提示', link: '/components/tooltip' },
            { text: 'Dropdown 下拉菜单', link: '/components/dropdown' },
            { text: 'Notice Bar 通知栏', link: '/components/notice-bar' },
          ],
        },
        {
          text: '高级',
          collapsed: true,
          items: [
            { text: 'Fab 悬浮按钮', link: '/components/fab' },
            { text: 'Curtain 幕帘', link: '/components/curtain' },
            { text: 'Horizontal Scroll 横向滚动', link: '/components/horizontal-scroll' },
          ],
        },
        {
          text: '工具与能力',
          collapsed: true,
          items: [
            { text: 'Hooks 与工具', link: '/components/hooks-utils' },
            { text: 'Network Request 网络请求', link: '/components/request' },
            { text: 'Preload 预加载系统 (实验性)', link: '/components/preload' },
            { text: 'PreloadDebugger 调试面板 (实验性)', link: '/components/preload-debugger' },
          ],
        },
      ],
    },

    outline: {
      level: [2, 3],
      label: '本页内容',
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '没有找到相关结果',
            resetButtonTitle: '清除',
            footer: { selectText: '选择', navigateText: '导航', closeText: '关闭' },
          },
        },
      },
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/Orpheus-K/lucky-ui' }],

    footer: {
      message: '基于 MIT 协议开源',
      copyright: 'Copyright © 2024-present Lucky UI',
    },

    docFooter: { prev: '上一页', next: '下一页' },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
  },
});
