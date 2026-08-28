/**
 * Peekit MCP Runner for lucky-ui (H5 + 微信小程序双端支持 & 慢启动防重试守卫)
 *
 * 核心能力：
 * 1. 自动探测微信开发者工具 CLI 路径（Windows / macOS / 环境变量）
 * 2. 单例进程锁（防止多次重复拉起 DevTools 冲突）
 * 3. 9420 自动化端口 60s 渐进式轮询（抹平 20~45s 冷启动时延，防止 Agent 误报超时）
 * 4. 启动并委托至 @orpheus-k/peekit MCP Server 处理双端运行态探针
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const { spawn, execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const MP_DIST_PATH = path.resolve(PROJECT_ROOT, process.env.PEEKIT_MP_PROJECT || 'dist/dev/mp-weixin');
const LOCK_FILE = path.join(__dirname, '.peekit-mp.lock');
const AUTO_PORT = parseInt(process.env.PEEKIT_MP_PORT || '9420', 10);
const STARTUP_TIMEOUT = parseInt(process.env.PEEKIT_MP_STARTUP_TIMEOUT || '60000', 10);

/**
 * 1. 探测微信开发者工具 CLI 路径
 */
function findWeChatCli() {
  if (process.env.WECHAT_DEVTOOLS_CLI && fs.existsSync(process.env.WECHAT_DEVTOOLS_CLI)) {
    return process.env.WECHAT_DEVTOOLS_CLI;
  }

  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  if (isWin) {
    const candidates = [
      'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
      'C:\\Program Files\\Tencent\\微信web开发者工具\\cli.bat',
      path.join(process.env.LOCALAPPDATA || '', 'Programs\\Tencent\\微信web开发者工具\\cli.bat')
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    try {
      const output = execSync('where cli.bat', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      const lines = output.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        if (/微信|Tencent|wechat/i.test(line) && fs.existsSync(line)) return line;
      }
    } catch (_) {}
  } else if (isMac) {
    const macCandidates = [
      '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
      '/Applications/微信开发者工具.app/Contents/MacOS/cli'
    ];
    for (const c of macCandidates) {
      if (fs.existsSync(c)) return c;
    }
  }
  return null;
}

/**
 * 2. 检查端口连通性
 */
function checkPortOpen(port, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

/**
 * 3. 渐进式轮询等待端口就绪（防 Agent 误判与过早超时）
 */
async function waitForPortReady(port, maxWaitMs = 60000, intervalMs = 2000) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    const isOpen = await checkPortOpen(port);
    if (isOpen) return true;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return false;
}

/**
 * 4. 安全启动微信 DevTools (单例锁 + 启动)
 */
async function ensureWechatDevToolsRunning() {
  const isOpen = await checkPortOpen(AUTO_PORT);
  if (isOpen) {
    return { success: true, message: `端口 ${AUTO_PORT} 已处于就绪状态` };
  }

  // 检查是否已有单例锁在启动中
  if (fs.existsSync(LOCK_FILE)) {
    try {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8') || '{}');
      const lockTime = lockData.time || 0;
      // 锁有效时间 70s 内，复用等待
      if (Date.now() - lockTime < 70000) {
        process.stderr.write(`[Peekit MCP] 检测到已有 DevTools 正在启动中，进入就绪等待...\n`);
        const ready = await waitForPortReady(AUTO_PORT, STARTUP_TIMEOUT);
        if (ready) return { success: true };
        return {
          success: false,
          message: `已有 DevTools 启动任务，但端口 ${AUTO_PORT} 在等待窗口内仍未就绪。为避免重复拉起，本次不再启动新的 CLI。`
        };
      }
    } catch (_) {}
  }

  const cliPath = findWeChatCli();
  if (!cliPath) {
    return {
      success: false,
      message: '未找到微信开发者工具 CLI，请设置 WECHAT_DEVTOOLS_CLI 环境变量或检查安装路径。'
    };
  }

  // 写入单例锁
  fs.writeFileSync(LOCK_FILE, JSON.stringify({ pid: process.pid, time: Date.now() }));

  try {
    process.stderr.write(`[Peekit MCP] 正在拉起微信开发者工具 (项目: ${MP_DIST_PATH}, 端口: ${AUTO_PORT})...\n`);
    process.stderr.write(`[Peekit MCP] 提示：微信开发者工具冷启动通常需 20~45s，已启用 60s 长轮询等待，请勿中断。\n`);

    const child = spawn(cliPath, ['auto', '--project', MP_DIST_PATH, '--auto-port', String(AUTO_PORT), '--trust-project'], {
      detached: true,
      stdio: 'ignore',
      shell: process.platform === 'win32'
    });
    child.unref();

    const ready = await waitForPortReady(AUTO_PORT, STARTUP_TIMEOUT);
    if (ready) {
      process.stderr.write(`[Peekit MCP] 微信开发者工具自动化端口 ${AUTO_PORT} 已成功连接！\n`);
      return { success: true };
    } else {
      return {
        success: false,
        message: `等待微信开发者工具启动超时 (${STARTUP_TIMEOUT / 1000}s)。请检查：1. 微信开发者工具【安全设置】中是否开启【服务端口】；2. 是否手动登录。`
      };
    }
  } finally {
    try {
      if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
    } catch (_) {}
  }
}

/**
 * 5. 主入口：启动 Peekit MCP Server 并桥接 stdio
 */
async function main() {
  const args = process.argv.slice(2);

  // 注入环境变量供 Peekit 消费
  process.env.PEEKIT_H5_URL = process.env.PEEKIT_H5_URL || 'http://localhost:5173';
  process.env.PEEKIT_MP_WS = `ws://127.0.0.1:${AUTO_PORT}`;
  process.env.PEEKIT_MP_PROJECT = MP_DIST_PATH;

  if (process.env.PEEKIT_MP_AUTO_START === 'true') {
    const startup = await ensureWechatDevToolsRunning();
    if (!startup.success) {
      process.stderr.write(`[Peekit MCP] ${startup.message}\n`);
      process.stderr.write('[Peekit MCP] 微信端自动启动未就绪，继续启动 MCP 以保留 H5 探针能力。\n');
    }
  }

  // 启动真实的 Peekit MCP Server
  const peekitPkg = process.env.PEEKIT_BIN || '@orpheus-k/peekit';
  const child = spawn('npx', ['-y', peekitPkg, ...args], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env
  });

  child.on('error', (err) => {
    process.stderr.write(`[Peekit MCP Error] ${err.message}\n`);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(`[Peekit MCP Fatal] ${err.stack || err}\n`);
    process.exit(1);
  });
}

module.exports = {
  findWeChatCli,
  checkPortOpen,
  waitForPortReady,
  ensureWechatDevToolsRunning
};
