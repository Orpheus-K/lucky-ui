---
title: Timeline 时间轴
phone: timeline
---

# Timeline 时间轴

按时间顺序线性展示内容，设计语言参考 Apple Human Interface Guidelines —— 极简、克制、字体层级清晰。

## 基础用法

```vue
<lk-timeline>
  <lk-timeline-item
    date="Today"
    time="09:00"
    title="Design Review"
    subtitle="Studio A · 3F"
    desc="讨论近期产品视觉方向与组件一致性。"
    color="#007aff"
  />
  <lk-timeline-item
    date="Today"
    time="11:30"
    title="iOS Motion Spec"
    subtitle="Remote"
    desc="对齐动效节奏与过渡细节，输出交互规范。"
    color="#34c759"
  />
</lk-timeline>
```

## 节点状态

通过 `status` 控制节点外观与颜色：

| status      | 说明     | 颜色         |
| ----------- | -------- | ------------ |
| `default`   | 默认     | primary      |
| `active`    | 进行中   | primary 高亮 |
| `completed` | 已完成   | success 绿   |
| `pending`   | 待处理   | 灰色降调     |
| `error`     | 错误     | danger 红    |

```vue
<lk-timeline>
  <lk-timeline-item :index="0" status="completed" title="需求确认" time="Day 1" />
  <lk-timeline-item :index="1" status="active"    title="开发进行中" time="Day 3" />
  <lk-timeline-item :index="2" status="pending"   title="测试验收" time="Day 5" />
  <lk-timeline-item :index="3" status="error"     title="上线发布" time="Day 6" />
</lk-timeline>
```

## 节点变体

`dot-variant` 控制节点圆的渲染方式：

```vue
<!-- 空心描边 -->
<lk-timeline dot-variant="outlined">...</lk-timeline>

<!-- 数字序号（需配合 :index） -->
<lk-timeline dot-variant="numbered">
  <lk-timeline-item :index="0" title="Step 1" />
  <lk-timeline-item :index="1" title="Step 2" />
</lk-timeline>
```

## 激活节点（activeIndex）

父组件通过 `active-index` 高亮指定索引的子项（需子项传 `:index`）：

```vue
<lk-timeline :active-index="1">
  <lk-timeline-item :index="0" title="已完成" status="completed" />
  <lk-timeline-item :index="1" title="进行中" />
  <lk-timeline-item :index="2" title="待开始" status="pending" />
</lk-timeline>
```

## 水平时间轴

```vue
<lk-timeline direction="horizontal">
  <lk-timeline-item date="Mon"  title="Kickoff" color="#007aff" />
  <lk-timeline-item date="Wed"  title="Design"  status="active" color="#5856d6" />
  <lk-timeline-item date="Fri"  title="Dev"     status="pending" />
</lk-timeline>
```

## 自定义插槽

| 插槽名     | 说明                             |
| ---------- | -------------------------------- |
| `default`  | 替换正文描述区域                 |
| `title`    | 自定义标题                       |
| `subtitle` | 自定义副标题                     |
| `time`     | 自定义时间/日期区域              |
| `extra`    | 卡片尾部追加内容（如徽章、按钮） |

---

## Timeline Props

| 参数          | 说明                    | 类型      | 默认值     |
| ------------- | ----------------------- | --------- | ---------- |
| `customClass` | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| `customStyle` | 组件可视根节点自定义样式 | `string \| object` | `''` |
| `direction`   | 方向                    | `'vertical' \| 'horizontal'` | `'vertical'` |
| `show-line`   | 是否显示连接线          | `boolean` | `true`     |
| `active-index`| 高亮节点索引（0-based） | `number`  | `-1`       |
| `dot-variant` | 默认节点样式            | `'filled' \| 'outlined' \| 'numbered'` | `'filled'` |

## TimelineItem Props

| 参数          | 说明                              | 类型      | 默认值      |
| ------------- | --------------------------------- | --------- | ----------- |
| `customClass` | 组件可视根节点自定义类名           | `string \| object \| array` | `''` |
| `customStyle` | 组件可视根节点自定义样式           | `string \| object` | `''` |
| `index`       | 节点序号（numbered 和 activeIndex 使用） | `number`  | `-1`  |
| `status`      | 节点状态                          | `'default' \| 'active' \| 'completed' \| 'pending' \| 'error'` | `'default'` |
| `title`       | 主标题                            | `string`  | `''`        |
| `subtitle`    | 副标题 / 位置                     | `string`  | `''`        |
| `desc`        | 正文描述                          | `string`  | `''`        |
| `time`        | 时间文本（如 "09:00"）            | `string`  | `''`        |
| `date`        | 日期标签（如 "Today"）            | `string`  | `''`        |
| `color`       | 节点颜色（覆盖 accent）           | `string`  | `''`        |
| `icon`        | lk-icon 图标名                   | `string`  | `''`        |
| `dot-variant` | 覆盖父级节点样式                  | `string`  | `''`        |
| `last`        | 强制隐藏连接线                    | `boolean` | `false`     |

## TimelineItem Events

| 事件名  | 说明     | 回调参数  |
| ------- | -------- | --------- |
| `click` | 点击条目 | `(ev: Event)` |

## 发布验收

`lk-timeline` 已纳入 dynamic-visual showcase 回归，发布前按下面边界验收：

| 场景 | 验收方式 | 要点 |
|------|----------|------|
| 展示台基线 | 自动回归 | `tests/visual/dynamic-visual-showcase.spec.ts` 校验组件路由、verified 状态与中风险标记 |
| 方向与连接线 | 自动/人工 | 垂直、水平、隐藏连接线、编号节点在截图中布局稳定 |
| 平台差异 | 人工验收 | 水平滚动、图标节点和自定义插槽在 H5/App/小程序端无错位 |
