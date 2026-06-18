<script setup lang="ts">
import { useData } from 'vitepress'

const { isDark } = useData()

function toggleDark() {
  isDark.value = !isDark.value
}

const stats = [
  { value: '60+', label: '精品组件' },
  { value: 'H5 · App · 小程序', label: '多端支持' },
  { value: '100%', label: 'TypeScript' },
  { value: 'MIT', label: '开源协议' },
]

const features = [
  {
    icon: '🎨',
    color: '#837fe1',
    bg: 'rgba(131,127,225,0.1)',
    title: 'Design Token 主题系统',
    desc: '完整的 CSS 变量体系，明暗双主题开箱即用。一行变量覆盖全站配色，无需侵入组件源码。',
  },
  {
    icon: '✨',
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.1)',
    title: '图标工程化',
    desc: '内置从 SVG 库自动转字体的构建脚本。只需放入 SVG 资源即可生成跨端兼容的字体图标，大幅提升开发效率。',
  },
  {
    icon: '🔷',
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.1)',
    title: 'TypeScript 优先',
    desc: '全量 Props / Emits / Slots 类型声明，IDE 自动补全触手可及，重构与协作都更安心。',
  },
  {
    icon: '⚡',
    color: '#d97706',
    bg: 'rgba(217,119,6,0.1)',
    title: '按需引用',
    desc: '每个组件独立成文件，配合 tree-shaking 只打包实际用到的部分，产物体积精简到极致。',
  },
  {
    icon: '🧩',
    color: '#16a34a',
    bg: 'rgba(22,163,74,0.1)',
    title: '60+ 全场景组件',
    desc: '涵盖基础元素、表单控件、数据展示、导航、反馈浮层等所有常用场景，开箱即搭完整应用。',
  },
  {
    icon: '🎭',
    color: '#db2777',
    bg: 'rgba(219,39,119,0.1)',
    title: '流畅动效',
    desc: '内置精心调校的过渡动画，弹窗、抽屉、Toast 等反馈组件均有原生感动效，体验细腻顺滑。',
  },
]

const codeSnippet = `import { LkButton, LkToast } from 'lucky-ui'

// 全局引入
import LuckyUI from 'lucky-ui'
app.use(LuckyUI)`

const installCmd = 'pnpm add lucky-ui'
</script>

