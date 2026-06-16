const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert');
require('./setup-miniprogram-env');
const simulate = require('miniprogram-simulate');
require('./setup-miniprogram-env').setupUniMpApp();

/**
 * 获取微信小程序构建后的组件路径。
 * @param {string} name 组件名
 * @returns {string}
 */
function resolveComponentPath(name) {
  const componentDir = name === 'lk-timeline-item' ? 'lk-timeline' : name;
  const relative = `uni_modules/lucky-ui/components/${componentDir}/${name}`;
  const buildPath = path.resolve(process.cwd(), `dist/build/mp-weixin/${relative}`);
  const devPath = path.resolve(process.cwd(), `dist/dev/mp-weixin/${relative}`);

  if (fs.existsSync(`${buildPath}.json`)) return buildPath;
  return devPath;
}

/**
 * 测试 lk-timeline 基本渲染
 */
function runTimelineBasicTest() {
  const timelinePath = resolveComponentPath('lk-timeline');
  const itemPath = resolveComponentPath('lk-timeline-item');

  assert.ok(fs.existsSync(`${timelinePath}.json`), '未检测到 lk-timeline 构建产物');
  assert.ok(fs.existsSync(`${itemPath}.json`), '未检测到 lk-timeline-item 构建产物');

  const timeline = simulate.render(simulate.load(timelinePath));
  timeline.attach(document.createElement('parent-wrapper'));
  assert.ok(timeline.toJSON(), 'lk-timeline 渲染结果为空');

  const item = simulate.render(simulate.load(itemPath));
  item.attach(document.createElement('parent-wrapper'));

  assert.ok(item.querySelector('.lk-timeline-item'), '未找到 lk-timeline-item 节点');
  assert.ok(item.querySelector('.lk-timeline-item__line'), '默认时间线项应该包含连接线');
}

/**
 * 测试 lk-timeline 状态样式
 */
function runTimelineStatusTest() {
  const itemPath = resolveComponentPath('lk-timeline-item');
  const itemId = simulate.load(itemPath);

  const wrapper = simulate.render(itemId);
  wrapper.attach(document.createElement('parent-wrapper'));

  const itemNode = wrapper.querySelector('.lk-timeline-item');
  assert.ok(itemNode.dom.className.includes('lk-timeline-item'), '时间线项类名异常');

  const jsonTree = wrapper.toJSON();
  const nativeItem = jsonTree.children && jsonTree.children[0];
  assert.ok(nativeItem.event && nativeItem.event.tap, '时间线项未绑定 tap 事件');
}

module.exports = {
  runTimelineBasicTest,
  runTimelineStatusTest,
};
