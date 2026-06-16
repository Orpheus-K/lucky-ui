const UNSUPPORTED_TAGS_IN_MINI_PROGRAM = new Set(['div', 'span', 'img', 'p', 'ul', 'li']);

export default {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止在 Vue 模板中使用小程序不支持的原生标签',
    },
    schema: [],
    messages: {
      unsupportedTag:
        '⚠️ 标签 <{{ tag }}> 在小程序中不支持，请使用 <view>/<text>/<image> 等跨平台标签。',
      unsupportedDynamicComponent: '⚠️ 小程序不支持 <component :is="..."> 动态组件，请改为条件渲染。',
    },
  },
  create(context) {
    if (!context.parserServices?.defineTemplateBodyVisitor) {
      return {};
    }

    return context.parserServices.defineTemplateBodyVisitor({
      VElement(node) {
        const rawName = node?.rawName?.toLowerCase?.();
        if (!rawName) {
          return;
        }

        if (rawName === 'component') {
          context.report({
            node,
            messageId: 'unsupportedDynamicComponent',
          });
          return;
        }

        if (!UNSUPPORTED_TAGS_IN_MINI_PROGRAM.has(rawName)) {
          return;
        }

        context.report({
          node,
          messageId: 'unsupportedTag',
          data: {
            tag: rawName,
          },
        });
      },
    });
  },
};