<template>
  <div class="lk-home">
    <!-- ─── Header ────────────────────────────── -->
    <header class="lk-header">
      <div class="lk-header__inner">
        <a href="/" class="lk-header__logo">
          <img src="/logo.png" alt="Lucky UI Logo" class="lk-header__logo-img" />
          <span class="lk-header__logo-name">Lucky UI</span>
        </a>
        <nav class="lk-header__nav">
          <a href="/guide/" class="lk-header__link">指南</a>
          <a href="/components/" class="lk-header__link">组件</a>
          <a href="https://github.com/Orpheus-K/lucky-ui" target="_blank" rel="noopener" class="lk-header__link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.92.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.745 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            GitHub
          </a>
        </nav>
        <button class="lk-header__toggle" :title="isDark ? '切换至亮色模式' : '切换至暗色模式'" @click="toggleDark">
          <!-- sun -->
          <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
          </svg>
          <!-- moon -->
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </header>
    <!-- ─── Hero ─────────────────────────────────── -->
    <section class="lk-hero">
      <div class="lk-hero__grid-bg" />
      <div class="lk-hero__glow lk-hero__glow--1" />
      <div class="lk-hero__glow lk-hero__glow--2" />

      <div class="lk-hero__inner">
        <div class="lk-hero__content">
          <!-- badge -->
          <div class="lk-hero__badge">
            <span class="lk-hero__badge-dot" />
            <span>面向 Uni-app 的跨端组件库</span>
          </div>

          <!-- title -->
          <h1 class="lk-hero__title">
            遇见
            <span class="lk-hero__title-gradient">Lucky UI</span>
            <br>定义跨端美学新高度
          </h1>

          <div class="lk-hero__metrics" aria-label="Lucky UI 文档访问统计">
            <div class="lk-hero__metric">
              <span class="lk-hero__metric-label">访问量</span>
              <strong id="vercount_value_site_pv" class="lk-hero__metric-value">--</strong>
            </div>
            <span class="lk-hero__metric-divider" aria-hidden="true" />
            <div class="lk-hero__metric">
              <span class="lk-hero__metric-label">访客数</span>
              <strong id="vercount_value_site_uv" class="lk-hero__metric-value">--</strong>
            </div>
          </div>

          <p class="lk-hero__desc">
            高颜值、轻量级、富有设计感的 Uni-app 组件库。支持 Design Token 动态主题与细腻动效，一套代码轻松覆盖 <strong>H5</strong>、<strong>App</strong> 与<strong>小程序</strong>，让每一次交互都充满精致与愉悦。
          </p>

          <!-- CTA -->
          <div class="lk-hero__actions">
            <a href="/guide/" class="lk-btn lk-btn--primary">
              快速上手
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="/components/" class="lk-btn lk-btn--secondary">
              浏览组件
            </a>
            <a href="https://github.com/Orpheus-K/lucky-ui" target="_blank" rel="noopener" class="lk-btn lk-btn--ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.92.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.745 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              GitHub
            </a>
          </div>

          <!-- install hint -->
          <div class="lk-hero__install">
            <span class="lk-hero__install-prompt">$</span>
            <code>{{ installCmd }}</code>
          </div>
        </div>

        <!-- right: floating cards preview -->
        <div class="lk-hero__preview" aria-hidden="true">
          <div class="lk-preview-card lk-preview-card--components">
            <div class="lk-preview-card__label">组件库</div>
            <div class="lk-preview-card__chips">
              <span class="lk-chip" style="--chip-c: #837fe1">Button</span>
              <span class="lk-chip" style="--chip-c: #0891b2">Toast</span>
              <span class="lk-chip" style="--chip-c: #16a34a">Form</span>
              <span class="lk-chip" style="--chip-c: #db2777">Modal</span>
              <span class="lk-chip" style="--chip-c: #2563eb">Calendar</span>
              <span class="lk-chip" style="--chip-c: #837fe1">Upload</span>
              <span class="lk-chip" style="--chip-c: #0891b2">Skeleton</span>
              <span class="lk-chip lk-chip--more">+52 more</span>
            </div>
          </div>

          <!-- ── 微信小程序扫码体验 ── -->
          <div class="lk-preview-card lk-preview-card--qrcode">
            <div class="lk-qrcode-card__inner">
              <div class="lk-qrcode-card__title-bar">
                <span class="lk-qrcode-card__status-dot" />
                <span>微信小程序真机预览</span>
              </div>
              <div class="lk-qrcode-card__content">
                <div class="lk-qrcode-wrapper">
                  <img src="/mp-qrcode.png" alt="微信小程序二维码" class="lk-qrcode-img" />
                  <div class="lk-qrcode-scan-line" />
                </div>
                <div class="lk-qrcode-info">
                  <div class="lk-qrcode-tag">
                    <span class="lk-wechat-icon">💬</span> 微信小程序
                  </div>
                  <p class="lk-qrcode-desc">微信扫一扫，真机体验 60+ 精品组件与细腻动效</p>
                </div>
              </div>
            </div>
          </div>

          <div class="lk-preview-card lk-preview-card--platform">
            <div class="lk-preview-platform">
              <span class="lk-preview-platform__icon">🌐</span>
              <div>
                <div class="lk-preview-platform__name">H5 移动端</div>
                <div class="lk-preview-platform__status lk-preview-platform__status--ok">✓ 支持</div>
              </div>
            </div>
            <div class="lk-preview-platform">
              <span class="lk-preview-platform__icon">📦</span>
              <div>
                <div class="lk-preview-platform__name">原生 App</div>
                <div class="lk-preview-platform__status lk-preview-platform__status--ok">✓ 支持</div>
              </div>
            </div>
            <div class="lk-preview-platform">
              <span class="lk-preview-platform__icon">💬</span>
              <div>
                <div class="lk-preview-platform__name">微信小程序</div>
                <div class="lk-preview-platform__status lk-preview-platform__status--ok">✓ 支持</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Stats ─────────────────────────────────── -->
    <section class="lk-stats">
      <div class="lk-stats__inner">
        <div v-for="s in stats" :key="s.label" class="lk-stats__item">
          <div class="lk-stats__value">{{ s.value }}</div>
          <div class="lk-stats__label">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <!-- ─── Features ─────────────────────────────── -->
    <section class="lk-features">
      <div class="lk-section__inner">
        <div class="lk-section__header">
          <div class="lk-section__eyebrow">核心特性</div>
          <h2 class="lk-section__title">为什么选择 Lucky UI？</h2>
          <p class="lk-section__sub">这些特性帮助我们在日常开发中少走弯路，也希望对你有用。</p>
        </div>

        <div class="lk-features__grid">
          <div v-for="f in features" :key="f.title" class="lk-feature-card">
            <div class="lk-feature-card__icon" :style="{ background: f.bg, color: f.color }">
              {{ f.icon }}
            </div>
            <h3 class="lk-feature-card__title">{{ f.title }}</h3>
            <p class="lk-feature-card__desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Quick Start ───────────────────────────── -->
    <section class="lk-quickstart">
      <div class="lk-section__inner lk-quickstart__inner">
        <div class="lk-quickstart__text">
          <div class="lk-section__eyebrow">快速开始</div>
          <h2 class="lk-section__title">三步接入，立即使用</h2>
          <p class="lk-section__sub">无需繁琐配置，安装后即可在任意 Uni-app 项目中使用所有组件。</p>
          <a href="/guide/" class="lk-btn lk-btn--primary" style="margin-top: 24px">
            查看完整文档
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
        <div class="lk-quickstart__steps">
          <div class="lk-step">
            <div class="lk-step__num">01</div>
            <div class="lk-step__body">
              <div class="lk-step__title">安装</div>
              <div class="lk-step__code"><span class="lk-step__prompt">$</span> pnpm add lucky-ui</div>
            </div>
          </div>
          <div class="lk-step">
            <div class="lk-step__num">02</div>
            <div class="lk-step__body">
              <div class="lk-step__title">注册</div>
              <div class="lk-step__code">
                <span class="lk-step__import">import</span> LuckyUI <span class="lk-step__import">from</span> <span class="lk-step__str">'lucky-ui'</span><br>
                app.<span class="lk-step__fn">use</span>(LuckyUI)
              </div>
            </div>
          </div>
          <div class="lk-step">
            <div class="lk-step__num">03</div>
            <div class="lk-step__body">
              <div class="lk-step__title">使用</div>
              <div class="lk-step__code">
                <span class="lk-step__tag">&lt;</span><span class="lk-step__tagname">lk-button</span> <span class="lk-step__attr">type</span>=<span class="lk-step__str">"primary"</span><span class="lk-step__tag">&gt;</span>提交<span class="lk-step__tag">&lt;/</span><span class="lk-step__tagname">lk-button</span><span class="lk-step__tag">&gt;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── CTA ───────────────────────────────────── -->
    <section class="lk-cta">
      <div class="lk-cta__glow" />
      <div class="lk-section__inner">
        <h2 class="lk-cta__title">开始构建你的下一个应用</h2>
        <p class="lk-cta__sub">加入已在使用 Lucky UI 的开发者，构建令人愉悦的跨端体验。</p>
        <div class="lk-cta__actions">
          <a href="/guide/" class="lk-btn lk-btn--primary lk-btn--lg">开始使用</a>
          <a href="/components/" class="lk-btn lk-btn--outline-white lk-btn--lg">组件文档</a>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ─── Root ─────────────────────────────────────── */
