/** The six standard my-ai-infra document locations. */
export const ARTIFACTS = [
  { id: 'brief', path: 'BRIEF.md' },
  { id: 'prd', path: 'spec/PRD.md' },
  { id: 'design', path: 'design/TECH_DESIGN.md' },
  { id: 'designReview', path: 'review/design_review.md' },
  { id: 'codeReview', path: 'review/code_review.md' },
  { id: 'testPlan', path: 'test/TEST_PLAN.md' },
];

/** Accept a Feature basename, including Unicode slugs, but no path separators. */
export function isFeatureName(name) {
  return /^\d{3}-.+/u.test(name) && !/[/\\\u0000-\u001f]/u.test(name) && name.trim() === name && !/[. ]$/u.test(name);
}

/** Resolve only standard artifact paths under the explicitly selected workspace. */
export function artifactPath(cwd, feature, artifact) {
  const item = ARTIFACTS.find(value => value.id === artifact);
  if (!cwd || !isFeatureName(feature) || !item) throw new Error('Invalid workbench selection');
  return `${cwd.replace(/[/\\]+$/u, '')}/mai-specs/${feature}/${item.path}`;
}

/** Read metadata as declarations; missing or unknown phases never imply success. */
export function briefMetadata(text, directory) {
  const title = text.match(/^#\s+(.+)$/mu)?.[1]?.trim() || directory;
  const declared = text.match(/^\|\s*Phase\s*\|\s*([^|]+)\|/imu)?.[1]?.trim();
  const phase = ['draft', 'ready', 'dev', 'review', 'done'].includes(declared) ? declared : 'unknown';
  return { title, phase };
}

/** Create read-only callbacks over the Host's existing Remote methods. */
export function createReader(files) {
  return {
    async loadFeatures(sessionId, cwd, signal) {
      const result = await files.list(sessionId, 'mai-specs', signal);
      if (!result.ok) return { ok: false, code: result.error.code };
      const names = result.value.entries.filter(entry => entry.type === 'directory' && isFeatureName(entry.name)).map(entry => entry.name).sort().reverse();
      const features = [];
      for (const directory of names) {
        if (signal.aborted) return { ok: false, code: 'cancelled' };
        const brief = await files.read(sessionId, artifactPath(cwd, directory, 'brief'), {}, signal);
        features.push({ directory, ...briefMetadata(brief.ok ? brief.value.text : '', directory), metadataError: brief.ok ? null : brief.error.code });
      }
      return { ok: true, value: { features, truncated: result.value.truncated } };
    },
    async readDocument(sessionId, cwd, feature, artifact, offset, signal) {
      const result = await files.read(sessionId, artifactPath(cwd, feature, artifact), { offset }, signal);
      return result.ok ? result : { ok: false, code: result.error.code };
    },
  };
}

/** Append only pages from the same file generation. */
export function appendPage(previous, next) {
  if (previous.version !== next.version) return { changed: true };
  if (next.offset !== previous.nextOffset || (!next.eof && next.lines === 0)) return { changed: true };
  return { ...next, text: previous.text + (previous.lines && next.lines ? '\n' : '') + next.text, lines: previous.lines + next.lines, nextOffset: next.offset + next.lines };
}
