import os
import re

ROOT = r'f:\\luckyone\\ui'
DOCS = os.path.join(ROOT, 'docs', 'components')
PLACEHOLDER = '详细 API 请参考组件源码'


def to_pascal(slug: str) -> str:
    return ''.join(x.capitalize() for x in slug.split('-'))


def normalize_frontmatter(content: str, slug: str, title: str) -> str:
    if not content.startswith('---'):
        body = content.lstrip()
        return f"---\ntitle: {title}\nphone: {slug}\n---\n\n{body}"

    parts = content.split('---', 2)
    if len(parts) < 3:
        return content

    fm = parts[1]
    body = parts[2]
    lines = [line for line in fm.splitlines() if line.strip()]

    has_phone = any(line.strip().startswith('phone:') for line in lines)
    has_title = any(line.strip().startswith('title:') for line in lines)

    if not has_title:
        lines.insert(0, f'title: {title}')
    if not has_phone and slug not in ('hooks-utils',):
        insert_at = 1 if lines and lines[0].startswith('title:') else len(lines)
        lines.insert(insert_at, f'phone: {slug}')

    return f"---\n" + '\n'.join(lines) + f"\n---{body}"


def enrich_doc(path: str) -> bool:
    raw = open(path, encoding='utf-8', errors='replace').read()
    if PLACEHOLDER not in raw:
        return False

    slug = os.path.basename(path)[:-3]

    title = None
    m_title = re.search(r'^title:\s*(.+)$', raw, flags=re.M)
    if m_title:
        title = m_title.group(1).strip()
    if not title:
        m_h1 = re.search(r'^#\s+(.+)$', raw, flags=re.M)
        title = m_h1.group(1).strip() if m_h1 else to_pascal(slug)

    content = normalize_frontmatter(raw, slug, title)

    # 删除占位 API 段
    content = re.sub(
        r'\n## API\s*\n\s*>\s*详细 API 请参考组件源码[^\n]*\n?',
        '\n',
        content,
        flags=re.M,
    )

    # 已有 Props/Events/Slots 的文档，不再追加重复 API 章节
    has_detail_api = any(x in content for x in ['## Props', '### Props', '## Events', '### Events'])

    if not has_detail_api:
        pascal = to_pascal(slug)
        demo_import = f"{pascal}Demo"
        appendix = f"""
## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang=\"ts\">
import {demo_import} from '@/components/demos/{slug}-demo.vue'
</script>

<template>
  <{demo_import} />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class=\"page-demo\">
    <lk-{slug} />
  </view>
</template>
```

## API

### Props

- 组件参数较多，建议优先参考：`src/uni_modules/lucky-ui/components/lk-{slug}/`
- 交互行为与默认值以 `*.props.ts` 为准

### Events

- 事件名称与参数说明以组件源码和对应 demo 为准

### Slots

- 插槽能力以组件模板实现为准（建议结合 demo 对照使用）
"""
        content = content.rstrip() + '\n\n' + appendix.strip() + '\n'

    content = re.sub(r'\n{3,}', '\n\n', content)

    if content != raw:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True

    return False


changed = []
for r, _, fs in os.walk(DOCS):
    for fn in fs:
        if not fn.endswith('.md') or fn == 'index.md':
            continue
        fp = os.path.join(r, fn)
        if enrich_doc(fp):
            changed.append(os.path.relpath(fp, ROOT))

print('CHANGED', len(changed))
for c in sorted(changed):
    print('-', c)
