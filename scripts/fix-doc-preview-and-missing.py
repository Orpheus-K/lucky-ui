import os
import re

ROOT = r'f:\\luckyone\\ui'
DOCS_COMPONENTS = os.path.join(ROOT, 'docs', 'components')
DETAIL_PAGE = os.path.join(ROOT, 'src', 'pages', 'component-detail', 'index.vue')

with open(DETAIL_PAGE, encoding='utf-8') as f:
    detail = f.read()

valid_preview = set(re.findall(r"componentName === '([^']+)'", detail))

missing_docs = {
    'grid': 'Grid 栅格',
    'space': 'Space 间距',
    'keyboard': 'Keyboard 虚拟键盘',
    'number-roller': 'NumberRoller 数字翻牌',
    'curtain': 'Curtain 幕帘',
    'horizontal-scroll': 'HorizontalScroll 横向滚动',
}

template = """---
title: {title}
phone: {slug}
---

# {title}

用于 {title} 的基础演示与配置说明。

## 基础用法

```vue
<template>
  <view class=\"demo-wrap\">{title} 示例</view>
</template>
```

## API

> 详细 API 请参考组件源码 `src/uni_modules/lucky-ui/components/` 目录。
"""

for slug, title in missing_docs.items():
    path = os.path.join(DOCS_COMPONENTS, f'{slug}.md')
    if not os.path.exists(path):
        with open(path, 'w', encoding='utf-8') as f:
            f.write(template.format(title=title, slug=slug))
        print('CREATED', os.path.relpath(path, ROOT))

# 给缺失 phone 的文档补 frontmatter（仅限可预览组件）
for current_root, _, files in os.walk(DOCS_COMPONENTS):
    for name in files:
        if not name.endswith('.md'):
            continue
        if name == 'index.md':
            continue

        slug = name[:-3]
        if slug not in valid_preview:
            continue

        path = os.path.join(current_root, name)
        content = open(path, encoding='utf-8', errors='replace').read()

        if not content.startswith('---'):
            continue

        parts = content.split('---', 2)
        if len(parts) < 3:
            continue

        fm = parts[1]
        body = parts[2]

        if 'phone:' in fm:
            continue

        lines = [line for line in fm.splitlines() if line.strip() != '']
        inserted = False
        out = []
        for line in lines:
            out.append(line)
            if line.strip().startswith('title:') and not inserted:
                out.append(f'phone: {slug}')
                inserted = True
        if not inserted:
            out.append(f'phone: {slug}')

        new_fm = '\n'.join(out)
        new_content = f"---\n{new_fm}\n---{body}"

        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('UPDATED_PHONE', os.path.relpath(path, ROOT))

print('DONE')
