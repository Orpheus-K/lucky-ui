---
name: wechat-miniprogram-automation
description: Use when debugging or verifying WeChat Mini Program UI issues in this repo. Prioritize WeChat DevTools CLI plus miniprogram-automator background inspection of routes, WXML, element offset/size, computed styles, and console output; refresh phone preview with auto-preview after fixes.
---

# WeChat Mini Program Automation

Use this workflow for WeChat Mini Program UI bugs, layout spacing issues, component preview defects, or any fix that needs runtime verification in `mp-weixin`.

## Priority Workflow

1. Prefer background automation over foreground screenshots.
2. Resolve the WeChat DevTools CLI path without hardcoding one machine path. Prefer `WECHAT_DEVTOOLS_CLI` when set, then search PATH and common installation roots:

```powershell
$cli = $env:WECHAT_DEVTOOLS_CLI
if (-not $cli) {
  $cli = (Get-Command cli.bat -ErrorAction SilentlyContinue |
    Where-Object { $_.Source -match '微信web开发者工具|wechatwebdevtools|Tencent' } |
    Select-Object -First 1 -ExpandProperty Source)
}
if (-not $cli) {
  $roots = @(
    $env:ProgramFiles,
    ${env:ProgramFiles(x86)},
    $env:LOCALAPPDATA
  ) | Where-Object { $_ -and (Test-Path $_) }
  $cli = Get-ChildItem -Path $roots -Recurse -Filter cli.bat -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -match '微信web开发者工具|wechatwebdevtools|Tencent' } |
    Select-Object -First 1 -ExpandProperty FullName
}
if (-not $cli -and $IsMacOS) {
  $macCandidates = @(
    '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
    '/Applications/微信开发者工具.app/Contents/MacOS/cli'
  )
  $cli = $macCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}
if (-not $cli) { throw 'WeChat DevTools CLI not found. Set WECHAT_DEVTOOLS_CLI to the DevTools CLI path.' }
& $cli auto --project D:/project/ui/dist/dev/mp-weixin --auto-port 9420 --trust-project
```

3. Connect with `miniprogram-automator` and inspect runtime state:
   - current route and query
   - WXML with `outerWxml()`
   - element `offset()` and `size()`
   - computed styles with `style(name)`
   - console output via the automator log channel when relevant
4. Fix based on measured runtime evidence. For spacing issues, prefer component-level fixes or explicit element classes over fragile `> :not(:first-child)` and custom-component sibling selectors.
5. Re-read the affected route and elements after the fix to confirm actual pixel gaps/styles.
6. Run automatic phone preview after a successful fix:

```powershell
& $cli auto-preview --project D:/project/ui/dist/dev/mp-weixin --info-output D:/project/ui/preview-info.json
```

## Connection Failure

If automation cannot connect to `ws://127.0.0.1:9420`, first try starting `auto` again with the CLI command above.

If it still cannot connect, tell the developer to open WeChat DevTools security settings and enable all required automation/CLI/service-port switches, then retry. Do not fall back to disruptive foreground window interaction unless the developer explicitly asks for it.

## Useful Probe Template

```powershell
$env:MP_AUTOMATOR='C:\Users\EDY\AppData\Local\Temp\mp-automator\node_modules\miniprogram-automator'
@'
const automator = require(process.env.MP_AUTOMATOR);
const timeout = (label, promise, ms = 30000) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(label + ' timeout')), ms)),
]);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const miniProgram = await timeout(
    'connect',
    automator.connect({ wsEndpoint: 'ws://127.0.0.1:9420' }),
    12000
  );

  await timeout(
    'route',
    miniProgram.callWxMethod('reLaunch', { url: '/pages/app-main/index?_t=' + Date.now() }),
    60000
  ).catch(err => console.log('route wait:', err.message));

  await sleep(5000);
  const page = await timeout('page', miniProgram.currentPage());
  console.log('route', page.path, JSON.stringify(page.query));

  const el = await page.$('.target-selector');
  if (el) {
    console.log(await el.outerWxml());
    console.log('offset', await el.offset());
    console.log('size', await el.size());
    console.log('margin-left', await el.style('margin-left'));
  }

  miniProgram.disconnect();
})().catch(err => {
  console.error(err.stack || err);
  process.exit(1);
});
'@ | node -
```
