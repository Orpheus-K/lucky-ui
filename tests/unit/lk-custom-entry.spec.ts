import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = process.cwd();
const componentsDir = join(rootDir, 'src/uni_modules/lucky-ui/components');
const indexFile = join(componentsDir, 'index.ts');

function readProjectFile(path: string): string {
  return readFileSync(path, 'utf8');
}

function resolveComponentPath(exportPath: string): string {
  return join(componentsDir, exportPath.replace(/^\.\//, '').replace(/\//g, '/'));
}

describe('lucky-ui public custom entry contract', () => {
  it('keeps every public component wired to customClass and customStyle', () => {
    const source = readProjectFile(indexFile);
    const componentExports = [...source.matchAll(/export \{ default as (\w+) \} from '\.\/([^']+\.vue)'/g)]
      .map(match => ({ name: match[1], path: resolveComponentPath(match[2]) }))
      .filter(item => item.name !== 'DemoBlock');

    expect(componentExports.length).toBeGreaterThan(0);

    const missing = componentExports
      .map(item => {
        const componentSource = readProjectFile(item.path);
        return {
          ...item,
          hasCustomClass: componentSource.includes('customClass'),
          hasCustomStyle: componentSource.includes('customStyle'),
        };
      })
      .filter(item => !item.hasCustomClass || !item.hasCustomStyle);

    expect(missing).toEqual([]);
  });

  it('keeps public props files based on baseProps', () => {
    const source = readProjectFile(indexFile);
    const propsExports = [...source.matchAll(/export \* from '\.\/([^']+\.props)'/g)]
      .map(match => resolveComponentPath(`${match[1]}.ts`));

    expect(propsExports.length).toBeGreaterThan(0);

    const missing = propsExports
      .filter(path => !readProjectFile(path).includes('...baseProps'));

    expect(missing).toEqual([]);
  });
});
