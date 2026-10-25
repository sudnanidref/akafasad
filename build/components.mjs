import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const COMPONENT_MARKER = /<!--\s*component:([a-z][a-z0-9-]*)\s*-->/g;
const ACTIVE_TOKEN = /\{\{active:([a-z][a-z0-9-]*)\}\}/g;
const ACTIVE_PATH_TOKEN = /\{\{active-path:([^}]+)\}\}/g;

function cleanRoute(routePath = '/') {
  const clean = routePath.split(/[?#]/, 1)[0].replace(/\/index\.html$/, '/');
  return clean.endsWith('/') ? clean : `${clean}/`;
}

export function activeSection(routePath = '/') {
  const clean = cleanRoute(routePath);
  const first = clean.split('/').filter(Boolean)[0];
  if (!first || first === 'index.html') return 'home';
  return first === 'article' ? 'article' : first;
}

function renderActiveState(component, routePath) {
  const section = activeSection(routePath);
  const clean = cleanRoute(routePath);
  return component
    .replace(ACTIVE_TOKEN, (_, name) => name === section ? ' class="active"' : '')
    .replace(ACTIVE_PATH_TOKEN, (_, path) => clean === cleanRoute(path) ? ' active' : '');
}

export function renderComponents(html, directory, routePath = '/') {
  return html.replace(COMPONENT_MARKER, (_, name) => {
    const component = readFileSync(resolve(directory, `${name}.html`), 'utf8');
    return renderActiveState(component, routePath);
  });
}

export function sharedComponents(directory) {
  return {
    name: 'shared-static-components',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        return renderComponents(html, directory, context?.path || '/');
      }
    }
  };
}
