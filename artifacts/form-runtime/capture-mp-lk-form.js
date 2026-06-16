const automator = require(
  process.env.MP_AUTOMATOR
  || `${process.env.TEMP}\\mp-automator\\node_modules\\miniprogram-automator`
);

const wsEndpoint = process.env.MP_AUTOMATOR_WS || 'ws://127.0.0.1:9420';
const route = process.env.MP_FORM_ROUTE
  || `/pages_sub/component-detail/index?name=form&_t=${Date.now()}`;
const rowLimit = Number(process.env.FORM_ROW_LIMIT || 10);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function viewport(miniProgram) {
  return miniProgram.evaluate(() => new Promise(resolve => {
    wx.createSelectorQuery().selectViewport().scrollOffset(res => resolve(res)).exec();
  }));
}

async function callValidate(miniProgram) {
  return miniProgram.evaluate(async () => {
    function find(vm, name) {
      if (!vm) return null;
      const type = vm.$ && vm.$.type;
      const n = (type && (type.name || type.__name))
        || (vm.$options && vm.$options.name)
        || '';
      if (n === name) return vm;
      for (const child of vm.$children || []) {
        const found = find(child, name);
        if (found) return found;
      }
      return null;
    }

    const root = getCurrentPages().slice(-1)[0].$vm;
    const formDemo = find(root, 'form-demo');
    const formRef = formDemo && formDemo.$refs && formDemo.$refs.formRef;

    try {
      await formRef.validate();
      return { status: 'resolved' };
    } catch (e) {
      return {
        status: 'rejected',
        errors: Array.isArray(e)
          ? e.map(x => ({ field: x.field, message: x.message }))
          : String((e && e.message) || e),
      };
    }
  });
}

async function itemSnapshot(page, index) {
  const itemComponents = await page.$$('lk-form-item');
  const itemViews = await page.$$('.lk-form-item');
  const view = itemViews[index];
  const comp = itemComponents[index];
  if (!view) return null;

  const data = comp ? await comp.data().catch(() => ({})) : {};
  const error = await view.$('.lk-form-item__error').catch(() => null);

  return {
    index,
    tag: 'lk-form-item > view.lk-form-item',
    prop: data && (data.o || data.prop),
    label: data && (data.d || data.label),
    class: await view.attribute('class').catch(() => ''),
    text: await view.text().catch(() => ''),
    offset: await view.offset().catch(() => null),
    size: await view.size().catch(() => null),
    errorText: error ? await error.text().catch(() => '') : '',
    outerWxml: (await view.outerWxml().catch(() => '')).slice(0, 360),
  };
}

async function captureRows(page, limit = rowLimit) {
  const rows = [];
  for (let i = 0; i < limit; i += 1) {
    const row = await itemSnapshot(page, i);
    if (row) rows.push(row);
  }
  return rows;
}

(async () => {
  const miniProgram = await automator.connect({ wsEndpoint });
  await miniProgram.reLaunch(route);
  await sleep(2500);

  const page = await miniProgram.currentPage();
  const pageContent = await page.$('.page-content');
  const pageContentInfo = {
    class: await pageContent.attribute('class').catch(() => ''),
    outerWxml: (await pageContent.outerWxml().catch(() => '')).slice(0, 360),
  };
  const initialRows = await captureRows(page, 4);

  await miniProgram.evaluate(() => new Promise(resolve => {
    wx.pageScrollTo({ scrollTop: 1200, duration: 0, complete: resolve });
  }));
  await sleep(250);

  const beforeViewport = await viewport(miniProgram);
  const beforeTitle = await itemSnapshot(page, 2);
  const before = {
    viewport: beforeViewport,
    titleOffset: beforeTitle.offset,
    titleViewportTop: beforeTitle.offset.top - beforeViewport.scrollTop,
  };

  const validate = await callValidate(miniProgram);
  await sleep(1000);

  const afterViewport = await viewport(miniProgram);
  const afterTitle = await itemSnapshot(page, 2);
  const after = {
    viewport: afterViewport,
    titleOffset: afterTitle.offset,
    titleViewportTop: afterTitle.offset.top - afterViewport.scrollTop,
  };
  const errorRows = (await captureRows(page)).filter(row => row.errorText);

  console.log(JSON.stringify({
    target: 'mp-weixin',
    wsEndpoint,
    route,
    pagePath: page.path,
    pageContentInfo,
    before,
    validate,
    after,
    initialRows,
    errorRows,
  }, null, 2));

  await miniProgram.disconnect();
})().catch(err => {
  console.error((err && err.stack) || err);
  process.exit(1);
});
