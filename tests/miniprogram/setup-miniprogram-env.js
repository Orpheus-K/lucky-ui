const fs = require('node:fs');
const path = require('node:path');

function requireJsdom() {
  try {
    return require('jsdom');
  } catch {
    const pnpmDir = path.resolve(process.cwd(), 'node_modules/.pnpm');
    const jsdomDir = fs.existsSync(pnpmDir)
      ? fs.readdirSync(pnpmDir).find(name => name.startsWith('jsdom@'))
      : '';
    if (!jsdomDir) throw new Error('未找到 jsdom，无法初始化 miniprogram-simulate DOM 环境');
    return require(path.join(pnpmDir, jsdomDir, 'node_modules/jsdom'));
  }
}

function setupMiniprogramEnv() {
  if (global.window && global.document) return;

  const { JSDOM } = requireJsdom();
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'https://localhost/',
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.Event = dom.window.Event;
  global.CustomEvent = dom.window.CustomEvent;
  global.Element = dom.window.Element;
  global.HTMLElement = dom.window.HTMLElement;
  const appInstance = { globalData: {} };
  global.Page = global.Page || (options => options);
  global.App = global.App || (options => {
    Object.assign(appInstance, options);
    if (typeof appInstance.onLaunch === 'function') {
      appInstance.onLaunch({});
    }
    return appInstance;
  });
  global.getApp = global.getApp || (() => appInstance);
}

function setupUniMpApp() {
  const buildApp = path.resolve(process.cwd(), 'dist/build/mp-weixin/app.js');
  const devApp = path.resolve(process.cwd(), 'dist/dev/mp-weixin/app.js');
  const appPath = fs.existsSync(buildApp) ? buildApp : devApp;
  if (fs.existsSync(appPath)) {
    require(appPath);
  }
}

setupMiniprogramEnv();

module.exports = {
  setupMiniprogramEnv,
  setupUniMpApp,
};
