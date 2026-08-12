import { createRenderer, defineComponent, nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePreload } from '../../src/uni_modules/lucky-ui/core/src/preload/usePreload';
import {
  getPreloadManager,
  resetPreloadManager,
} from '../../src/uni_modules/lucky-ui/core/src/preload/manager';
import { resetPreloadQueue } from '../../src/uni_modules/lucky-ui/core/src/preload/queue';
import {
  PreloadPriority,
  PreloadResourceType,
} from '../../src/uni_modules/lucky-ui/core/src/preload/types';

type TestNode = Record<string, unknown>;

const testRenderer = createRenderer<TestNode, TestNode>({
  patchProp() {},
  insert() {},
  remove() {},
  createElement() {
    return {};
  },
  createText() {
    return {};
  },
  createComment() {
    return {};
  },
  setText() {},
  setElementText() {},
  parentNode() {
    return null;
  },
  nextSibling() {
    return null;
  },
});

afterEach(() => {
  resetPreloadManager();
  resetPreloadQueue();
});

describe('preload queue consumers', () => {
  it('keeps usePreload stats current through one paired queue:change subscription', async () => {
    const manager = getPreloadManager();
    manager.pause();
    const onSpy = vi.spyOn(manager, 'on');
    const offSpy = vi.spyOn(manager, 'off');
    let exposed!: ReturnType<typeof usePreload>;

    const App = defineComponent({
      setup() {
        exposed = usePreload();
        return () => null;
      },
    });
    const app = testRenderer.createApp(App);
    app.mount({});

    manager.addTask({
      type: PreloadResourceType.CUSTOM,
      priority: PreloadPriority.MEDIUM,
      resource: 'paused-resource',
      maxRetries: 0,
      executor: () => Promise.resolve(),
    });
    await nextTick();

    expect(exposed.stats.value).toMatchObject({ pending: 1, running: 0 });
    expect(exposed.isLoading.value).toBe(true);
    expect(onSpy.mock.calls.filter(([event]) => event === 'queue:change')).toHaveLength(1);

    app.unmount();
    expect(offSpy.mock.calls.filter(([event]) => event === 'queue:change')).toHaveLength(1);
  });

  it('pairs the preload debugger queue:change subscription statically', async () => {
    const source = await import('node:fs/promises').then(fs =>
      fs.readFile(
        new URL(
          '../../src/uni_modules/lucky-ui/components/lk-preload-debugger/lk-preload-debugger.vue',
          import.meta.url
        ),
        'utf8'
      )
    );

    expect(source.match(/manager\.on\('queue:change', updateStats\)/g)).toHaveLength(1);
    expect(source.match(/manager\.off\('queue:change', updateStats\)/g)).toHaveLength(1);
  });
});
