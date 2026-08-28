/**
 * Lucky UI PreToolUse Hook Guard
 * 守卫规则：
 * 1. 阻止未经用户主动要求的全局 build / test / 全量 lint 命令 (遵循 AI Development Execution Rules)
 * 2. 保护关键锁文件与敏感配置避免被误覆盖
 * 3. 微信开发者工具 CLI 冷启动防重试节流（防止 30s 内重复拉起造成端口冲突与死循环）
 */
const fs = require('fs');
const path = require('path');

const THROTTLE_FILE = path.join(__dirname, '.cli-throttle.tmp');

let input = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input || '{}');
    const toolCall = payload.toolCall || {};
    const toolName = toolCall.name || '';
    const args = toolCall.args || {};

    // 1. 守卫命令执行 (run_command)
    if (toolName === 'run_command' && args.CommandLine) {
      const cmd = args.CommandLine.trim();

      // 检测重型/未经请求的构建或测试命令
      const isUnsolicitedHeavy = /^(pnpm|npm|yarn|npx)\s+(run\s+)?(build|test|coverage|lint)/i.test(cmd);
      if (isUnsolicitedHeavy) {
        console.log(JSON.stringify({
          decision: 'ask',
          reason: `[Lucky UI 守卫拦截] 检测到重型构建/测试命令 ("${cmd}")。依据项目规则，除非用户明确要求，AI 开发无需主动执行 build/test。`
        }));
        process.exit(0);
      }

      // 微信开发者工具 CLI 冷启动防重入守卫
      const isWechatCliAuto = /cli(\.bat)?\s+auto/i.test(cmd);
      if (isWechatCliAuto) {
        const now = Date.now();
        if (fs.existsSync(THROTTLE_FILE)) {
          try {
            const lastTime = parseInt(fs.readFileSync(THROTTLE_FILE, 'utf8') || '0', 10);
            const diffSeconds = Math.round((now - lastTime) / 1000);
            if (diffSeconds < 30) {
              console.log(JSON.stringify({
                decision: 'deny',
                reason: `[Lucky UI 防重试拦截] 微信开发者工具冷启动通常需 20~45s。距离上次启动仅过去 ${diffSeconds}s，DevTools 进程正在后台拉起与编译中，严禁重复拉起！请耐心等待端口 9420 就绪，切勿误判为执行失败。`
              }));
              process.exit(0);
            }
          } catch (_) {}
        }
        // 记录本次启动时间戳
        try {
          fs.writeFileSync(THROTTLE_FILE, String(now));
        } catch (_) {}
      }
    }

    // 2. 守卫关键文件写入 (write_to_file / replace_file_content)
    if (toolName === 'write_to_file' || toolName === 'replace_file_content') {
      const target = args.TargetFile || '';
      if (target.endsWith('pnpm-lock.yaml') || target.endsWith('package-lock.json') || target.endsWith('yarn.lock')) {
        console.log(JSON.stringify({
          decision: 'ask',
          reason: `[Lucky UI 守卫拦截] 尝试直接修改包管理器 Lock 文件 ("${target}")，请由 pnpm 自动维护。`
        }));
        process.exit(0);
      }
    }

    // 默认放行
    console.log(JSON.stringify({ decision: 'allow' }));
  } catch (err) {
    // 解析异常时不阻塞流程
    console.log(JSON.stringify({ decision: 'allow' }));
  }
});
