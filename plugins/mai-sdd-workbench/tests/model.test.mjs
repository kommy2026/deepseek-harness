import test from 'node:test';
import assert from 'node:assert/strict';
import { artifactPath, briefMetadata, isFeatureName, createReader, appendPage } from '../src/model.js';

test('standard paths support Chinese workspaces and reject traversal or arbitrary documents', () => {
  assert.equal(artifactPath('D:\\课程\\仓库\\', '999-中文需求', 'prd'), 'D:\\课程\\仓库/mai-specs/999-中文需求/spec/PRD.md');
  for (const name of ['999-../secret', '999-x\\..\\secret', '../x', '999-\n', '999-x.']) assert.equal(isFeatureName(name), false);
  assert.throws(() => artifactPath('/repo', '999-valid', '../secret'));
});

test('phase is a declaration; unknown and absent fields do not imply completion', () => {
  assert.deepEqual(briefMetadata('# 中文标题\n\n| Phase | review |', '999-demo'), { title: '中文标题', phase: 'review' });
  assert.equal(briefMetadata('# title\n| Phase | approved |', '999-demo').phase, 'unknown');
  assert.deepEqual(briefMetadata('', '998-demo'), { title: '998-demo', phase: 'unknown' });
});

test('catalog excludes templates and plain files and reads real selected paths on every refresh', async () => {
  const seen = [];
  let title = 'Before';
  const reader = createReader({
    async list(id, path) { assert.equal(path, 'mai-specs'); return { ok: true, value: { truncated: true, entries: [ { name: '_templates', type: 'directory' }, { name: '999-file', type: 'file' }, { name: '998-中文', type: 'directory' }, { name: '999-demo', type: 'directory' } ] } }; },
    async read(id, path) { seen.push(path); return { ok: true, value: { text: `# ${title}\n| Phase | draft |` } }; },
  });
  const first = await reader.loadFeatures('session', '/repo', new AbortController().signal);
  assert.deepEqual(first.value.features.map(item => item.directory), ['999-demo', '998-中文']);
  assert.equal(first.value.truncated, true);
  title = 'After';
  const refreshed = await reader.loadFeatures('session', '/repo', new AbortController().signal);
  assert.equal(refreshed.value.features[0].title, 'After');
  assert.deepEqual(seen.slice(0, 2), ['/repo/mai-specs/999-demo/BRIEF.md', '/repo/mai-specs/998-中文/BRIEF.md']);
});

test('missing directory and denied brief stay explicit failures', async () => {
  const missing = { ok: false, error: { code: 'workspace-file/not-found', message: 'Missing', details: {} } };
  assert.deepEqual(await createReader({ list: async () => missing }).loadFeatures('s', '/repo', new AbortController().signal), { ok: false, code: 'workspace-file/not-found' });
  const denied = await createReader({ list: async () => ({ ok: true, value: { entries: [{ name: '999-x', type: 'directory' }], truncated: false } }), read: async () => ({ ok: false, error: { code: 'access/denied', message: 'Denied', details: {} } }) }).loadFeatures('s', '/repo', new AbortController().signal);
  assert.equal(denied.value.features[0].metadataError, 'access/denied');
  assert.equal(denied.value.features[0].phase, 'unknown');
  assert.deepEqual(await createReader({ read: async () => missing }).readDocument('s', '/repo', '999-demo', 'prd', 1, new AbortController().signal), { ok: false, code: 'workspace-file/not-found' });
});

test('paging joins complete lines and refuses a different file generation', () => {
  const first = { version: 'v1', text: 'line 1\nline 2', lines: 2, nextOffset: 3 };
  assert.equal(appendPage(first, { version: 'v1', text: 'line 3', lines: 1, offset: 3, eof: true }).text, 'line 1\nline 2\nline 3');
  assert.deepEqual(appendPage(first, { version: 'v2', text: 'changed', lines: 1, offset: 3 }), { changed: true });
  assert.deepEqual(appendPage(first, { version: 'v1', text: '', lines: 0, offset: 3, eof: false }), { changed: true });
});
