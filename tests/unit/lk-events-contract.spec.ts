import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';

const rootDir = process.cwd();
const componentsDir = join(rootDir, 'src/uni_modules/lucky-ui/components');
const docsDir = join(rootDir, 'docs/components');

const docAliases: Record<string, string> = {
  'chart-radar-lite': 'chart-lite',
  'chart-ring': 'chart-lite',
  'chart-sparkline': 'chart-lite',
  'chart-stat-card': 'chart-lite',
};

const missingDocAllowed = new Set([
  'preload-debugger',
]);

function readProjectFile(path: string): string {
  return readFileSync(path, 'utf8');
}

function walkFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) return walkFiles(path);
    return /\.(ts|vue)$/.test(name) ? [path] : [];
  });
}

function getComponentNames(): string[] {
  return readdirSync(componentsDir)
    .filter(name => name.startsWith('lk-') && statSync(join(componentsDir, name)).isDirectory())
    .map(name => name.replace(/^lk-/, ''))
    .sort();
}

function getPropertyName(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return null;
}

function collectDeclaredEmitsFromTs(filePath: string): string[] {
  const source = ts.createSourceFile(
    filePath,
    readProjectFile(filePath),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const names = new Set<string>();

  source.statements.forEach(statement => {
    if (!ts.isVariableStatement(statement)) return;
    const exported = statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) return;

    statement.declarationList.declarations.forEach(declaration => {
      const declarationName = ts.isIdentifier(declaration.name) ? declaration.name.text : '';
      if (!/Emits$/.test(declarationName) || !declaration.initializer) return;

      if (ts.isObjectLiteralExpression(declaration.initializer)) {
        declaration.initializer.properties.forEach(property => {
          if (
            ts.isPropertyAssignment(property) ||
            ts.isMethodDeclaration(property) ||
            ts.isShorthandPropertyAssignment(property)
          ) {
            const propertyName = getPropertyName(property.name);
            if (propertyName) names.add(propertyName);
          }
        });
      }

      if (ts.isArrayLiteralExpression(declaration.initializer)) {
        declaration.initializer.elements.forEach(element => {
          if (ts.isStringLiteral(element)) names.add(element.text);
        });
      }
    });
  });

  return [...names].sort();
}

function collectInlineDeclaredEmits(source: string): string[] {
  const names = new Set<string>();

  [...source.matchAll(/defineEmits\(\s*\[([\s\S]*?)\]\s*\)/g)]
    .forEach(match => {
      [...match[1].matchAll(/['"`]([^'"`]+)['"`]/g)]
        .forEach(eventMatch => names.add(eventMatch[1]));
    });

  [...source.matchAll(/defineEmits\(\s*\{([\s\S]*?)\}\s*\)/g)]
    .forEach(match => {
      [...match[1].matchAll(/(?:^|[,\n])\s*(?:['"`]([^'"`]+)['"`]|([A-Za-z_$][\w$-]*))\s*:/g)]
        .forEach(eventMatch => names.add(eventMatch[1] || eventMatch[2]));
    });

  [...source.matchAll(/defineEmits\s*<([\s\S]*?)>\s*\(\s*\)/g)]
    .forEach(match => {
      [...match[1].matchAll(/e\s*:\s*['"`]([^'"`]+)['"`]/g)]
        .forEach(eventMatch => names.add(eventMatch[1]));
    });

  return [...names].sort();
}

function collectStaticEmitCalls(source: string): string[] {
  return [...source.matchAll(/emit\(\s*['"`]([^'"`]+)['"`]/g)]
    .map(match => match[1])
    .sort();
}

function collectComponentDeclaredEmits(componentName: string): string[] {
  const componentDir = join(componentsDir, `lk-${componentName}`);
  const names = new Set<string>();

  walkFiles(componentDir)
    .filter(path => !path.includes('\\fonts\\') && !path.includes('/fonts/'))
    .forEach(path => {
      const source = readProjectFile(path);
      if (path.endsWith('.ts')) {
        collectDeclaredEmitsFromTs(path).forEach(name => names.add(name));
      }
      if (path.endsWith('.vue')) {
        collectInlineDeclaredEmits(source).forEach(name => names.add(name));
      }
    });

  return [...names].sort();
}

function collectComponentStaticEmitCalls(componentName: string): string[] {
  const componentDir = join(componentsDir, `lk-${componentName}`);
  const names = new Set<string>();

  walkFiles(componentDir)
    .filter(path => !path.includes('\\fonts\\') && !path.includes('/fonts/'))
    .forEach(path => {
      collectStaticEmitCalls(readProjectFile(path)).forEach(name => names.add(name));
    });

  return [...names].sort();
}

function resolveDocPath(componentName: string): string | null {
  const docName = docAliases[componentName] || componentName;
  const docPath = join(docsDir, `${docName}.md`);
  return existsSync(docPath) ? docPath : null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasDocumentedEvent(doc: string, eventName: string): boolean {
  const eventPattern = new RegExp(`\\|\\s*\`?${escapeRegExp(eventName)}\`?\\s*\\|`);
  return eventPattern.test(doc);
}

describe('lucky-ui event contract', () => {
  it('declares every statically emitted component event', () => {
    const missing = getComponentNames()
      .map(componentName => {
        const declared = collectComponentDeclaredEmits(componentName);
        const emitted = collectComponentStaticEmitCalls(componentName);
        return {
          componentName,
          missing: emitted.filter(eventName => !declared.includes(eventName)),
        };
      })
      .filter(result => result.missing.length > 0);

    expect(missing).toEqual([]);
  });

  it('documents declared public events', () => {
    const missing = getComponentNames()
      .flatMap(componentName => {
        const declared = collectComponentDeclaredEmits(componentName);
        const docPath = resolveDocPath(componentName);

        if (!docPath && missingDocAllowed.has(componentName)) return [];
        expect(docPath, `${componentName} should have public docs`).toBeTruthy();

        const doc = readProjectFile(docPath as string);
        if (declared.length === 0) {
          return doc.includes('当前版本未额外暴露自定义事件')
            ? []
            : [{ componentName, eventName: '(no custom events)' }];
        }

        return declared
          .filter(eventName => !hasDocumentedEvent(doc, eventName))
          .map(eventName => ({ componentName, eventName }));
      });

    expect(missing).toEqual([]);
  });
});
