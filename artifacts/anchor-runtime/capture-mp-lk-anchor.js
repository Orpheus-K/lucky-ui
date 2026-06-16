const automator = require(
  process.env.MP_AUTOMATOR
  || `${process.env.TEMP}\\mp-automator\\node_modules\\miniprogram-automator`
);

const wsEndpoint = process.env.MP_AUTOMATOR_WS || 'ws://127.0.0.1:9420';
const route = process.env.MP_ANCHOR_ROUTE
  || `/pages_sub/component-detail/index?name=anchor&_t=${Date.now()}`;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const verbose = process.env.MP_ANCHOR_VERBOSE === '1';

async function safe(label, fn, fallback = null) {
  try {
    return await fn();
  } catch (err) {
    return typeof fallback === 'function' ? fallback(err) : fallback;
  }
}

async function routeFast(miniProgram, targetRoute) {
  await miniProgram.callWxMethod('reLaunch', { url: targetRoute });
  for (let i = 0; i < 30; i += 1) {
    const page = await miniProgram.currentPage().catch(() => null);
    if (page && page.path === targetRoute.split('?')[0].replace(/^\//, '')) {
      return page;
    }
    await sleep(100);
  }
  return miniProgram.currentPage();
}

async function waitForElement(page, selector, timeout = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const el = await page.$(selector).catch(() => null);
    if (el) return el;
    await sleep(100);
  }
  throw new Error(`selector ${selector} timeout`);
}

async function elementInfo(el, options = {}) {
  if (!el) return null;
  const info = {
    tag: el.tagName,
    class: await safe('class', () => el.attribute('class'), ''),
    text: await safe('text', () => el.text(), ''),
    offset: await safe('offset', () => el.offset()),
    size: await safe('size', () => el.size()),
  };
  if (options.id) info.id = await safe('id', () => el.attribute('id'), '');
  if (options.wxml) info.outerWxml = (await safe('outerWxml', () => el.outerWxml(), '')).slice(0, options.wxml);
  return info;
}

async function collectLinks(page) {
  const links = await page.$$('.lk-anchor-link');
  const rows = [];
  for (let i = 0; i < links.length; i += 1) {
    const link = links[i];
    rows.push({
      index: i,
      ...(await elementInfo(link, { id: true, wxml: 320 })),
      active: ((await safe('class', () => link.attribute('class'), '')) || '').includes('lk-anchor-link--active'),
    });
  }
  return rows;
}

async function collectSections(page) {
  const sections = await page.$$('.goods-section');
  const rows = [];
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    rows.push({
      index: i,
      ...(await elementInfo(section, { id: true })),
    });
  }
  return rows;
}

async function capture(page, label) {
  const anchor = await page.$('.lk-anchor').catch(() => null);
  const goods = await page.$('.goods-content').catch(() => null);
  const links = await collectLinks(page);
  const sections = await collectSections(page);
  const scrollTop = goods ? await safe('scrollTop', () => goods.property('scrollTop')) : null;
  const scrollHeight = goods && typeof goods.scrollHeight === 'function'
    ? await safe('scrollHeight', () => goods.scrollHeight())
    : null;

  return {
    label,
    pagePath: page.path,
    query: page.query,
    anchor: await elementInfo(anchor, { wxml: 420 }),
    goods: goods
      ? {
          ...(await elementInfo(goods, { id: true, wxml: 420 })),
          scrollTop,
          scrollHeight,
        }
      : null,
    activeLinks: links.filter(item => item.active).map(item => item.text),
    links: verbose ? links : links.map(item => ({
      index: item.index,
      text: item.text,
      active: item.active,
      class: item.class,
      offset: item.offset,
      size: item.size,
    })),
    lastSection: sections[sections.length - 1],
    previousSection: sections[sections.length - 2],
    sections: verbose ? sections : sections.map(item => ({
      index: item.index,
      text: item.text.split('\n')[0],
      offset: item.offset,
      size: item.size,
      id: item.id,
    })),
  };
}

async function findLinkByText(page, keyword) {
  const links = await page.$$('.lk-anchor-link');
  for (const link of links) {
    const text = await safe('text', () => link.text(), '');
    if (text.includes(keyword)) return link;
  }
  return null;
}

(async () => {
  const miniProgram = await automator.connect({ wsEndpoint });
  const consoleMessages = [];
  const exceptions = [];
  miniProgram.on('console', msg => consoleMessages.push(msg));
  miniProgram.on('exception', err => exceptions.push(err));

  const earlyPage = await routeFast(miniProgram, route);
  await waitForElement(earlyPage, '.order-page');
  const earlyBefore = await capture(earlyPage, 'early-before-scroll');
  const earlyGoods = await earlyPage.$('.goods-content');
  if (!earlyGoods) throw new Error('goods scroll-view not found');
  await earlyGoods.scrollTo(0, 1215);
  await sleep(120);
  const earlyAfterScroll = await capture(earlyPage, 'early-after-scroll-120ms');
  await sleep(1100);
  const earlyAfterSettle = await capture(earlyPage, 'early-after-scroll-1220ms');

  const lastPage = await miniProgram.reLaunch(route);
  await waitForElement(lastPage, '.order-page');
  await sleep(900);
  const lastBefore = await capture(lastPage, 'last-before-click');
  const lastLink = await findLinkByText(lastPage, '小食搭配');
  if (!lastLink) throw new Error('last anchor link not found');
  await lastLink.tap();
  await sleep(450);
  const lastAfterClick = await capture(lastPage, 'last-after-click-450ms');
  await sleep(1100);
  const lastAfterUnlock = await capture(lastPage, 'last-after-click-1550ms');

  console.log(JSON.stringify({
    target: 'mp-weixin',
    wsEndpoint,
    route,
    consoleMessages,
    exceptions,
    earlyScroll: [earlyBefore, earlyAfterScroll, earlyAfterSettle],
    lastItem: [lastBefore, lastAfterClick, lastAfterUnlock],
  }, null, 2));

  await miniProgram.disconnect();
})().catch(err => {
  console.error((err && err.stack) || err);
  process.exit(1);
});
