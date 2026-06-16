import { onBeforeUnmount, onMounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';

type PreviewRouteOptions = Record<string, string | undefined>;

function pickPreviewQueryValue(options: PreviewRouteOptions | undefined, keys: string[]) {
  if (!options) return undefined;
  for (const key of keys) {
    const value = options[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return undefined;
}

function readCurrentPageOptions() {
  const pages = getCurrentPages();
  const current = pages[pages.length - 1] as unknown as {
    options?: PreviewRouteOptions;
    $page?: {
      options?: PreviewRouteOptions;
    };
  };
  return current?.options || current?.$page?.options;
}

export function usePreviewQuery(keys: string[], applyValue: (value: string) => void) {
  const apply = (value: string | undefined | null) => {
    applyValue((value || '').trim().toLowerCase());
  };

  onLoad((options?: PreviewRouteOptions) => {
    apply(pickPreviewQueryValue(options, keys) || '');
  });

  onShow(() => {
    const value = pickPreviewQueryValue(readCurrentPageOptions(), keys);
    if (value !== undefined) {
      apply(value);
    }
  });

  // #ifdef H5
  const syncFromHash = () => {
    const hash = window.location.hash || '';
    const query = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
    const params = new URLSearchParams(query);
    for (const key of keys) {
      const value = params.get(key);
      if (value) {
        apply(value);
        return;
      }
    }
    apply('');
  };

  onMounted(() => {
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('hashchange', syncFromHash);
  });
  // #endif
}