.lk-home {
  --brand: #837fe1;
  --brand-2: #726edd;
  --brand-3: #625ebf;
  width: 100%;
  overflow-x: hidden;
  /* 确保根容器跟随 VitePress 背景色 */
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: background-color 0.4s ease;
}
/* ─── Header ────────────────────────────────── */
.lk-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg) 85%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.lk-header__inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
}
.lk-header__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}
.lk-header__logo-img {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  object-fit: cover;
  flex-shrink: 0;
}
.lk-header__logo-mark {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: linear-gradient(135deg, var(--brand) 0%, #db2777 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.5px;
}
.lk-header__logo-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  letter-spacing: -0.3px;
}
.lk-header__nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}
.lk-header__link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}
.lk-header__link:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}
.lk-header__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  margin-left: 8px;
}
.lk-header__toggle:hover {
  color: var(--brand);
  border-color: rgba(131,127,225,0.4);
  background: rgba(131,127,225,0.06);
}

@media (max-width: 480px) {
  .lk-header__link:not(:last-child) { display: none; }
}
/* ─── Hero ─────────────────────────────────────── */
.lk-hero {
  position: relative;
  min-height: 600px;
  padding: 80px 24px 80px;
  overflow: hidden;
}

.lk-hero__grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--vp-c-divider) 1px, transparent 1px),
    linear-gradient(to bottom, var(--vp-c-divider) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 0%, black 40%, transparent 100%);
  opacity: 0.5;
}

