# SDD 工作台代码评审

> 日期：2026-11-17；my-review-code 工作区审查；执行者：主 Agent；不是独立人工审批。

## 结论

本版只读能力与 [PRD](../spec/PRD.md) AC-01～06 一致，未发现未关闭的 P0/P1 代码问题。本地业务验收通过，适用仓库检查已执行并完成失败项复验；可进入本次本地交付，不代表已完成 GitHub 提交或发布。

## 范围与基线

基线为实施前 HEAD（DSH 0.2.2-rc.3）；完整对象 ID 已保存于作业目录的 `.setup/sdd-review-baseline.json`，遵循仓库规则不在维护文档中引用 commit hash。初审时检查 unstaged 变更与全部相关 untracked 文件，staged 为空，尚未创建新提交。范围为 `plugins/mai-sdd-workbench`、本 Feature 规格与 README 入口，以及 my-ai-infra 初始化产生的规则入口、配置和忽略清单。对比对象是该 HEAD 加当时的工作区内容。

沿调用链核对 manifest → DSH 插件管理器 → ModuleLoader → sidebar/main slots → useSessions → workspaceFiles.list/read → RemoteResult → Markdown 元素；生命周期沿 ctx.effect 与 slots 所有者清理核对。没有改 agent loop、会话事件、持久类型、Host 文件权限或官方 packages 源码。根规则迁移到 `.agents/rules/AGENTS.md` 的 SHA256 为 `BA8B444B0022149B29C797B56B2E503614036EE918C7BBD27B28C38309E4A1AA`，与迁移前一致。

实际 Git 检查包括 `status --short`、`diff --stat`、`diff --cached --stat`、`ls-files --others --exclude-standard` 和 `diff --check`；后者退出 0。临时验收数据、node_modules、便携工具、DSH 本地 profile 均未列入提交候选。

## 审查与修复复核

| 发现 | 触发与影响 | 最终证据 |
|---|---|---|
| 已关闭 P1：useSessions 缺少 selector | 真实宿主 hook 要求函数，省略导致页面空白 | `src/views.jsx:9` 使用稳定的 ids/byId selector；开发测试断言 selector 为函数，实际页面及重启后读取通过 |
| 已关闭 P1：RemoteResult 失败形状 | 读取失败在 error.code，直接取外层 code 会丢失恢复提示 | `src/model.js:36` 与 `:48` 归一化；missing/denied 自动测试和真实 not-text 页面通过 |
| 已关闭 P1：旧响应与分页版本 | 晚返回覆盖当前选择，或两次读取混拼新旧文件 | `src/views.jsx:35` 起取消并检查 signal、selectionKey 限制呈现；`src/model.js:54` 校验 version/offset；可控乱序和真实跨页修改通过 |
| 已关闭 P1：任意文档路径及活动 Markdown | 文件 API 支持后端读取，不能给任意路径；HTML/图片可能执行活动内容 | `src/model.js:16` 起固定 allowlist 与 basename；`src/markdown.js:25` 起限制链接并将 HTML/图片转为惰性文本；路径与渲染反例测试通过 |
| 已关闭 P2：三级依赖声明与 UI 字重 | 打包 marked 需要保留许可证；h5/h6 应遵循宿主字重规范 | 构建生成 THIRD_PARTY_NOTICES 并列入 files；styles 覆盖 h1～h6 字重 500，最终产物重建并重启 |

以上问题在实现阶段修复，此次复核未修改需求门槛。没有用空断言或放宽预期换取通过。11 项开发测试涵盖真实接口失败形状、Unicode 路径、声明阶段、确定性 Markdown 预期、乱序、恢复、分页、目录状态和无会话前置条件；真实业务执行与局限见 [测试记录](../test/TEST_PLAN.md#实际执行记录2026-11-17)。

## 可复核内容指纹

下表为最终运行代码 SHA256；以后修改这些文件需重新判断相关证据是否仍适用。

| 文件（相对插件目录） | SHA256 |
|---|---|
| client.js | 5BC8030B4BE0ED9001E117BDBB5F979F4EB0EFB8DD06FD408C7497BBD73B1693 |
| src/client.jsx | 52DA0F7A3EDFAF932F3985B2C571DEFBB6A815173A20427F8CE37D12F6DA9264 |
| src/views.jsx | 2FF80BC6B650FDBB44C1967F6AFB7053ECEF16F7C2C3C0450A6585A1502DC8EB |
| src/model.js | 4EC71366A8EB97D64ACF62A6D290C87055A01717FB7EEA3715ACE7BAA233AF2D |
| src/markdown.js | 4593BB9EC2A8E3FD408351543EC1F79F7407CC3D859E4C70AF2FA53BA266E360 |
| src/styles.js | 710B2D47305902D3526186DCB219E0219C8B6EA9A2F85E5BCC6807C81AA631AC |
| src/locales.js | E5ADBFE8CE2340594D045BAC1E42332C45AC29AF74612FE94105E287E09DB84A |
| package-lock.json | 1DDCEE6BC2D1439365C8AB1FA820C271AB707C941055E00A4F9D7CAE984B92C5 |

## 已执行与限制

插件 build、11 项针对性测试、DSH build:check（Host/Client）通过。实际安装、Feature 切换、磁盘刷新、长文分页、错误提示、明暗/中英/窄布局、启停与重启已检查。测试可靠性复核将视图编译改为内存输出，消除独立测试进程共写缓存文件；受控 Promise 验证乱序，私有 React 树卸载并取消 signal，无全局设置、端口、子进程或网络 fixture。

`pnpm run doc-sync` 首轮为 39 通过、4 失败：文档网站构建和 3 个测试被沙箱 symlink EPERM 阻止；新说明存在双语链接/位置与 commit 引用问题。文案修复后全库 pairing 检查 1299 对一致，repository references 通过；宿主 `pnpm run docs:build` 通过，5386 个片段引用可解析；文档网站测试在宿主为 165/166 通过，剩余创建文件符号链接的 `refuses a target whose real path escapes the repository` 用同一断言在管理员进程单独执行通过（1 通过，63 非目标测试跳过）。未修改仓库测试或系统安全设置，未声称首轮 doc-sync 全绿，也未为此重复所有已通过检查。

未执行模型 API、全仓单元测试、全平台矩阵、OS ACL 权限拒绝或真实网络乱序；本版没有新增这些表面的实现。HTML 审阅版的本地文件预览被浏览器策略拦截，只做静态检查，不能声称图表视觉验收完成。工作台只适配标准布局，不声称支持自定义 FEATURE_LAYOUT、编辑、阶段执行或自动监听。没有待验证的必要业务阻塞；后续 Git 提交/推送应使用仓库 pre-push 流程。

## Git 交付复核

用户授权公开提交后，核对并 fetch 真实 Fork master，`change-scope --base origin/master` 确认原始基线一致，实际提交范围为初始化、插件、规格与截图，没有混入工具或临时验收目录。创建 `feat/mai-sdd-workbench` 分支并使用 GitHub 匿名作者邮箱；pre-commit 的双语记录、lint、空白与 vendor guard 全部通过。便携 Git 缺少 bash 命令入口时，确认 sh.exe 是 GNU Bash，再补齐同一二进制入口，没有跳过钩子。正常 pre-push typecheck 的 5 项检查通过，首次 push 后本地与远程引用一致。公开交付位置为 [作业分支](https://github.com/kommy2026/deepseek-harness/tree/feat/mai-sdd-workbench)，不创建面向上游的 PR。
