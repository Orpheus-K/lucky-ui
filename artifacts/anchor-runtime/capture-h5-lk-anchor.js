const { chromium } = require('@playwright/test');

const baseUrl = process.env.H5_URL || 'http://127.0.0.1:5188';
const route = '/#/pages_sub/component-detail/index?name=anchor';
const url = `${baseUrl}${route}`;

function serializeRect(rect) {
  if (!rect) return null;
  return {
    left: Math.round(rect.left * 100) / 100,
    top: Math.round(rect.top * 100) / 100,
    width: Math.round(rect.width * 100) / 100,
    height: Math.round(rect.height * 100) / 100,
  };
}

async function capture(page, label) {
  return page.evaluate((captureLabel) => {
    const readRect = (el) => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        left: Math.round(rect.left * 100) / 100,
        top: Math.round(rect.top * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
      };
    };

    const readStyle = (el, names) => {
      if (!el) return {};
      const style = window.getComputedStyle(el);
      return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name)]));
    };

    const findScrollable = (root) => {
      if (!root) return null;
      const nodes = [root, ...root.querySelectorAll('*')];
      return nodes.find((node) => node.scrollHeight > node.clientHeight + 1) || root;
    };

    const root = document.querySelector('.order-page');
    const anchor = document.querySelector('.lk-anchor');
    const goodsHost = document.querySelector('#anchor-content');
    const scrollEl = findScrollable(goodsHost);
    const links = [...document.querySelectorAll('.lk-anchor-link')].map((el) => {
      const title = el.querySelector('.lk-anchor-link__title');
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id,
        className: el.className,
        text: (el.textContent || '').trim(),
        rect: readRect(el),
        titleStyle: readStyle(title, ['color', 'font-weight', 'line-height', 'word-break']),
        outerHTML: el.outerHTML.slice(0, 500),
      };
    });
    const sections = [...document.querySelectorAll('.goods-section')].map((el) => ({
      id: el.id,
      rect: readRect(el),
      text: (el.querySelector('.goods-section__title')?.textContent || '').trim(),
    }));

    return {
      label: captureLabel,
      url: location.href,
      route: location.hash,
      title: document.title,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      root: {
        tag: root?.tagName.toLowerCase(),
        className: root?.className,
        rect: readRect(root),
        styles: readStyle(root, ['display', 'height', 'overflow']),
      },
      anchor: {
        tag: anchor?.tagName.toLowerCase(),
        className: anchor?.className,
        rect: readRect(anchor),
        styles: readStyle(anchor, ['height', 'overflow', 'background-color']),
      },
      goods: {
        host: {
          tag: goodsHost?.tagName.toLowerCase(),
          id: goodsHost?.id,
          className: goodsHost?.className,
          rect: readRect(goodsHost),
          styles: readStyle(goodsHost, ['height', 'overflow-y', 'display']),
        },
        scrollEl: scrollEl
          ? {
              tag: scrollEl.tagName.toLowerCase(),
              id: scrollEl.id,
              className: scrollEl.className,
              scrollTop: Math.round(scrollEl.scrollTop),
              clientHeight: Math.round(scrollEl.clientHeight),
              scrollHeight: Math.round(scrollEl.scrollHeight),
              rect: readRect(scrollEl),
              styles: readStyle(scrollEl, ['height', 'overflow-y', 'transform']),
            }
          : null,
      },
      activeLinks: links.filter((item) => item.className.includes('lk-anchor-link--active')).map((item) => item.text),
      links,
      sections,
    };
  }, label);
}

(async () => {
  const consoleMessages = [];
  const pageErrors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  page.on('console', (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('.order-page', { timeout: 15000 });
  await page.waitForTimeout(900);

  const before = await capture(page, 'before');
  const targetLink = page.locator('.lk-anchor-link').filter({ hasText: '加料定制' });
  const targetRect = serializeRect(await targetLink.boundingBox());
  await targetLink.click();
  await page.waitForTimeout(800);
  const afterClick = await capture(page, 'after-click-add');

  const fruitLink = page.locator('.lk-anchor-link').filter({ hasText: '鲜果茶' });
  await fruitLink.click();
  await page.waitForTimeout(800);
  const afterSecondClick = await capture(page, 'after-click-fruit');

  console.log(JSON.stringify({
    target: 'h5',
    testedUrl: url,
    clickedTargetRect: targetRect,
    consoleMessages,
    pageErrors,
    captures: [before, afterClick, afterSecondClick],
  }, null, 2));

  await browser.close();
})();