.lk-hero__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.lk-hero__glow--1 {
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(131,127,225,0.18) 0%, transparent 70%);
  top: -80px;
  right: -100px;
}
.lk-hero__glow--2 {
  width: 400px;
  height: 300px;
  background: radial-gradient(ellipse, rgba(219,39,119,0.12) 0%, transparent 70%);
  bottom: 0;
  left: 10%;
}

.lk-hero__inner {
  position: relative;
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 60px;
}

.lk-hero__content {
  flex: 1;
  min-width: 0;
}

/* badge */
.lk-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  margin-bottom: 24px;
}
.lk-hero__badge-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 0 3px rgba(131,127,225,0.2);
}

/* title */
.lk-hero__title {
  font-family: var(--lk-font-family-serif), Georgia, serif;
  font-size: clamp(32px, 4.5vw, 52px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.5px;
  color: var(--vp-c-text-1);
  margin: 0 0 20px;
}
.lk-hero__title-gradient {
  background: linear-gradient(135deg, var(--brand) 0%, #db2777 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.lk-hero__metrics {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 9px 14px;
  margin-bottom: 24px;
  border: 1px solid rgba(131,127,225,0.2);
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 86%, transparent);
  box-shadow: 0 10px 30px rgba(131,127,225,0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.lk-hero__metric {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}
.lk-hero__metric-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-3);
}
.lk-hero__metric-value {
  min-width: 2ch;
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  font-weight: 800;
  color: var(--brand);
  letter-spacing: 0;
}
.lk-hero__metric-divider {
  width: 1px;
  height: 14px;
  background: var(--vp-c-divider);
}

.lk-hero__desc {
  font-size: 17px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  margin: 0 0 32px;
  max-width: 520px;
}

/* actions */
.lk-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 28px;
}

