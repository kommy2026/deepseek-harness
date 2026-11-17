import { createViews } from './views.jsx';
import { createReader } from './model.js';
import { dictionaries } from './locales.js';

window.__ModuleLoader__.load({
  id: '@local/mai-sdd-workbench',
  factory(require) {
    const { Workbench, Icon } = createViews(require('react'));
    const panel = 'mai-sdd-workbench';
    const namespace = 'maiSddWorkbench';
    return {
      inject: ['slots', 'locale', 'layout', 'sessions', 'remote', 'remote.workspaceFiles'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(namespace, dictionaries));
        const reader = createReader(ctx.remote.workspaceFiles);
        const back = () => ctx.layout.selectPanel(null);
        ctx.effect(() => () => { if (ctx.layout.panelInfo.getSnapshot().activePanelId === panel) back(); });
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: panel, locale: namespace, inject: () => ({ ...reader, back }),
        }, Workbench));
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: panel, order: 20, locale: namespace, label: () => ctx.locale.bind(namespace)('title'),
        }, Icon));
      },
    };
  },
});
