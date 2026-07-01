const DEFAULT_DEV_PREVIEW_URL = 'http://localhost:5188'
const DEFAULT_PROD_PREVIEW_URL = 'https://preview.lucky-ui.cn'

function normalizePreviewUrl(url: string) {
  return url.replace(/\/+$/, '')
}

export const H5_PREVIEW_BASE_URL = normalizePreviewUrl(
  import.meta.env.VITE_LUCKY_UI_H5_PREVIEW_URL ||
    (import.meta.env.DEV ? DEFAULT_DEV_PREVIEW_URL : DEFAULT_PROD_PREVIEW_URL)
)
