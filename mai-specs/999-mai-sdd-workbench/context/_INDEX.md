# 素材索引 — 999

| 文件 | 类型 | 来源与原名 | 关键内容摘要 | 收集日期 | 派生自 |
|---|---|---|---|---|---|


## 关键发现

- 来源：工作区《作业一：用 my-ai-infra SDD 为 DSH 开发一个插件.docx》。要求 Fork 并启动 DSH、初始化 my-ai-infra、开发可加载插件，提交代码、README 和同一 Feature 下的需求、设计、评审、测试及验收记录。建议的 SDD 工作台可选择一个小能力，不要求一次做全套平台。
- 来源：工作区《第二篇：企业级AI Coding.pdf》第 6 页。先把需求写成技术设计和测试计划，为 AI 编码提供上下文；第 11 页要求规格、实现、证据使用同一验收标准；第 37、49 页强调验证真实业务结果。
- 用户授权：逐步帮助完成作业，每一步对照课件与作业说明解释。当前切片：DSH 内原生 SDD 工作台，Feature 导航、Markdown 文档查看和手动刷新。
- 代码基线：DSH 0.2.2-rc.3，提交 实施前 HEAD（DSH 0.2.2-rc.3）。my-ai-infra 0.0.15 已初始化，mai doctor 通过。
- 实现约束：通过本地插件 bundle 接入 DSH 已有 main 和 sidebar.panellist 插槽，复用 workspaceFiles 只读接口；不修改 agent loop，不复制 React，不需要模型 API key。

## 开放问题
