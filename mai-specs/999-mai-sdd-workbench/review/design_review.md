# 设计评审

> 日期：2026-11-17；方式：主 Agent 依据 my-review-design 独立检查设计阶段产物；不是外部人工审批。

结论：**有条件通过，可以开始实施**。只读本地 bundle 与作业范围一致，复用已存在的 DSH 插槽与文件 API，无需新增 Host 服务或修改 agent loop。

依据：[PRD](../spec/PRD.md)、[技术设计](../design/TECH_DESIGN.md)、`packages/api/workspace-files/src/types.ts`、`packages/client/ui-plugin-manager/src/client/index.ts`、`packages/api/session-controller/src/client/sessions/service.ts`。

| 级别 | 发现与触发 | 条件和验证 |
|---|---|---|
| P1 | DSH 的 file read 具有后端读权限，不能假设它自动限制于 workspace；拼接任意路径可能读到其他文件 | 实现必须使用固定 artifact allowlist、验证目录名，测试拒绝路径穿越；没有开放路径输入 |
| P1 | 快速切换、刷新或文件在分页间更新可能显示另一目标或混合版本 | 请求取消并在提交前检查；分页 version 不一致禁止追加；针对性测试 |
| P1 | 设计伪代码正则只允许 ASCII，与 Unicode slug 的文字规则不一致 | 实施采用明确允许 Unicode basename 的验证器并测试；按该文字规则实现属于设计细节落实 |
| 待验证 | 源码契约不能证明插件在运行的 DSH 中已激活 | 安装后执行 AC-01～06；最终结项前必须补真实页面与生命周期证据 |

本次无需数据库、自动阶段执行、后台扫描或自定义配置中心。不存在未解决的 P0；上述 P1 为实施与验收条件，不能在仅有代码或文档时标记通过。HTML 审阅版属于设计说明，不是插件运行界面。

## 实施后复核（2026-11-17）

三个 P1 条件已关闭：`src/model.js` 使用固定 ARTIFACTS 和 Unicode basename 校验，路径穿越/中文目录测试通过；`views.jsx` 在切换与卸载时取消请求，乱序返回测试通过；真实宿主中跨页修改文件触发“文件已变化”，刷新后可读到第 7500 行与末尾标记，不混拼版本。安装、启停、重启和实际页面证据见 [测试结果](../test/TEST_PLAN.md#实际执行记录2026-11-17)。当前设计可以支撑本版范围，未发现新的阻断条件。

HTML 已生成，浏览器工具禁止 `file://`，因此仅静态检查，不声称完成 HTML 图表和窄屏视觉验收；插件本身的真实页面已另行检查。
