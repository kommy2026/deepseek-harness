/** Locale-owned product copy. Phase labels describe the BRIEF declaration only. */
export const dictionaries = {
  zh: {
    title: 'SDD 工作台', refresh: '刷新', back: '返回对话', workspace: '工作区', feature: 'Feature', document: '文档',
    intro: '浏览 mai-specs 标准目录中的需求与过程文件',
    noSession: '请先在目标工作区创建一个会话', noRoot: '此工作区尚未初始化 my-ai-infra，请在仓库根目录运行 mai init',
    empty: '尚无 Feature，请使用 my-create-feature 创建需求', missing: '此阶段文档尚未生成',
    error: '读取失败，请刷新重试', loading: '正在读取', more: '加载更多', partial: '内容尚未读完，以下仅为已加载部分',
    truncated: '目录列表已达到 DSH 上限，部分 Feature 未显示', changed: '文件已变化，请刷新后重新读取',
    phase: '声明阶段', unknown: '未标注', draft: '草稿', ready: '就绪', dev: '开发中', review: '评审中', done: '已完成',
    brief: '需求简报', prd: '产品规格', design: '技术设计', designReview: '设计评审', codeReview: '代码评审', testPlan: '测试计划',
    metadata: '简报读取失败，显示目录名称', declared: '阶段来自 BRIEF，不代表评审或验收已通过', image: '图片：',
  },
  en: {
    title: 'SDD workbench', refresh: 'Refresh', back: 'Back to conversation', workspace: 'Workspace', feature: 'Feature', document: 'Document',
    intro: 'Browse requirements and process files in the standard mai-specs layout',
    noSession: 'Create a session in the target workspace first', noRoot: 'Run mai init in this repository to initialize my-ai-infra',
    empty: 'No Features yet. Create one with my-create-feature', missing: 'This stage document has not been created',
    error: 'Could not read files. Refresh to retry', loading: 'Reading files', more: 'Load more', partial: 'Showing loaded content only; more pages remain',
    truncated: 'The DSH directory limit was reached; some Features are not shown', changed: 'The file changed. Refresh to read it again',
    phase: 'Declared phase', unknown: 'Unspecified', draft: 'Draft', ready: 'Ready', dev: 'Development', review: 'Review', done: 'Done',
    brief: 'Brief', prd: 'Product specification', design: 'Technical design', designReview: 'Design review', codeReview: 'Code review', testPlan: 'Test plan',
    metadata: 'Could not read the brief; showing the directory name', declared: 'Phase comes from BRIEF and does not establish review or acceptance', image: 'Image: ',
  },
};
