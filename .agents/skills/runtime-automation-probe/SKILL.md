---
name: runtime-automation-probe
description: "Runtime Automation Probe: 基于 Playwright / miniprogram-automator 的跨端 UI 运行态探针。必须用于用户提及抓取 H5、抓取h5、H5运行态、抓取微信小程序、微信小程序运行态、小程序运行态、抓 DOM、抓 WXML、元素标签、元素结构、样式、尺寸、offset、size、style、交互结果、跨端 UI 对比、运行态回归等场景。"
---

# Runtime Automation Probe

## Core

Use this skill to inspect real rendered UI instead of inferring from source. Capture structured runtime evidence from:

- H5 DOM with Playwright.
- WeChat Mini Program WXML with WeChat DevTools CLI plus `miniprogram-automator`.

Prefer background automation. Do not repeatedly open foreground WeChat DevTools unless the user explicitly asks.

## Workflow

1. Clarify target route only if it cannot be inferred from local code or user text.
2. Ensure the relevant runtime is available:
   - H5: use the active dev server if present; otherwise start the repo's H5 dev command when runtime capture is required.
   - MP Weixin: use existing DevTools automation port first, usually `ws://127.0.0.1:9420`; start CLI automation only when the port is unavailable.
3. Capture before changing code:
   - route, query, title/page path
   - element tag / WXML or DOM outer markup
   - class, text, `data-*` / component data when available
   - `offset`, `size`, relevant computed styles
   - scroll position and interaction results
   - console/page errors when relevant
4. Fix from measured evidence, preferring component-level changes for reusable UI defects.
5. Re-capture the same selectors and interactions after the fix.
6. For MP UI fixes, run `auto-preview` after verification.

## H5 Probe

Use Playwright or `@playwright/test` from the repo. Capture data with `$eval/$$eval`, `getBoundingClientRect()`, computed style, console messages, and page errors.

Typical fields:

```js
{
  target: 'h5',
  url,
  selector,
  tag,
  className,
  text,
  rect: { left, top, width, height },
  styles: { color, display, whiteSpace, overflow },
  outerHTML,
  consoleMessages,
  pageErrors
}
```

## WeChat Mini Program Probe

Use the WeChat DevTools CLI and `miniprogram-automator`.

Connection pattern:

```js
const automator = require(process.env.MP_AUTOMATOR || `${process.env.TEMP}\\mp-automator\\node_modules\\miniprogram-automator`);
const miniProgram = await automator.connect({ wsEndpoint: process.env.MP_AUTOMATOR_WS || 'ws://127.0.0.1:9420' });
```

Capture with:

- `miniProgram.reLaunch(route)` for deterministic route entry.
- `page.$()` / `page.$$()` for WXML elements.
- `outerWxml()`, `text()`, `attribute('class')`, `offset()`, `size()`, `style(name)`.
- `miniProgram.evaluate()` for app-service state, `wx.createSelectorQuery()`, `wx.pageScrollTo()`, or component refs.

Important mini program constraints:

- `outerWxml()` may show dynamic text nodes as empty; trust `text()` for actual rendered text.
- Cross-component selectors often fail across custom component / slot boundaries. Prefer direct automator element handles, component data, or scoped selector queries inside the component instance.
- Native button or custom component event simulation can be unreliable in automator. When the goal is validating component behavior, calling exposed refs from `miniProgram.evaluate()` is acceptable.
- Always re-read offset/size/style after fixes; do not rely on screenshots alone.

## Evidence Standard

Report findings with concrete runtime numbers, not vague visual impressions:

- before/after `scrollTop`
- element `left/top/width/height`
- class transitions such as `is-idle -> is-error -> is-success`
- selected text/value and color
- exact error text and its offset relative to input/select/textarea

When scripts are useful for repeatability, place them under `artifacts/<feature>-runtime/` or update existing probe scripts. Keep generated screenshots, logs, and preview JSON out of commits unless explicitly requested.
