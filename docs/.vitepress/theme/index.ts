import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import PhonePreview from './components/PhonePreview.vue'
import HomePage from './components/HomePage.vue'
import PropsPlayground from './components/PropsPlayground.vue'
import './style.css'

const VERCOUNT_SCRIPT_ID = 'lk-vercount-script'
const VERCOUNT_SCRIPT_SRC = 'https://events.vercount.one/js'

function loadVercount() {
  if (typeof document === 'undefined') return

  document.getElementById(VERCOUNT_SCRIPT_ID)?.remove()

  const script = document.createElement('script')
  script.id = VERCOUNT_SCRIPT_ID
  script.defer = true
  script.src = VERCOUNT_SCRIPT_SRC
  document.body.appendChild(script)
}

function refreshVercount() {
  if (typeof window === 'undefined') return

  window.requestAnimationFrame(() => {
    window.setTimeout(loadVercount, 0)
  })
}

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    app.component('PhonePreview', PhonePreview)
    app.component('HomePage', HomePage)
    app.component('PropsPlayground', PropsPlayground)

    refreshVercount()

    const originalAfterRouteChange = router.onAfterRouteChange
    router.onAfterRouteChange = (to) => {
      originalAfterRouteChange?.(to)
      refreshVercount()
    }
  },
} satisfies Theme
