import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRenderer, defineComponent } from 'vue';
import { useChartCanvas, type ChartRenderer } from '../../src/uni_modules/lucky-ui/composables/useChartCanvas';

type TestNode = Record<string, unknown>;
type TestElement = TestNode;

type LegacyGradient = {
  addColorStop: ReturnType<typeof vi.fn>;
};

type LegacyContext = {
  arcTo?: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  createCircularGradient?: ReturnType<typeof vi.fn<() => LegacyGradient>>;
  createLinearGradient?: ReturnType<typeof vi.fn<() => LegacyGradient>>;
  draw: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  setFillStyle: ReturnType<typeof vi.fn>;
  setFontSize: ReturnType<typeof vi.fn>;
};

const testRenderer = createRenderer<TestNode, TestElement>({
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

function createGradient(): LegacyGradient {
  return {
    addColorStop: vi.fn(),
  };
}

function createLegacyContext(overrides: Partial<LegacyContext> = {}): LegacyContext {
  return {
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    draw: vi.fn(),
    fill: vi.fn(),
    lineTo: vi.fn(),
    setFillStyle: vi.fn(),
    setFontSize: vi.fn(),
    ...overrides,
  };
}

function stubUniCanvas(context: LegacyContext) {
  const query = {
    in: vi.fn(() => query),
    select: vi.fn(() => query),
    boundingClientRect: vi.fn((callback: (rect: unknown) => void) => {
      callback({ left: 8, top: 12, width: 320, height: 180 });
      return query;
    }),
    fields: vi.fn((_options: unknown, callback: (res: unknown) => void) => {
      callback({ width: 320, height: 180 });
      return query;
    }),
    exec: vi.fn(),
  };

  const uniMock = {
    upx2px: vi.fn((value: number) => value),
    getSystemInfoSync: vi.fn(() => ({ pixelRatio: 2, uniPlatform: 'app' })),
    createCanvasContext: vi.fn(() => context),
    createSelectorQuery: vi.fn(() => query),
  };

  vi.stubGlobal('uni', uniMock);
  return uniMock;
}

async function mountChart(renderer: ChartRenderer) {
  const App = defineComponent({
    setup() {
      const chart = useChartCanvas({
        wrapperId: 'chart-wrapper',
        canvasId: 'chart-canvas',
        autoSize: true,
      });
      chart.setRenderer(renderer);
      return () => null;
    },
  });

  const app = testRenderer.createApp(App);
  app.mount({});

  await new Promise(resolve => setTimeout(resolve, 30));
  app.unmount();
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useChartCanvas app legacy canvas fallback', () => {
  it('renders through uni.createCanvasContext when node canvas is unavailable', async () => {
    const context = createLegacyContext({
      createLinearGradient: vi.fn(() => createGradient()),
    });
    const uniMock = stubUniCanvas(context);

    await mountChart(info => {
      info.ctx.font = '12px sans-serif';
      info.ctx.fillStyle = '#3366ff';
      info.ctx.fillRect?.(0, 0, 10, 10);
    });

    expect(uniMock.createCanvasContext).toHaveBeenCalledWith('chart-canvas', expect.any(Object));
    expect(context.setFontSize).toHaveBeenCalledWith(12);
    expect(context.setFillStyle).toHaveBeenCalledWith('#3366ff');
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 320, 180);
    expect(context.draw).toHaveBeenCalled();
  });

  it('maps radial gradients to circular gradients for radar charts on app canvas', async () => {
    const circularGradient = createGradient();
    const context = createLegacyContext({
      createCircularGradient: vi.fn(() => circularGradient),
    });
    stubUniCanvas(context);

    await mountChart(info => {
      const gradient = info.ctx.createRadialGradient(80, 80, 1, 80, 80, 60);
      gradient.addColorStop(0, 'rgba(51, 102, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(51, 102, 255, 0.12)');
      info.ctx.fillStyle = gradient;
      info.ctx.beginPath();
      info.ctx.fill();
    });

    expect(context.createCircularGradient).toHaveBeenCalledWith(80, 80, 60);
    expect(circularGradient.addColorStop).toHaveBeenCalledWith(0, 'rgba(51, 102, 255, 0.3)');
    expect(circularGradient.addColorStop).toHaveBeenCalledWith(1, 'rgba(51, 102, 255, 0.12)');
    expect(context.setFillStyle).toHaveBeenCalledWith(circularGradient);
    expect(context.draw).toHaveBeenCalled();
  });

  it('falls back to a solid color when gradient APIs are missing', async () => {
    const context = createLegacyContext();
    stubUniCanvas(context);

    await mountChart(info => {
      const gradient = info.ctx.createRadialGradient(80, 80, 1, 80, 80, 60);
      gradient.addColorStop(0, 'rgba(51, 102, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(51, 102, 255, 0.12)');
      info.ctx.fillStyle = gradient;
    });

    expect(context.setFillStyle).toHaveBeenCalledWith('rgba(51, 102, 255, 0.3)');
    expect(context.draw).toHaveBeenCalled();
  });

  it('degrades arcTo to lineTo for bar charts on limited app canvas contexts', async () => {
    const context = createLegacyContext();
    stubUniCanvas(context);

    await mountChart(info => {
      info.ctx.beginPath();
      info.ctx.moveTo?.(0, 20);
      info.ctx.arcTo(0, 0, 20, 0, 8);
    });

    expect(context.lineTo).toHaveBeenCalledWith(20, 0);
    expect(context.draw).toHaveBeenCalled();
  });
});
