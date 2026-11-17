import { ARTIFACTS, appendPage, artifactPath } from './model.js';
import { createMarkdown } from './markdown.js';
import { css } from './styles.js';

/** Construct stable component types once for the DSH lazy module factory. */
export function createViews(React) {
  const { useState, useEffect, useRef } = React;
  const Markdown = createMarkdown(React);
  const selectIds = value => value.ids;
  const selectRows = value => value.byId;

  function Icon({ size = 20 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }

  function Notice({ t, code, root = false }) {
    return <div className="mai-sdd-notice" role="status">{t(code === 'workspace-file/not-found' ? (root ? 'noRoot' : 'missing') : code === 'changed' ? 'changed' : 'error')}{code && code !== 'changed' && code !== 'workspace-file/not-found' ? <p className="mai-sdd-muted">{code}</p> : null}</div>;
  }

  function Workbench({ t, useSessions, loadFeatures, readDocument, back }) {
    const sessions = { ids: useSessions(selectIds), byId: useSessions(selectRows) };
    const available = sessions.ids.filter(id => sessions.byId[id]?.cwd);
    const [pickedSession, setPickedSession] = useState('');
    const sessionId = available.includes(pickedSession) ? pickedSession : available[0];
    const cwd = sessions.byId[sessionId]?.cwd;
    const [feature, setFeature] = useState('');
    const [artifact, setArtifact] = useState('brief');
    const [revision, setRevision] = useState(0);
    const [catalog, setCatalog] = useState({ status: 'loading' });
    const [document, setDocument] = useState({ status: 'loading' });
    const pageRequest = useRef(null);
    const selectionKey = `${sessionId}|${cwd}|${feature}|${artifact}|${revision}`;

    useEffect(() => {
      const controller = new AbortController();
      if (!sessionId || !cwd) return () => controller.abort();
      setCatalog({ status: 'loading' });
      loadFeatures(sessionId, cwd, controller.signal).then(result => {
        if (controller.signal.aborted) return;
        if (!result.ok) { setCatalog({ status: 'error', code: result.code }); setFeature(''); return; }
        setCatalog({ status: 'ready', ...result.value });
        setFeature(previous => result.value.features.some(item => item.directory === previous) ? previous : result.value.features[0]?.directory || '');
      }).catch(error => { if (!controller.signal.aborted) { setCatalog({ status: 'error', code: error.message }); setFeature(''); } });
      return () => controller.abort();
    }, [sessionId, cwd, revision, loadFeatures]);

    useEffect(() => {
      const controller = new AbortController();
      pageRequest.current?.abort();
      setDocument({ status: 'loading', key: selectionKey });
      if (sessionId && cwd && feature) {
        readDocument(sessionId, cwd, feature, artifact, 1, controller.signal).then(result => {
          if (controller.signal.aborted) return;
          setDocument(result.ok ? { status: 'ready', key: selectionKey, ...result.value, nextOffset: result.value.offset + result.value.lines } : { status: 'error', key: selectionKey, code: result.code });
        }).catch(error => { if (!controller.signal.aborted) setDocument({ status: 'error', key: selectionKey, code: error.message }); });
      }
      return () => { controller.abort(); pageRequest.current?.abort(); };
    }, [selectionKey, sessionId, cwd, feature, artifact, readDocument]);

    async function loadMore() {
      if (document.status !== 'ready' || document.pending || document.key !== selectionKey) return;
      const controller = new AbortController();
      pageRequest.current = controller;
      setDocument(previous => ({ ...previous, pending: true, pageError: null }));
      try {
        const result = await readDocument(sessionId, cwd, feature, artifact, document.nextOffset, controller.signal);
        if (controller.signal.aborted) return;
        if (!result.ok) { setDocument(previous => ({ ...previous, pending: false, pageError: result.code })); return; }
        const combined = appendPage(document, result.value);
        setDocument(previous => combined.changed ? { ...previous, pending: false, pageError: 'changed' } : { ...previous, ...combined, pending: false, pageError: null });
      } catch (error) { if (!controller.signal.aborted) setDocument(previous => ({ ...previous, pending: false, pageError: error.message })); }
    }

    const selected = catalog.status === 'ready' ? catalog.features.find(item => item.directory === feature) : null;
    const busy = catalog.status === 'loading' || Boolean(feature && (document.status === 'loading' || document.key !== selectionKey));
    return <section className="mai-sdd" aria-label={t('title')}>
      <style>{css}</style>
      <header><div><h1>{t('title')}</h1><p className="mai-sdd-muted">{t('intro')}</p></div><div className="mai-sdd-controls"><button disabled={!sessionId || busy} onClick={() => setRevision(value => value + 1)}>{t('refresh')}</button><button onClick={back}>{t('back')}</button></div></header>
      {!sessionId ? <p role="status">{t('noSession')}</p> : <>
        <div className="mai-sdd-controls">
          <label>{t('workspace')}<select value={sessionId} onChange={event => { setPickedSession(event.target.value); setFeature(''); }}>{available.map(id => <option key={id} value={id}>{sessions.byId[id].displayTitle} — {sessions.byId[id].cwd}</option>)}</select></label>
          {catalog.status === 'ready' && catalog.features.length ? <label>{t('feature')}<select value={feature} onChange={event => setFeature(event.target.value)}>{catalog.features.map(item => <option key={item.directory} value={item.directory}>{item.title}</option>)}</select></label> : null}
        </div>
        <div className="mai-sdd-path">{cwd}/mai-specs</div>
        {catalog.status === 'loading' ? <div className="mai-sdd-loading" role="status" aria-label={t('loading')}><span className="mai-sdd-spinner" /></div> : catalog.status === 'error' ? <Notice t={t} code={catalog.code} root /> : !catalog.features.length ? <p role="status">{t('empty')}</p> : <>
          {catalog.truncated ? <p role="status">{t('truncated')}</p> : null}
          <div className="mai-sdd-meta"><span>{t('phase')}：{t(selected?.phase || 'unknown')}</span><span className="mai-sdd-muted">{t('declared')}</span></div>
          {selected?.metadataError ? <p role="status">{t('metadata')}</p> : null}
          <nav className="mai-sdd-docs" aria-label={t('document')}>{ARTIFACTS.map(item => <button key={item.id} aria-pressed={artifact === item.id} onClick={() => setArtifact(item.id)}>{t(item.id)}</button>)}</nav>
          <div className="mai-sdd-path">{feature ? artifactPath(cwd, feature, artifact) : ''}</div>
          {document.key !== selectionKey || document.status === 'loading' ? <div className="mai-sdd-loading" role="status" aria-label={t('loading')}><span className="mai-sdd-spinner" /></div> : document.status === 'error' ? <Notice t={t} code={document.code} /> : <>
            {!document.eof ? <p className="mai-sdd-muted" role="status">{t('partial')}</p> : null}
            <Markdown text={document.text} />
            {document.pageError ? <Notice t={t} code={document.pageError} /> : null}
            {!document.eof ? <button disabled={document.pending || document.pageError === 'changed'} onClick={loadMore}>{t('more')}</button> : null}
          </>}
        </>}
      </>}
    </section>;
  }
  return { Workbench, Icon };
}
