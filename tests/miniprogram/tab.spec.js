const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert');
require('./setup-miniprogram-env');
const simulate = require('miniprogram-simulate');
require('./setup-miniprogram-env').setupUniMpApp();

function resolveTabComponentPath() {
  const buildPath = path.resolve(
    process.cwd(),
    'dist/build/mp-weixin/uni_modules/lucky-ui/components/lk-tab/lk-tab'
  );
  const devPath = path.resolve(
    process.cwd(),
    'dist/dev/mp-weixin/uni_modules/lucky-ui/components/lk-tab/lk-tab'
  );
  
  if (fs.existsSync(`${buildPath}.json`)) return buildPath;
  return devPath;
}

function runTabInitTest() {
  const componentPath = resolveTabComponentPath();
  assert.ok(fs.existsSync(`${componentPath}.json`), '未检测到小程序构建产物，请先构建 mp-weixin。');

  const component = simulate.load(componentPath);
  const wrapper = simulate.render(component, {
    options: [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' }
    ],
    activeIndex: 0,
    modelValue: ''
  });
  wrapper.attach(document.createElement('parent-wrapper'));

  // The active tab should be initialized to the first tab (tab1) because activeIndex is 0
  const activeTab = wrapper.querySelector('.is-active');
  assert.ok(activeTab, '初始化时应有激活的 Tab 项');
  assert.ok(activeTab.dom.innerHTML.includes('Tab 1'), '激活的 Tab 应为 Tab 1');
}

module.exports = {
  runTabInitTest,
};
