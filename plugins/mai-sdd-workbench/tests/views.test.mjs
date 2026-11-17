import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { renderToStaticMarkup } from 'react-dom/server';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createMarkdown } from '../src/markdown.js';
import { dictionaries } from '../src/locales.js';

const compiled = await build({ entryPoints: [fileURLToPath(new URL('../src/views.jsx', import.meta.url))], bundle: true, format: 'esm', platform: 'node', write: false });
const { createViews } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].contents).toString('base64'));
const t = key => dictionaries.zh[key];

test('Markdown renders headings, lists, code and tables while leaving active content inert', () => {
  const Markdown = createMarkdown(React);
  const source = '# Heading\n\n- item\n\n```js\nconst a = 1;\n```\n\n| A | B |\n|---|---|\n| one | two |\n\n<script>alert(1)</script>\n\n![secret](https://invalid.test/image) [bad](javascript:alert(1)) [file](../../secret)';
  const html = renderToStaticMarkup(React.createElement(Markdown, { text: source }));
  assert.match(html, /<h1>Heading<\/h1>/);
  assert.match(html, /<li>item<\/li>/);
  assert.match(html, /<table>/);
  assert.match(html, /const a = 1;/);
  assert.doesNotMatch(html, /<script|<img|href="javascript:|href="\.\.\//);
  assert.match(html, /&lt;script&gt;/);
});

test('Markdown output matches the owner-local expected document', async () => {
  const Markdown = createMarkdown(React);
  const source = await readFile(new URL('expected/document.md', import.meta.url), 'utf8');
  const actual = renderToStaticMarkup(React.createElement(Markdown, { text: source }));
  const expected = (await readFile(new URL('expected/document.html', import.meta.url), 'utf8')).trim();
  assert.equal(actual, expected);
});

test('switching Features cancels old reads and a late response cannot replace the new document', async () => {
  const { Workbench } = createViews(React);
  const pending = [];
  const props = {
    t, back() {}, useSessions: selector => { assert.equal(typeof selector, 'function'); return selector({ ids: ['s'], byId: { s: { cwd: '/repo', displayTitle: 'Workspace' } } }); },
    loadFeatures: async () => ({ ok: true, value: { features: [{ directory: '999-alpha', title: 'Alpha', phase: 'draft' }, { directory: '998-beta', title: 'Beta', phase: 'review' }] } }),
    readDocument(id, cwd, feature, artifact, offset, signal) { return new Promise(resolve => pending.push({ feature, signal, resolve })); },
  };
  let tree;
  await act(async () => { tree = TestRenderer.create(React.createElement(Workbench, props)); });
  assert.equal(pending.length, 1);
  await act(async () => { tree.root.findAllByType('select')[1].props.onChange({ target: { value: '998-beta' } }); });
  assert.equal(pending[0].signal.aborted, true);
  await act(async () => { pending[1].resolve({ ok: true, value: { text: '# BETA-CONTENT', lines: 1, offset: 1, version: 'b', eof: true } }); });
  await act(async () => { pending[0].resolve({ ok: true, value: { text: '# ALPHA-CONTENT', lines: 1, offset: 1, version: 'a', eof: true } }); });
  assert.match(JSON.stringify(tree.toJSON()), /BETA-CONTENT/);
  assert.doesNotMatch(JSON.stringify(tree.toJSON()), /ALPHA-CONTENT/);
  await act(async () => tree.unmount());
  assert.equal(pending[1].signal.aborted, true);
});

test('refresh reads updated content and missing documents show a recoverable notice', async () => {
  const { Workbench } = createViews(React);
  let content = '# BEFORE';
  const props = { t, back() {}, useSessions: selector => { assert.equal(typeof selector, 'function'); return selector({ ids: ['s'], byId: { s: { cwd: '/repo', displayTitle: 'Workspace' } } }); }, loadFeatures: async () => ({ ok: true, value: { features: [{ directory: '999-demo', title: 'Demo', phase: 'draft' }] } }), readDocument: async () => content === null ? { ok: false, code: 'workspace-file/not-found' } : { ok: true, value: { text: content, lines: 1, offset: 1, version: 'v', eof: true } } };
  let tree;
  await act(async () => { tree = TestRenderer.create(React.createElement(Workbench, props)); });
  assert.match(JSON.stringify(tree.toJSON()), /BEFORE/);
  content = '# AFTER';
  await act(async () => { tree.root.findAllByType('button').find(button => button.props.children === t('refresh')).props.onClick(); });
  assert.match(JSON.stringify(tree.toJSON()), /AFTER/);
  assert.doesNotMatch(JSON.stringify(tree.toJSON()), /BEFORE/);
  content = null;
  await act(async () => { tree.root.findAllByType('button').find(button => button.props.children === t('refresh')).props.onClick(); });
  assert.match(JSON.stringify(tree.toJSON()), /此阶段文档尚未生成/);
  await act(async () => tree.unmount());
});

test('empty, missing and truncated catalogs show explicit states without fabricated completion', async () => {
  const { Workbench } = createViews(React);
  const sessions = { ids: ['s'], byId: { s: { cwd: '/repo', displayTitle: 'Workspace' } } };
  const base = { t, back() {}, useSessions: selector => selector(sessions), readDocument: async () => ({ ok: false, code: 'access/denied' }) };
  for (const [catalog, expected] of [
    [{ ok: true, value: { features: [], truncated: false } }, '尚无 Feature'],
    [{ ok: false, code: 'workspace-file/not-found' }, '尚未初始化 my-ai-infra'],
    [{ ok: true, value: { features: [{ directory: '999-demo', title: 'Demo', phase: 'unknown' }], truncated: true } }, '部分 Feature 未显示'],
  ]) {
    let tree;
    await act(async () => { tree = TestRenderer.create(React.createElement(Workbench, { ...base, loadFeatures: async () => catalog })); });
    assert.ok(JSON.stringify(tree.toJSON()).includes(expected));
    if (catalog.ok && catalog.value.features.length) {
      assert.match(JSON.stringify(tree.toJSON()), /access\/denied/);
      assert.match(JSON.stringify(tree.toJSON()), /未标注/);
    }
    await act(async () => tree.unmount());
  }
});

test('no workspace session explains the prerequisite without issuing file reads', async () => {
  const { Workbench } = createViews(React);
  const unexpected = () => { assert.fail('No file access is allowed without a selected session'); };
  let tree;
  await act(async () => { tree = TestRenderer.create(React.createElement(Workbench, { t, back() {}, useSessions: selector => selector({ ids: [], byId: {} }), loadFeatures: unexpected, readDocument: unexpected })); });
  assert.match(JSON.stringify(tree.toJSON()), /请先在目标工作区创建一个会话/);
  assert.equal(tree.root.findAllByType('button')[0].props.disabled, true);
  await act(async () => tree.unmount());
});