/* install hint */
.lk-hero__install {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.lk-hero__install-prompt {
  color: var(--brand);
  font-weight: 700;
}
.lk-hero__install code {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
  color: var(--vp-c-text-1);
}

/* ─── Preview Cards ─────────────────────────────── */
.lk-hero__preview {
  flex-shrink: 0;
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.lk-preview-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.lk-preview-card--code {
  padding-bottom: 16px;
  /* 使用 VitePress 内置变量，主题切换时背景会自动跟随 */
  background: var(--vp-c-bg-soft) !important;
  border-color: var(--vp-c-divider) !important;
}
.lk-preview-card__header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 4px;
}
.lk-preview-card__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.lk-preview-card__dot--red    { background: #ff5f57; }
.lk-preview-card__dot--yellow { background: #febc2e; }
.lk-preview-card__dot--green  { background: #28c840; }
.lk-preview-card__title {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-left: 6px;
}
.lk-preview-card__code {
  padding: 8px 18px 0;
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.7;
  background: none;
  overflow: hidden;
  color: var(--vp-c-text-1);
}

/* ─── 语法高亮跟随主题变量 ─── */
/* 这里我们通过两套 CSS 变量定义颜色，然后应用到 span */
.lk-home {
  --code-keyword: #8b5cf6;
  --code-name: #2563eb;
  --code-str: #059669;
  --code-punct: #64748b;
  --code-fn: #d97706;
  --code-brace: #64748b;
}
:global(.dark) .lk-home {
  --code-keyword: #c792ea;
  --code-name: #82aaff;
  --code-str: #c3e88d;
  --code-punct: #89ddff;
  --code-fn: #ffcb6b;
  --code-brace: #89ddff;
}

.lk-code-keyword { color: var(--code-keyword); }
.lk-code-name    { color: var(--code-name); }
.lk-code-str     { color: var(--code-str); }
.lk-code-punct   { color: var(--code-punct); }
.lk-code-fn      { color: var(--code-fn); }
.lk-code-brace   { color: var(--code-brace); }

.lk-preview-card--components {
  padding: 16px;
}
.lk-preview-card__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-bottom: 10px;
}
.lk-preview-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.lk-chip {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  background: color-mix(in srgb, var(--chip-c) 12%, transparent);
  color: var(--chip-c);
  border: 1px solid color-mix(in srgb, var(--chip-c) 25%, transparent);
}
.lk-chip--more {
  --chip-c: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}

.lk-preview-card--platform {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.lk-preview-platform {
  display: flex;
  align-items: center;
  gap: 12px;
}
.lk-preview-platform__icon { font-size: 22px; }
.lk-preview-platform__name {
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}
.lk-preview-platform__status {
  font-size: 12px;
  margin-top: 2px;
}
.lk-preview-platform__status--ok { color: #16a34a; }

/* ─── Stats ─────────────────────────────────────── */
.lk-stats {
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
}
.lk-stats__inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.lk-stats__item {
  padding: 28px 0;
  text-align: center;
  border-right: 1px solid var(--vp-c-divider);
}
.lk-stats__item:last-child { border-right: none; }
.lk-stats__value {
  font-size: 26px;
  font-weight: 800;
  color: var(--brand);
  letter-spacing: -0.5px;
  line-height: 1;
  margin-bottom: 6px;
}
.lk-stats__label {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

/* ─── Features ──────────────────────────────────── */
.lk-features {
  padding: 96px 24px;
}
.lk-section__inner {
  max-width: 1180px;
  margin: 0 auto;
}
.lk-section__header {
  text-align: center;
  margin-bottom: 56px;
}
.lk-section__eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brand);
  background: rgba(131,127,225,0.08);
  border: 1px solid rgba(131,127,225,0.2);
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 16px;
}
.lk-section__title {
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--vp-c-text-1);
  margin: 0 0 14px;
}
.lk-section__sub {
  font-size: 16px;
  color: var(--vp-c-text-2);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

.lk-features__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.lk-feature-card {
  padding: 28px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}
.lk-feature-card:hover {
  border-color: rgba(131,127,225,0.3);
  box-shadow: 0 8px 32px rgba(131,127,225,0.08);
  transform: translateY(-2px);
}
.lk-feature-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 18px;
}
.lk-feature-card__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 10px;
}
.lk-feature-card__desc {
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  margin: 0;
}

/* ─── Quick Start ───────────────────────────────── */
.lk-quickstart {
  padding: 96px 24px;
  background: var(--vp-c-bg-alt);
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
}
.lk-quickstart__inner {
  display: flex;
  align-items: center;
  gap: 80px;
}
.lk-quickstart__text { flex: 1; }
.lk-quickstart__steps {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lk-step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}
.lk-step__num {
  font-size: 12px;
  font-weight: 800;
  font-family: var(--vp-font-family-mono);
  color: var(--brand);
  background: rgba(124,58,237,0.08);
  padding: 3px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  letter-spacing: 0.04em;
}
.lk-step__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 6px;
}
.lk-step__code {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}
.lk-step__prompt { color: var(--brand); font-weight: 700; }
.lk-step__import { color: #a78bfa; }
.lk-step__str    { color: #86efac; }
.lk-step__fn     { color: #fcd34d; }
.lk-step__tag    { color: #a78bfa; }
.lk-step__tagname{ color: #60a5fa; }
.lk-step__attr   { color: #86efac; }

/* ─── CTA ───────────────────────────────────────── */
.lk-cta {
  position: relative;
  padding: 100px 24px;
  text-align: center;
  overflow: hidden;
}
.lk-cta__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(131,127,225,0.1) 0%, transparent 70%);
  pointer-events: none;
}
.lk-cta__title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 800;
  letter-spacing: -1px;
  color: var(--vp-c-text-1);
  margin: 0 0 16px;
}
.lk-cta__sub {
  font-size: 17px;
  color: var(--vp-c-text-2);
  margin: 0 0 40px;
}
.lk-cta__actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 14px;
}

/* ─── Buttons ───────────────────────────────────── */
.lk-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.18s;
  cursor: pointer;
  border: none;
  line-height: 1.4;
}
.lk-btn--primary {
  background: var(--brand);
  color: #fff;
}
.lk-btn--primary:hover {
  background: var(--brand-2);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(131,127,225,0.35);
}
.lk-btn--secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.lk-btn--secondary:hover {
  border-color: rgba(131,127,225,0.4);
  color: var(--brand);
}
.lk-btn--ghost {
  background: transparent;
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
}
.lk-btn--ghost:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-text-2);
}
.lk-btn--outline-white {
  background: transparent;
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.lk-btn--outline-white:hover {
  border-color: rgba(131,127,225,0.4);
  color: var(--brand);
}
.lk-btn--lg {
  padding: 13px 30px;
  font-size: 15px;
  border-radius: 10px;
}

/* ─── Responsive ────────────────────────────────── */
@media (max-width: 1024px) {
  .lk-hero__inner {
    flex-direction: column;
    text-align: center;
  }
  .lk-hero__metrics { justify-content: center; }
  .lk-hero__desc { margin-left: auto; margin-right: auto; }
  .lk-hero__actions { justify-content: center; }
  .lk-hero__install { display: none; }
  .lk-hero__preview { width: 100%; max-width: 480px; }
  .lk-features__grid { grid-template-columns: repeat(2, 1fr); }
  .lk-quickstart__inner { flex-direction: column; gap: 40px; }
}

@media (max-width: 640px) {
  .lk-hero { padding: 80px 20px 60px; }
  .lk-hero__metrics {
    max-width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 10px;
    border-radius: 14px;
  }
  .lk-hero__metric-divider { display: none; }
  .lk-stats__inner { grid-template-columns: repeat(2, 1fr); }
  .lk-stats__item:nth-child(2) { border-right: none; }
  .lk-stats__item:nth-child(3) { border-top: 1px solid var(--vp-c-divider); }
  .lk-stats__item:nth-child(4) { border-top: 1px solid var(--vp-c-divider); border-right: none; }
  .lk-features__grid { grid-template-columns: 1fr; }
  .lk-hero__preview { display: none; }
}

/* ─── Dark Mode ─────────────────────────────────── */
:global(.dark) .lk-header__toggle:hover {
  color: var(--brand);
  border-color: rgba(163,160,234,0.4);
  background: rgba(163,160,234,0.08);
}

:global(.dark) .lk-home {
  --brand: #a3a0ea;
  --brand-2: #837fe1;
  --brand-3: #726edd;
}

:global(.dark) .lk-hero__glow--1 {
  background: radial-gradient(ellipse, rgba(163,160,234,0.14) 0%, transparent 70%);
}
:global(.dark) .lk-hero__glow--2 {
  background: radial-gradient(ellipse, rgba(236,72,153,0.1) 0%, transparent 70%);
}

:global(.dark) .lk-feature-card:hover {
  border-color: rgba(163,160,234,0.35);
  box-shadow: 0 8px 32px rgba(163,160,234,0.12);
}

:global(.dark) .lk-cta__glow {
  background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(163,160,234,0.12) 0%, transparent 70%);
}

