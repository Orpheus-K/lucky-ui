// 在 App 启动时调用此方法（mp-weixin 真机关键）
export type InitFontOptions =
  | { source: 'cdn'; url: string } // https 地址，需在 downloadFile 合法域名
  | { source: 'base64'; data: string; format?: 'woff' | 'truetype' }; // 仅 base64 内容，不包含 data: 前缀

let loaded = false;

type FontFaceOptions = {
  family: string;
  source: string;
  global?: boolean;
  success: () => void;
  fail: (error: unknown) => void;
};

type UniFontFaceApi = typeof uni & {
  loadFontFace(options: FontFaceOptions): void;
};

function hasReadyPage(): boolean {
  try {
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
    return Array.isArray(pages) && pages.length > 0;
  } catch {
    return false;
  }
}

async function waitForPageReady(maxRetry = 20, interval = 50): Promise<void> {
  for (let i = 0; i < maxRetry; i += 1) {
    if (hasReadyPage()) return;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

export async function initLkIconsFont(opt: InitFontOptions) {
  if (loaded) return;
  const family = 'lk-icons';
  let source = '';

  if (opt.source === 'cdn') {
    source = `url("${opt.url}")`;
  } else {
    const format = opt.format ?? 'woff';
    const mime = format === 'woff' ? 'font/woff' : 'font/truetype';
    source = `url("data:${mime};charset=utf-8;base64,${opt.data}") format("${format}")`;
  }

  try {
    // #ifndef H5
    // 小程序/App 启动早期无 page 实例时，global 加载可能触发 $page undefined。
    // 延迟到页面可用后再加载字体。
    await new Promise(resolve => setTimeout(resolve, 200));
    await waitForPageReady();
    // #endif

    await new Promise<void>((resolve, reject) => {
      (uni as UniFontFaceApi).loadFontFace({
        family,
        source,
        // 全局生效，避免局部页面未加载到字体
        global: true,
        success: () => resolve(),
        fail: reject,
      });
    });
    loaded = true;
  } catch (e) {
    try {
      // #ifndef H5
      // 部分宿主对 global 参数支持不稳定，降级为局部注入。
      await new Promise<void>((resolve, reject) => {
        (uni as UniFontFaceApi).loadFontFace({
          family,
          source,
          success: () => resolve(),
          fail: reject,
        });
      });
      loaded = true;
      return;
      // #endif
    } catch {
      // ignore fallback error
    }
    console.warn('[lk-icons] font load failed', e);
  }
}
