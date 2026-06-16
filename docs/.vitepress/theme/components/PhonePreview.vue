<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  src: string      // e.g. "button"  — component name, or full path like "/pages/component-detail/index?component=button"
  title?: string
}>()

// H5 开发服务器地址，可通过 env 变量自定义
const BASE_URL = 'http://localhost:5173'

const frameUrl = computed(() => {
  if (!props.src) return `${BASE_URL}/#/pages_sub/component-detail/index`
  // 若 src 不含斜杠，视为组件名，拼接 component-detail 路由
  if (!props.src.includes('/')) {
    return `${BASE_URL}/#/pages_sub/component-detail/index?component=${encodeURIComponent(props.src)}`
  }
  // 否则视为完整路径
  return `${BASE_URL}/#${props.src}`
})

const loaded = ref(false)
const error = ref(false)
const iframeRef = ref<HTMLIFrameElement | null>(null)

function onLoad() {
  loaded.value = true
  error.value = false
}

function onError() {
  error.value = true
}

function refresh() {
  if (iframeRef.value) {
    loaded.value = false
    error.value = false
    iframeRef.value.src = frameUrl.value
  }
}

function openInNew() {
  window.open(frameUrl.value, '_blank')
}

// 监听 src prop 变化，强制 iframe 导航到新 URL
watch(frameUrl, (newUrl) => {
  loaded.value = false
  error.value = false
  if (iframeRef.value) {
    iframeRef.value.src = newUrl
  }
})
</script>

<template>
  <div class="phone-preview-panel">
    <div class="phone-preview-header">
      <span class="phone-preview-title">{{ title ?? '组件预览' }}</span>
      <div class="phone-preview-actions">
        <button class="preview-btn" title="刷新预览" @click="refresh">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
        <button class="preview-btn" title="在新窗口中打开" @click="openInNew">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="phone-mockup">
      <!-- 手机外壳 -->
      <div class="phone-shell">
        <!-- 顶部摄像头区域 -->
        <div class="phone-notch">
          <div class="phone-camera" />
        </div>

        <!-- 屏幕区域 -->
        <div class="phone-screen">
          <!-- 加载占位 -->
          <div v-if="!loaded && !error" class="phone-placeholder">
            <div class="placeholder-spinner" />
            <p class="placeholder-text">正在连接预览服务...</p>
            <p class="placeholder-hint">请先运行 <code>pnpm run dev:h5</code></p>
          </div>

          <!-- 错误状态 -->
          <div v-if="error" class="phone-placeholder phone-placeholder--error">
            <div class="placeholder-icon">⚠️</div>
            <p class="placeholder-text">预览服务未启动</p>
            <p class="placeholder-hint">运行 <code>pnpm run dev:h5</code> 后刷新</p>
            <button class="placeholder-btn" @click="refresh">重试</button>
          </div>

          <iframe
            :key="frameUrl"
            ref="iframeRef"
            :src="frameUrl"
            :class="{ 'is-loaded': loaded }"
            scrolling="yes"
            frameborder="0"
            allow="clipboard-write"
            @load="onLoad"
            @error="onError"
          />
        </div>

        <!-- 底部 Home 键区域 -->
        <div class="phone-bottom">
          <div class="phone-home-bar" />
        </div>
      </div>
    </div>

    <div class="phone-preview-footer">
      <a :href="frameUrl" target="_blank" class="preview-link">
        在浏览器中预览 →
      </a>
    </div>
  </div>
</template>

<style scoped>
.phone-preview-panel {
  position: fixed;
  right: 24px;
  top: calc(var(--vp-nav-height) + 16px);
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

/* 在小屏幕上隐藏预览面板 */
@media (max-width: 1380px) {
  .phone-preview-panel {
    display: none;
  }
}

.phone-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 2px;
}

.phone-preview-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.phone-preview-actions {
  display: flex;
  gap: 4px;
}

.preview-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.preview-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

/* ── 手机外壳 ── */
.phone-mockup {
  display: flex;
  justify-content: center;
}

.phone-shell {
  width: 248px;
  height: 520px;
  background: var(--vp-c-bg-soft);
  border: 2px solid var(--vp-c-border);
  border-radius: 36px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 0 0 1px var(--vp-c-divider),
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.phone-shell::before {
  /* 手机侧边高光 */
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 34px;
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%);
  pointer-events: none;
  z-index: 1;
}

.phone-notch {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.phone-camera {
  width: 64px;
  height: 10px;
  background: var(--vp-c-bg-elv);
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
}

.phone-screen {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #fff;
}

.phone-bottom {
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-divider);
}

.phone-home-bar {
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: var(--vp-c-border);
}

/* ── iframe ── */
.phone-screen iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  opacity: 0;
  transition: opacity 0.3s;
  background: #fff;
}

.phone-screen iframe.is-loaded {
  opacity: 1;
}

/* ── 占位 ── */
.phone-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  text-align: center;
  background: var(--vp-c-bg-soft);
  z-index: 2;
}

.phone-placeholder--error {
  background: #fff9f9;
}

.placeholder-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.placeholder-icon {
  font-size: 28px;
}

.placeholder-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.placeholder-hint {
  font-size: 11px;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.5;
}

.placeholder-hint code {
  font-size: 10px;
  background: var(--vp-c-bg-elv);
  padding: 1px 4px;
  border-radius: 3px;
  color: var(--vp-c-brand);
}

.placeholder-btn {
  margin-top: 4px;
  padding: 4px 12px;
  font-size: 11px;
  border: 1px solid var(--vp-c-brand);
  background: transparent;
  color: var(--vp-c-brand);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.placeholder-btn:hover {
  background: var(--vp-c-brand-soft);
}

/* ── Footer 链接 ── */
.phone-preview-footer {
  text-align: center;
}

.preview-link {
  font-size: 11px;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.15s;
}

.preview-link:hover {
  color: var(--vp-c-brand);
}
</style>
