const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert');

function buildFreshInputComponent() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'lucky-ui-mp-input-'));
  const outputDir = path.join(tempRoot, 'mp-weixin');
  const cli = require.resolve('@dcloudio/vite-plugin-uni/bin/uni.js');

  try {
    execFileSync(process.execPath, [cli, 'build', '-p', 'mp-weixin'], {
      cwd: process.cwd(),
      env: { ...process.env, UNI_OUTPUT_DIR: outputDir },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const output = [error.stdout, error.stderr]
      .filter(Boolean)
      .map(value => value.toString())
      .join('\n');
    fs.rmSync(tempRoot, { recursive: true, force: true });
    throw new Error(`隔离的微信小程序 Input 构建失败。\n${output}`);
  }

  return {
    componentPath: path.join(outputDir, 'uni_modules/lucky-ui/components/lk-input/lk-input'),
    tempRoot,
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * miniprogram-simulate 1.6.1 cannot evaluate Uni's generated array class binding for LkInput.
 * Build isolated, fresh Uni MP output instead: the native input's disabled data key must be fed
 * by the compiled merged-disabled ref or readonly. Real mounted SFC tests independently prove
 * that the merged ref includes Form.disabled; this test protects only the MP native mapping.
 */
function runInputReadonlyBindingTest() {
  const { componentPath, tempRoot } = buildFreshInputComponent();
  try {
    assert.ok(fs.existsSync(`${componentPath}.json`), '隔离构建未生成微信小程序 Input 产物。');

    const wxml = fs.readFileSync(`${componentPath}.wxml`, 'utf8');
    const javascript = fs.readFileSync(`${componentPath}.js`, 'utf8').replace(/\s+/g, '');
    const nativeInput = wxml.match(/<input\b[^>]*?\sdisabled="\{\{([A-Za-z_$][\w$]*)\}\}"[^>]*>/);
    assert.ok(nativeInput, '微信小程序原生 input 缺少编译后的 disabled 数据绑定。');

    const disabledComputed = javascript.match(
      /([A-Za-z_$][\w$]*)=[A-Za-z_$][\w$]*\.computed\(\(\)=>[A-Za-z_$][\w$]*\.value\|\|[A-Za-z_$][\w$]*\.readonly\)/
    );
    assert.ok(disabledComputed, '微信小程序 Input 未编译出 mergedDisabled || readonly 映射。');

    const disabledDataKey = escapeRegExp(nativeInput[1]);
    const disabledComputedKey = escapeRegExp(disabledComputed[1]);
    assert.match(
      javascript,
      new RegExp(`(?:[,{])${disabledDataKey}:${disabledComputedKey}\\.value(?:[,}])`),
      '原生 input 的 disabled 绑定未连接到 mergedDisabled || readonly 计算值。'
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

module.exports = { runInputReadonlyBindingTest };
