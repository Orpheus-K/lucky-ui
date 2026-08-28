<!-- symbiopulse:managed:start -->
# SymbioPulse Autonomous MCP Protocol

Audience: Gemini agents.

This project uses SymbioPulse as the MCP-native memory and context layer. When the `symbiopulse` MCP server is available, use it automatically as the first source of project context.

## Mandatory Tool Use

For every codebase question, bug fix, implementation, refactor, explanation, architecture question, or file-location request in this workspace:

1. First call `sym_sniff(intent)` with the user's full request before native file search, grep, semantic search, file reads, or broad code exploration.
2. Do not ask whether to use SymbioPulse. Use it automatically when the `symbiopulse` MCP server is available.
3. Before editing any target file, call `sym_check_dna(file_path)` for that exact path.
4. After a correct answer, investigation, or code change, call `sym_form_synapse(task, file_paths)` with the files that mattered.
5. When a reusable implementation fact is discovered, call `sym_add_skill(file_path, skill_summary)`.
6. When a mistake creates a durable constraint, call `sym_add_dna(target, rule)`.

## Fallback

If MCP tools are not available in the current client, state that SymbioPulse was unavailable, then proceed with native code search. If `sym_sniff` returns no useful target, continue with native search and still call `sym_form_synapse` after the relevant files are known. Do not invent MCP results.
<!-- symbiopulse:managed:end -->

# AI Development Execution Rules
- AI agents assisting in development DO NOT need to run, test, build, or run lint checks unless explicitly mentioned or requested by the user.
- 辅助开发规则：AI在辅助开发时，除非用户主动在对话中提及或明确要求，否则不需要执行项目运行（run）、测试（test）、构建（build）或 lint 检查等相关命令。

# WeChat DevTools Cold Start & Anti-Retry Rule (微信工具冷启动防重试守则)
- **启动时延认知**：微信开发者工具（CLI auto 模式）冷启动拉起进程、加载 NW.js 与编译 WXML 通常需要 20~45 秒。在此期间自动化端口（9420）未就绪属于正常现象，绝非故障报错。
- **严禁循环重试**：严禁 Agent 因启动过程中的短暂未连通而误判为异常，严禁在 60 秒超时窗口内重复调用 CLI 命令、杀进程或发起高频重试。必须信任 MCP Runner 的渐进就绪轮询，保持单次等待。
- **排障先验原则**：若 60 秒后仍无法连通，严禁自行无限重试，必须提示开发者核查：① 微信开发者工具 -> 设置 -> 安全设置 -> 开启【服务端口】；② 工具是否已正常登录并信任当前项目目录。
