<!-- symbiopulse:managed:start -->
# SymbioPulse Autonomous MCP Protocol

Audience: Claude Code.

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
