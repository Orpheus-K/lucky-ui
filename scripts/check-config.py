import json, os, re

root = r'f:\luckyone\ui'
tsconfig_path = os.path.join(root, 'tsconfig.json')

if os.path.exists(tsconfig_path):
    c = open(tsconfig_path, encoding='utf-8').read()
    m = re.search(r'"module"\s*:\s*"([^"]+)"', c)
    print('tsconfig module:', m.group(1) if m else 'NOT FOUND')
    m2 = re.search(r'"moduleResolution"\s*:\s*"([^"]+)"', c)
    print('tsconfig moduleResolution:', m2.group(1) if m2 else 'NOT FOUND')

docs_tsconfig = os.path.join(root, 'docs', 'tsconfig.json')
print('docs/tsconfig.json:', os.path.exists(docs_tsconfig))

pkg_path = os.path.join(root, 'package.json')
pkg = json.load(open(pkg_path, encoding='utf-8'))
print('package.json type:', pkg.get('type', 'NOT SET'))
