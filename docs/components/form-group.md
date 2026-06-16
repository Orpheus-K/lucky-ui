---
title: FormGroup 表单分组
phone: form-group
---

# FormGroup 表单分组

用于把一组表单项、设置项或字段信息归并到同一个视觉区块中，提供统一标题、内容容器和卡片布局。

## 何时使用

- 表单字段需要按账户信息、权限设置、通知设置等语义分区时。
- 设置页需要把多个行项目收拢成一个圆角卡片时。
- 需要自定义分组标题，但不希望重复维护外层间距和内容背景时。

## 基础用法

通过 `title` 设置分组标题，默认插槽承载任意字段或行项目。

```vue
<template>
  <lk-form-group title="账户信息">
    <lk-form-item label="用户名" prop="username">
      <lk-input v-model="form.username" placeholder="请输入用户名" />
    </lk-form-item>

    <lk-form-item label="手机号" prop="phone">
      <lk-input v-model="form.phone" type="tel" placeholder="请输入手机号" />
    </lk-form-item>
  </lk-form-group>
</template>
```

## 卡片模式

开启 `card` 后，分组会带外边距、圆角和内容裁剪，适合设置页或移动端块状表单。

```vue
<template>
  <lk-form-group title="通知设置" card>
    <lk-form-item label="系统通知">
      <lk-switch v-model="enabled" />
    </lk-form-item>
  </lk-form-group>
</template>
```

## 标题插槽

使用 `#title` 可以完全替换标题区域，适合追加标签、状态或操作入口。

```vue
<template>
  <lk-form-group>
    <template #title>
      <view class="group-title">
        <text>高级选项</text>
        <lk-tag size="sm" type="outline" color="var(--lk-color-primary)">可选</lk-tag>
      </view>
    </template>

    <lk-form-item label="安全等级">
      <lk-rate v-model="level" />
    </lk-form-item>
  </lk-form-group>
</template>
```

## 直接 Demo

项目内置可运行示例位于 `src/components/demos/form-group-demo.vue`，文档预览与 showcase 都使用同一个直连 Demo。

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| title | 分组标题 | `string` | — | `''` |
| card | 是否启用圆角卡片布局 | `boolean` | — | `false` |
| id | 组件唯一标识 | `string` | — | `''` |
| customClass | 自定义类名 | `string / object / array` | — | — |
| customStyle | 自定义样式 | `string / object` | — | — |

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|------------|
| default | 分组内容 | — |
| title | 自定义标题区域 | — |

## 注意事项

`lk-form-group` 只负责结构分组和视觉布局，不提供字段注册、校验或错误提示能力。需要表单上下文时，请和 `lk-form`、`lk-form-item` 组合使用。
