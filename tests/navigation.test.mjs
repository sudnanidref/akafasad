import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const header = readFileSync(resolve(import.meta.dirname, '../option-2/components/header.html'), 'utf8');

const expectedLinks = [
  ['/layanan/', 'Semua Layanan'],
  ['/layanan/acp-cladding/', 'ACP & Cladding'],
  ['/layanan/curtain-wall-fasad-kaca/', 'Curtain Wall & Fasad Kaca'],
  ['/layanan/pintu-jendela-aluminium/', 'Pintu & Jendela Aluminium']
];

test('shared header exposes an accessible layanan submenu control', () => {
  assert.match(header, /class="nav-submenu-toggle"/);
  assert.match(header, /type="button"/);
  assert.match(header, /aria-expanded="false"/);
  assert.match(header, /aria-controls="layanan-submenu"/);
  assert.match(header, /id="layanan-submenu"/);
  assert.match(header, /aria-label="Submenu Layanan"/);
});

test('layanan submenu keeps overview and all three Ads routes', () => {
  for (const [href, label] of expectedLinks) {
    assert.match(header, new RegExp(`href="${href.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}"[^>]*>${label.replace('&', '&amp;')}`));
  }
  assert.equal((header.match(/class="nav-submenu-link/g) || []).length, 4);
});

test('child layanan links use exact-route active tokens', () => {
  assert.match(header, /\{\{active-path:\/layanan\/acp-cladding\/\}\}/);
  assert.match(header, /\{\{active-path:\/layanan\/curtain-wall-fasad-kaca\/\}\}/);
  assert.match(header, /\{\{active-path:\/layanan\/pintu-jendela-aluminium\/\}\}/);
});
