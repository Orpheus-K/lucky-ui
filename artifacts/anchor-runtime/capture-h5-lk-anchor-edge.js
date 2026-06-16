const { chromium } = require('@playwright/test');

const baseUrl = process.env.H5_URL || 'http://127.0.0.1:5188';
const route = '/#/pages_sub/component-detail/index?name=anchor';
const url = `${baseUrl}${route}`;

async function capture(page, label) {
  return page.evaluate((captureLabel) => {
    const findScrollable = (root) => {
      if (!root) return null;
      const nodes = [root, ...root.querySelectorAll('*')];
      return nodes.find((node) => node.scrollHeight > node.clientHeight + 1) || root;
    };
    const rectOf = (el) => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        top: Math.round(rect.top * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
      };
    };
    const goodsHost = document.querySelector('#anchor-content');
    const scrollEl = findScrollable(goodsHost);
    const links = [...document.querySelectorAll('.lk-anchor-link')].map((el) => ({
      id: el.id,
      text: (el.textContent || '').trim(),
      active: el.className.includes('lk-anchor-link--active'),
      className: el.className,
    }));
    const sections = [...document.querySelectorAll('.goods-section')].map((el) => ({
      id: el.id,
      text: (el.querySelector('.goods-section__title')?.textContent || '').trim(),
      rect: rectOf(el),
    }));
    const active = links.filter((item) => item.active).map((item) => item.text);
    const containerRect = rectOf(goodsHost);
    const maxScrollTop = scrollEl ? Math.round(scrollEl.scrollHeight - scrollEl.clientHeight) : 0;

    return {
      label: captureLabel,
      active,
      scrollTop: scrollEl ? Math.round(scrollEl.scrollTop) : null,
      maxScrollTop,
      scrollHeight: scrollEl ? Math.round(scrollEl.scrollHeight) : null,
      clientHeight: scrollEl ? Math.round(scrollEl.clientHeight) : null,
      containerTop: containerRect?.top,
      lastSection: sections[sections.length - 1],
      previousSection: sections[sections.length - 2],
      links,
    };
  }, label);
}

async function scrollGoods(page, top) {
  await page.evaluate((nextTop) => {
    const host = document.querySelector('#anchor-content');
    const nodes = host ? [host, ...host.querySelectorAll('*')] : [];
    const scrollEl = nodes.find((node) => node.scrollHeight > node.clientHeight + 1);
    if (!scrollEl) return;
    scrollEl.scrollTop = nextTop;
    scrollEl.dispatchEvent(new Event('scroll', { bubbles: true }));
  }, top);
}

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const consoleMessages = [];
  const pageErrors = [];
  page.on('console', (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', (err) => pageErrors.push(err.message));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.order-page', { timeout: 15000 });
  return { page, consoleMessages, pageErrors };
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  const early = await openPage(browser);
  const earlyBefore = await capture(early.page, 'early-before-scroll');
  await scrollGoods(early.page, 1215);
  await early.page.waitForTimeout(80);
  const earlyAfterScroll = await capture(early.page, 'early-after-scroll-80ms');
  await early.page.waitForTimeout(1100);
  const earlyAfterSettle = await capture(early.page, 'early-after-scroll-1180ms');
  await early.page.close();

  const last = await openPage(browser);
  await last.page.waitForTimeout(900);
  const lastBefore = await capture(last.page, 'last-before-click');
  await last.page.locator('.lk-anchor-link').filter({ hasText: '小食搭配' }).click();
  await last.page.waitForTimeout(450);
  const lastAfterClick = await capture(last.page, 'last-after-click-450ms');
  await last.page.waitForTimeout(1100);
  const lastAfterUnlock = await capture(last.page, 'last-after-click-1550ms');
  await last.page.close();

  console.log(JSON.stringify({
    target: 'h5',
    testedUrl: url,
    earlyScroll: {
      consoleMessages: early.consoleMessages,
      pageErrors: early.pageErrors,
      captures: [earlyBefore, earlyAfterScroll, earlyAfterSettle],
    },
    lastItem: {
      consoleMessages: last.consoleMessages,
      pageErrors: last.pageErrors,
      captures: [lastBefore, lastAfterClick, lastAfterUnlock],
    },
  }, null, 2));

  await browser.close();
})();
