# SDD workbench / SDD 工作台

[English](README.md) | 中文

在 DSH 原生页面中查看 my-ai-infra 的 Feature、BRIEF、PRD、技术设计、设计评审、代码评审和测试计划。支持中文/英文、Markdown、刷新和分页。界面只读，不调用模型，不需要 API key。

## 安装与使用

1. 使用 Node.js 24.9+、pnpm 11.28.5，按照 DSH 根目录 README 安装依赖并构建；在仓库根目录运行 `pnpm dsh web`。
2. 在 DSH 的 **插件 → 添加插件** 中选择此目录（`plugins/mai-sdd-workbench` 的绝对路径）。仓库已包含构建好的 `client.js`，首次使用无需单独编译插件。
3. 在目标仓库创建 DSH 工作区和会话。仓库根目录运行 `mai init`，通过 my-ai-infra Skill 创建 `mai-specs/NNN-slug`。
4. 从侧栏打开 **SDD 工作台**，选择该会话的工作区、Feature 和文档。工作台选择不会改变当前聊天会话；外部修改文档后点击 **刷新**。
5. 文档尚未读完时点击 **加载更多**；返回聊天点击 **返回对话**。

只适配 my-ai-infra 标准文件路径。自定义 FEATURE_LAYOUT、编辑文档、运行阶段命令、自动监听、Mermaid/数学公式绘制不在本版范围。Phase 只是 BRIEF 声明，不代表验收通过。原始 HTML 显示为文本，图片与本地链接不自动打开。文件访问沿用 DSH 权限；无法读取时检查会话工作区并重试。

## 开发与验证

在本目录运行（使用 npm 的独立锁文件，不修改 DSH 的 pnpm workspace）：

```sh
npm ci --ignore-scripts
npm run build
npm test
```

`react` 仅用于开发测试，运行时由 DSH 提供；`marked` 随浏览器产物打包。开发依赖固定版本，生产加载无外部 CDN。修改构建后重启 DSH，以载入新的浏览器代码。插件在 **插件** 页禁用/启用；DSH 管理 profile 的持久配置，不手动编辑 profile 文件。

真实业务验证步骤及实际结果见 [测试计划](../../mai-specs/999-mai-sdd-workbench/test/TEST_PLAN.md)，需求和设计见 [Feature 简报](../../mai-specs/999-mai-sdd-workbench/BRIEF.md)。测试通过与真实宿主验收分开记录。

## 文件说明

- `src/client.jsx`：DSH 模块与插槽注册、卸载。
- `src/model.js`：标准文档路径、Feature/BRIEF 读取、分页一致性。
- `src/views.jsx`：页面与取消旧请求的交互。
- `src/markdown.js`：marked tokens 转 React，无 HTML 注入。
- `client.js`：可直接安装的浏览器产物，由 build.mjs 生成。
- `tests`：针对性行为验证和本地预期输出。

图标为本作业原创 SVG；DSH 自有界面与 React 均由宿主提供。
