---
title: SelectList 选择列表
phone: select-list
---

# SelectList 选择列表

面向“卡片式选择”的表单组件，支持单选、多选、最大可选数、禁用项、图标、描述文案与网格列数。

## 单选

```vue
<lk-select-list v-model="value" :options="options" />
```

## 多选

```vue
<lk-select-list v-model="values" multiple :options="options" />
```

## 最大可选数

```vue
<lk-select-list
  v-model="values"
  multiple
  :max="2"
  :options="options"
  @overlimit="onOverlimit"
/>
```

## 网格布局

```vue
<lk-select-list v-model="values" multiple :columns="2" :options="options" />
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值；单选为基础值，多选为数组 | `string / number / boolean / array` | `''` |
| options | 选项列表 | `SelectListOption[]` | `[]` |
| multiple | 是否多选 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| max | 最大可选数，0 表示不限制 | `number` | `0` |
| titleKey | 标题字段名 | `string` | `label` |
| valueKey | 值字段名 | `string` | `value` |
| descKey | 描述字段名 | `string` | `description` |
| disabledKey | 禁用字段名 | `string` | `disabled` |
| icon | 右侧选中图标 | `string` | `check-all` |
| showIcon | 是否显示右侧选中图标 | `boolean` | `true` |
| selectedBg | 选中时是否显示背景 | `boolean` | `true` |
| selectedBorder | 选中时是否显示边框 | `boolean` | `true` |
| bordered | 是否显示普通边框 | `boolean` | `true` |
| inset | 是否使用内嵌卡片间距 | `boolean` | `false` |
| columns | 列数，1 为列表，2/3/4 为网格 | `number` | `1` |
| itemRadius | 选项圆角 | `string / number` | `''` |
| size | 尺寸 | `sm / md / lg` | `md` |
| activeColor | 选中颜色 | `string` | `''` |

### Option

| 字段 | 说明 | 类型 |
|------|------|------|
| label | 展示标题 | `string` |
| value | 选项值 | `string / number / boolean` |
| description | 描述文案 | `string` |
| disabled | 是否禁用 | `boolean` |
| icon | 左侧图标名 | `string` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | `(value)` |
| change | 选中值变化 | `(value, option)` |
| select | 单项选中状态变化 | `(option, selected)` |
| overlimit | 超过最大可选数 | `(option, max)` |

## Demo

项目演示位于 `src/components/demos/select-list-demo.vue`。