:global(.dark) .lk-preview-platform__status--ok {
  color: #4ade80;
}

:global(.dark) .lk-section__eyebrow {
  background: rgba(163,160,234,0.1);
  border-color: rgba(163,160,234,0.25);
}

:global(.dark) .lk-stats__value {
  color: var(--brand);
}

:global(.dark) .lk-step__num {
  background: rgba(163,160,234,0.12);
}

:global(.dark) .lk-hero__badge-dot {
  box-shadow: 0 0 0 3px rgba(163,160,234,0.25);
}

:global(.dark) .lk-hero__metrics {
  border-color: rgba(163,160,234,0.25);
  box-shadow: 0 10px 30px rgba(163,160,234,0.1);
}

/* ─── QR Code Preview Card ─── */
.lk-preview-card--qrcode {
  position: relative;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  padding: 16px;
  overflow: hidden;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
}

.lk-preview-card--qrcode:hover {
  border-color: rgba(131, 127, 225, 0.4);
  box-shadow: 0 12px 40px rgba(131, 127, 225, 0.12);
  transform: translateY(-2px);
}

.lk-qrcode-card__inner {
  position: relative;
  z-index: 2;
}

.lk-qrcode-card__title-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-bottom: 14px;
}

.lk-qrcode-card__status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
  animation: lk-pulse 2s infinite;
}

@keyframes lk-pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.lk-qrcode-card__content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.lk-qrcode-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  background: #ffffff;
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  flex-shrink: 0;
}

.lk-qrcode-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

/* 扫描激光线动画 */
.lk-qrcode-scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, transparent, #837fe1, #db2777, transparent);
  box-shadow: 0 0 8px rgba(131, 127, 225, 0.8);
  animation: lk-scan 3s linear infinite;
}

@keyframes lk-scan {
  0% { top: 0%; }
  50% { top: 100%; }
  100% { top: 0%; }
}

.lk-qrcode-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.lk-qrcode-tag {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 8px;
  border-radius: 99px;
  border: 1px solid rgba(16, 185, 129, 0.15);
}

.lk-wechat-icon {
  font-size: 12px;
}

.lk-qrcode-desc {
  font-size: 12px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  margin: 0;
}

:global(.dark) .lk-preview-card--qrcode:hover {
  border-color: rgba(163, 160, 234, 0.35);
  box-shadow: 0 12px 40px rgba(163, 160, 234, 0.15);
}

:global(.dark) .lk-qrcode-scan-line {
  background: linear-gradient(to right, transparent, #a3a0ea, #f472b6, transparent);
  box-shadow: 0 0 8px rgba(163, 160, 234, 0.8);
}
</style>
