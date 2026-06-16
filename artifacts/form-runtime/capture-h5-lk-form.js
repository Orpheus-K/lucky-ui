const { chromium } = require('@playwright/test');

const url = process.env.H5_FORM_URL
  || `http://localhost:5188/#/pages_sub/component-detail/index?name=form&_t=${Date.now()}`;
const viewport = {
  width: Number(process.env.H5_VIEWPORT_WIDTH || 390),
  height: Number(process.env.H5_VIEWPORT_HEIGHT || 844),
};
const rowLimit = Number(process.env.FORM_ROW_LIMIT || 10);

async function captureRows(page, limit = rowLimit) {
  return page.$$eval('.lk-form-item', (els, max) => els.slice(0, max).map((el, index) => {
    const rect = el.getBoundingClientRect();
    const err = el.querySelector('.lk-form-item__error');
    return {
      index,
      tag: `${el.tagName.toLowerCase()}.lk-form-item`,
      prop: el.getAttribute('data-prop') || '',
      class: el.getAttribute('class') || '',
      text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      rect: {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      errorText: err ? (err.textContent || '').trim() : '',
      outerHTML: el.outerHTML.slice(0, 360),
    };
  }), limit);
}

async function scrollState(page) {
  return page.evaluate(() => {
    const pageContent = document.querySelector('.page-content');
    const title = document.querySelector('.lk-form-item[data-prop*="title"]');
    const titleRect = title ? title.getBoundingClientRect() : null;
    return {
      windowScrollY: Math.round(window.scrollY),
      pageContentScrollTop: pageContent ? Math.round(pageContent.scrollTop) : null,
      pageContentClass: pageContent ? pageContent.getAttribute('class') : '',
      titleViewportTop: titleRect ? Math.round(titleRect.top) : null,
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => pageErrors.push(String((err && err.message) || err)));

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.lk-form-item', { timeout: 10000 });
  await page.waitForTimeout(500);

  const pageContentInfo = await page.$eval('.page-content', el => ({
    tag: el.tagName.toLowerCase(),
    class: el.getAttribute('class'),
    outerHTML: el.outerHTML.slice(0, 360),
  }));
  const initialRows = await captureRows(page, 4);

  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(250);
  const before = await scrollState(page);

  await page.locator('.lk-button').first().click({ timeout: 5000 });
  await page.waitForTimeout(900);
  const after = await scrollState(page);
  const errorRows = (await captureRows(page)).filter(row => row.errorText);

  console.log(JSON.stringify({
    target: 'h5',
    url,
    title: await page.title(),
    viewport,
    pageContentInfo,
    before,
    after,
    initialRows,
    errorRows,
    consoleMessages: consoleMessages.filter(m => m.type === 'warning' || m.type === 'error'),
    pageErrors,
  }, null, 2));

  await browser.close();
})().catch(err => {
  console.error((err && err.stack) || err);
  process.exit(1);
});
