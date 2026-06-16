module.exports = {
  extends: [
    'stylelint-config-standard', // 标准规则
    'stylelint-config-standard-vue', // Vue 文件支持
    'stylelint-config-recommended-scss', // SCSS 推荐规则
    'stylelint-config-prettier-scss', // 禁用与 Prettier 冲突的规则
  ],

  // 自定义语法
  customSyntax: 'postcss-html',

  // 忽略的文件
  ignoreFiles: [
    '**/*.js',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.ts',
    '**/*.json',
    '**/*.md',
    '**/*.yaml',
    'dist/**',
    'node_modules/**',
    'unpackage/**',
    '*.min.css',
  ],

  // 规则配置
  rules: {
    // ========== 放宽以下规则以适配 uni-app 项目 ==========

    // 颜色相关 - 放宽限制
    'color-hex-length': null, // 允许长短形式的十六进制颜色
    'color-named': null, // 允许命名颜色
    'color-function-notation': null, // 允许传统颜色函数写法
    'alpha-value-notation': null, // 允许 0-1 和百分比形式的 alpha 值
    'color-function-alias-notation': null, // 允许 rgba/hsla 别名

    // 字体相关
    'font-family-name-quotes': null, // 字体名称引号可选
    'font-family-no-missing-generic-family-keyword': null, // 允许缺少通用字体族

    // 函数相关
    'function-url-quotes': 'always', // URL 必须加引号
    'function-no-unknown': null, // 关闭未知函数检查（支持 SCSS 函数）

    // 数值相关
    'number-max-precision': 4, // 最大小数位数

    // 单位相关
    'unit-no-unknown': [
      true,
      {
        ignoreUnits: ['rpx'], // 允许 uni-app 的 rpx 单位
      },
    ],

    // 选择器相关
    'selector-class-pattern': null, // 关闭类名命名规则检查
    'selector-id-pattern': null, // 关闭 ID 命名规则检查
    'selector-max-universal': 0, // 小程序不支持通配符选择器
    'selector-max-type': [
      0,
      {
        severity: 'warning',
      },
    ], // 标签选择器在小程序 scoped 下存在兼容风险
    'selector-not-notation': null, // 允许简单和复杂的 :not() 选择器
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global', 'export'], // 忽略 Vue 的伪类
      },
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep', 'v-global', 'v-slotted'], // 忽略 Vue 的伪元素
      },
    ],

    // 属性相关
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['rpx'], // 忽略 uni-app 的 rpx 单位
      },
    ],
    'property-no-vendor-prefix': null, // 允许浏览器前缀属性
    'custom-property-pattern': null, // 关闭自定义属性命名规则（允许 --_var 等）

    // 声明相关
    'declaration-block-single-line-max-declarations': null, // 单行声明块中的声明数量不限
    'declaration-block-no-redundant-longhand-properties': null, // 允许使用冗长的属性
    'declaration-empty-line-before': null, // 声明前不强制空行

    // 规则相关
    'rule-empty-line-before': null, // 规则前不强制空行
    'no-descending-specificity': null, // 关闭选择器优先级检查
    'no-duplicate-selectors': null, // 允许重复选择器

    // 值相关
    // 值相关
    'value-keyword-case': null, // 关闭关键字大小写检查
    'shorthand-property-no-redundant-values': null, // 允许冗余的简写属性值

    // 注释相关
    'comment-empty-line-before': null, // 注释前不强制空行
    'comment-whitespace-inside': null, // 注释内部空格不限制

    // at 规则相关
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          // SCSS at-rules
          'mixin',
          'include',
          'extend',
          'function',
          'return',
          'if',
          'else',
          'for',
          'each',
          'while',
          'use',
          'forward',
          'at-root',
          'error',
          'warn',
          'debug',
          // uni-app at-rules
          'import',
        ],
      },
    ],

    // SCSS 相关
    'scss/at-rule-no-unknown': true, // 检查未知的 SCSS at-rule
    'scss/dollar-variable-pattern': null, // 关闭变量命名规则
    'scss/percent-placeholder-pattern': null, // 关闭占位符命名规则
    'scss/at-mixin-pattern': null, // 关闭 mixin 命名规则
    'scss/at-function-pattern': null, // 关闭函数命名规则
    'scss/operator-no-newline-after': null, // 允许操作符后换行
    'scss/load-partial-extension': null, // 允许 @use 显式携带 .scss 扩展名

    // 其他
    'no-descending-specificity': null, // 关闭选择器优先级检查
    'no-empty-source': null, // 允许空的样式文件
    'custom-property-empty-line-before': null, // 自定义属性前不强制空行
  },
};
