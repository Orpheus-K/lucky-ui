import os, re

root = r'f:\\luckyone\\ui'
config_path = os.path.join(root, 'docs', '.vitepress', 'config.ts')
config = open(config_path, encoding='utf-8').read()
links = re.findall(r"link:\s*'(/components/[^']+)'", config)

missing = []
for link in links:
    rel = link.strip('/')
    if link.endswith('/'):
        fp = os.path.join(root, 'docs', rel, 'index.md')
    else:
        fp = os.path.join(root, 'docs', rel + '.md')
    if not os.path.exists(fp):
        missing.append((link, fp))

components_dir = os.path.join(root, 'docs', 'components')
no_phone = []
for current_root, _, files in os.walk(components_dir):
    for name in files:
        if not name.endswith('.md') or name == 'index.md':
            continue
        fp = os.path.join(current_root, name)
        content = open(fp, encoding='utf-8', errors='replace').read(600)
        if not content.startswith('---'):
            no_phone.append(fp)
            continue
        parts = content.split('---', 2)
        if len(parts) < 3 or 'phone:' not in parts[1]:
            no_phone.append(fp)

print('MISSING_LINK_FILES', len(missing))
for link, fp in missing:
    print('-', link, '=>', os.path.relpath(fp, root))

print('NO_PHONE_FILES', len(no_phone))
for fp in sorted(no_phone):
    print('-', os.path.relpath(fp, root))
