import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderComponents, activeSection } from '../build/components.mjs';

test('activeSection maps nested article routes to article', () => {
  assert.equal(activeSection('/'), 'home');
  assert.equal(activeSection('/harga/'), 'harga');
  assert.equal(activeSection('/article/detail/index.html'), 'article');
});

test('renderer expands shared components and route active state', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aka-components-'));
  writeFileSync(join(dir, 'header.html'), '<header><a{{active:home}}>Home</a><a{{active:harga}}>Harga</a></header>');
  writeFileSync(join(dir, 'footer.html'), '<footer>Shared</footer>');
  const source = '<!-- component:header --><main>Harga</main><!-- component:footer -->';
  assert.equal(renderComponents(source, dir, '/harga/'), '<header><a>Home</a><a class="active">Harga</a></header><main>Harga</main><footer>Shared</footer>');
});

test('one partial edit updates multiple pages', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aka-components-'));
  const file = join(dir, 'header.html');
  writeFileSync(file, '<header>Version A</header>');
  const page = '<!-- component:header --><main>Unique</main>';
  assert.match(renderComponents(page, dir, '/'), /Version A/);
  assert.match(renderComponents(page, dir, '/kontak/'), /Version A/);
  writeFileSync(file, '<header>Version B</header>');
  assert.match(renderComponents(page, dir, '/'), /Version B/);
  assert.match(renderComponents(page, dir, '/kontak/'), /Version B/);
});

test('missing partial fails visibly', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aka-components-'));
  assert.throws(() => renderComponents('<!-- component:missing -->', dir, '/'), /ENOENT/);
});
