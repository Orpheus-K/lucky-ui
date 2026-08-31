# AI Development Execution Rules
- AI agents assisting in development DO NOT need to run, test, build, or run lint checks unless explicitly mentioned or requested by the user.
- 辅助开发规则：AI在辅助开发时，除非用户主动在对话中提及或明确要求，否则不需要执行项目运行（run）、测试（test）、构建（build）或 lint 检查等相关命令。

# Lucky UI Fix Diagnosis Rule
- 当开发者提出 `fix`、修复界面问题、组件预览问题、样式/交互异常时，必须先讨论并辨别问题归因：这是 `lucky-ui` 组件库自身的默认行为/跨端兼容/props/样式封装问题，还是 demo 预览页、业务页面、局部覆盖样式或示例写法导致的问题。
- 若缺陷会影响开发者复用或组件默认能力，应优先修复 `src/uni_modules/lucky-ui/` 下的组件、主题 token、工具函数或文档示例；若问题只来自 demo 预览组合或页面局部样式，应只修复对应 demo/预览页面，避免把业务兜底样式沉入组件库。
- 在开始修改前，结论需简要说明判断依据，例如：组件默认样式是否正确、页面是否覆盖了组件布局、slot/props 用法是否符合预期、问题是否能在组件独立 demo 中复现。

# WeChat Mini Program Automation Rule
- 调试微信小程序界面、组件预览、间距、样式或运行态问题时，优先使用微信开发者工具 CLI 与 `miniprogram-automator` 后台读取当前 route、WXML、元素 offset/size、computed style 与必要的 console 输出。
- 修复后必须回到对应运行页面重新读取元素样式/尺寸确认，再执行 `auto-preview` 刷新手机预览包。
- 若无法连接自动化端口，先重启 CLI automation；仍失败时，要求开发者在微信开发者工具安全设置中开启全部自动化/CLI/服务端口相关开关后再试。

# WeChat DevTools Cold Start & Anti-Retry Rule (微信工具冷启动防重试守则)
- **启动时延认知**：微信开发者工具（CLI auto 模式）冷启动拉起进程、加载 NW.js 与编译 WXML 通常需要 20~45 秒。在此期间自动化端口（9420）未就绪属于正常现象，绝非故障报错。
- **严禁循环重试**：严禁 Agent 因启动过程中的短暂未连通而误判为异常，严禁在 60 秒超时窗口内重复调用 CLI 命令、杀进程或发起高频重试。必须信任 MCP Runner 的渐进就绪轮询，保持单次等待。
- **排障先验原则**：若 60 秒后仍无法连通，严禁自行无限重试，必须提示开发者核查：① 微信开发者工具 -> 设置 -> 安全设置 -> 开启【服务端口】；② 工具是否已正常登录并信任当前项目目录。

# Runtime Automation Probe Rule
- 当用户提及抓取 H5、抓取h5、H5 运行态、抓取微信小程序、微信小程序运行态、小程序运行态、DOM/WXML、元素结构、样式、尺寸、offset/size/style、交互结果或跨端 UI 对比时，必须使用 `.agents/skills/runtime-automation-probe/SKILL.md`。
- 该 skill 负责基于 Playwright / miniprogram-automator 采集 H5 DOM 与小程序 WXML 的元素结构、样式、尺寸、偏移和交互结果。
