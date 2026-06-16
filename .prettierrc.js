module.exports = {
  // 基础配置
  printWidth: 100, // 每行最大字符数
  tabWidth: 2, // 缩进空格数
  useTabs: false, // 使用空格缩进
  semi: true, // 语句末尾加分号
  singleQuote: true, // 使用单引号
  quoteProps: 'as-needed', // 对象属性引号按需使用
  
  // JSX 配置
  jsxSingleQuote: false, // JSX 使用双引号
  
  // 尾部逗号
  trailingComma: 'es5', // 多行时尽可能使用尾部逗号（ES5 兼容）
  
  // 对象、数组空格
  bracketSpacing: true, // 对象字面量的大括号中添加空格 { foo: bar }
  
  // 箭头函数参数括号
  arrowParens: 'avoid', // 单参数箭头函数省略括号
  
  // JSX 标签的 > 换行
  bracketSameLine: false, // 将多行 JSX 元素的 > 放在新行
  
  // HTML 空白敏感性
  htmlWhitespaceSensitivity: 'css', // 根据 CSS display 属性决定
  
  // Vue 文件脚本和样式标签缩进
  vueIndentScriptAndStyle: false, // Vue 文件中的 script 和 style 标签内容不缩进
  
  // 换行符
  endOfLine: 'auto', // 保持现有的换行符（混合值时让编辑器自行处理）
  
  // 行尾空格
  // embeddedLanguageFormatting: 'auto', // 自动格式化嵌入的代码（默认值）
  
  // 文件覆盖配置
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'preserve', // Markdown 文本不换行
      },
    },
  ],
};
