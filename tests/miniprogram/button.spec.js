const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert');
require('./setup-miniprogram-env');
const simulate = require('miniprogram-simulate');
require('./setup-miniprogram-env').setupUniMpApp();

/**
 * 获取微信小程序构建后的组件路径。
 * 注意事项：运行前需先执行 dev:mp-weixin 或 build:mp-weixin。
 * @returns {string}
 */
function resolveButtonComponentPath() {
  const buildPath = path.resolve(
    process.cwd(),
    'dist/build/mp-weixin/uni_modules/lucky-ui/components/lk-button/lk-button'
  );
  const devPath = path.resolve(
    process.cwd(),
    'dist/dev/mp-weixin/uni_modules/lucky-ui/components/lk-button/lk-button'
  );
  
  if (fs.existsSync(`${buildPath}.json`)) return buildPath;
  if (fs.existsSync(`${devPath}.json`)) return devPath;
  
  return path.resolve(
    process.cwd(),
    'unpackage/dist/dev/mp-weixin/uni_modules/lucky-ui/components/lk-button/lk-button'
  );
}

/**
 * 执行 lk-button 渲染快照测试。
 * 注意事项：构建产物不存在时直接抛错，由上层统一捕获并提示。
 */
function runButtonSnapshotTest() {
  const componentPath = resolveButtonComponentPath();
  assert.ok(fs.existsSync(`${componentPath}.json`), '未检测到小程序构建产物，请先构建 mp-weixin。');

  const component = simulate.load(componentPath);
  const wrapper = simulate.render(component, {
    type: 'primary',
  });
  wrapper.attach(document.createElement('parent-wrapper'));

  const jsonTree = wrapper.toJSON();
  assert.ok(jsonTree, '组件渲染结果为空');
  assert.equal(typeof jsonTree, 'object', '组件渲染结果类型异常');
}

/**
 * 执行 lk-button 小程序 tap 事件绑定测试。
 */
function runButtonTapBindingTest() {
  const componentPath = resolveButtonComponentPath();
  assert.ok(fs.existsSync(`${componentPath}.json`), '未检测到小程序构建产物，请先构建 mp-weixin。');

  const component = simulate.load(componentPath);
  const wrapper = simulate.render(component);
  wrapper.attach(document.createElement('parent-wrapper'));

  const buttonNode = wrapper.querySelector('.lk-button');
  assert.ok(buttonNode, '未找到 lk-button 节点');

  // 检查小程序模板使用 tap 事件承接点击，不回退到 click。
  const jsonTree = wrapper.toJSON();
  const nativeButton = jsonTree.children && jsonTree.children[0];
  assert.ok(nativeButton.event && nativeButton.event.tap, '未检测到 tap 事件绑定');

  assert.ok(buttonNode.dom.className.includes('lk-button'), '小程序按钮类名异常');
}

module.exports = {
  runButtonSnapshotTest,
  runButtonTapBindingTest,
};
