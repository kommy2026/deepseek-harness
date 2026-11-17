# 999: my-ai-infra SDD 工作台

| 项 | 值 |
|---|---|
| Phase | done |
| Profile | standard |
| 优先级 | P1 |
| 负责人 | kommy2026 |
| 目标日期 | 2026-11-17 |
| 涉及子系统 | plugins/mai-sdd-workbench |

## 一句话描述

在 DSH 内浏览当前工作区的 Feature 与规格文档，并手动刷新磁盘内容。

## 背景

完成课程插件作业；让 SDD 过程文件在 DSH 中可见、可读、可核对。

## 关键决策

- 采用标准规格，保留产品、设计、评审、测试与实际验收记录，满足作业过程要求。
- 第一版只读，使用 DSH 原生插槽和现有 workspaceFiles API，不修改 agent loop。
- 有效需求与验收条件唯一维护在 [产品规格](spec/PRD.md)。
- 本版 AC-01～06 已按约定层级通过；需求、设计、实现、评审、11 项开发测试和真实宿主验收均有记录。仓库文档检查失败项已修复或在所需权限环境复验通过；GitHub 提交与推送尚未执行。

## 上下文索引

- [素材索引](context/_INDEX.md)
- [产品规格与验收标准](spec/PRD.md)
- [技术设计](design/TECH_DESIGN.md)
- [设计评审](review/design_review.md)
- [代码评审](review/code_review.md)
- [测试计划与实际结果](test/TEST_PLAN.md)
- [技术方案 HTML 审阅版](design/TECH_DESIGN.html)
