import { marked } from 'marked';

/** Build a React renderer without HTML injection, image requests or local-file links. */
export function createMarkdown(React) {
  const h = React.createElement;
  function render(tokens = []) {
    return tokens.map((token, key) => {
      const children = () => render(token.tokens || []);
      switch (token.type) {
        case 'space': return null;
        case 'heading': return h(`h${token.depth}`, { key }, children());
        case 'paragraph': return h('p', { key }, children());
        case 'text': return token.tokens ? h(React.Fragment, { key }, children()) : token.text;
        case 'escape': return token.text;
        case 'strong': return h('strong', { key }, children());
        case 'em': return h('em', { key }, children());
        case 'del': return h('del', { key }, children());
        case 'codespan': return h('code', { key }, token.text);
        case 'code': return h('pre', { key, tabIndex: 0 }, h('code', null, token.text));
        case 'br': return h('br', { key });
        case 'hr': return h('hr', { key });
        case 'blockquote': return h('blockquote', { key }, children());
        case 'list': return h(token.ordered ? 'ol' : 'ul', { key, start: token.ordered ? token.start : undefined }, token.items.map((item, index) => h('li', { key: index }, item.task ? (item.checked ? '☑ ' : '☐ ') : null, render(item.tokens))));
        case 'link': {
          const safe = /^(https?:|mailto:)/iu.test(token.href);
          return h(safe ? 'a' : 'span', { key, ...(safe ? { href: token.href, target: '_blank', rel: 'noopener noreferrer' } : {}) }, children());
        }
        case 'image': return h('span', { key }, `[${token.text || token.href}]`);
        case 'html': return h('code', { key }, token.text);
        case 'table': return h('div', { key, className: 'mai-sdd-table' }, h('table', null,
          h('thead', null, h('tr', null, token.header.map((cell, index) => h('th', { key: index }, render(cell.tokens))))),
          h('tbody', null, token.rows.map((row, index) => h('tr', { key: index }, row.map((cell, column) => h('td', { key: column }, render(cell.tokens))))))));
        default: return h(React.Fragment, { key }, token.text || token.raw || '');
      }
    });
  }
  return function Markdown({ text }) {
    return h('div', { className: 'mai-sdd-markdown' }, render(marked.lexer(text, { gfm: true })));
  };
}
