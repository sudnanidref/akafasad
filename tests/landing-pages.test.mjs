import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../option-2');
const routes = [
  'layanan/acp-cladding/index.html',
  'layanan/curtain-wall-fasad-kaca/index.html',
  'layanan/pintu-jendela-aluminium/index.html'
];
const waNumber = '6285781048556';

for (const route of routes) {
  test(`${route} has conversion-ready factual structure`, () => {
    const file = resolve(root, route);
    assert.equal(existsSync(file), true);
    const html = readFileSync(file, 'utf8');
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.equal((html.match(/component:google-tag/g) || []).length, 1);
    assert.equal((html.match(/component:header/g) || []).length, 1);
    assert.equal((html.match(/component:footer/g) || []).length, 1);
    assert.equal((html.match(/component:whatsapp-float/g) || []).length, 1);
    assert.match(html, /class="[^"]*hero-whatsapp/);
    assert.match(html, /class="[^"]*service-end-cta/);
    assert.ok((html.match(/<details/g) || []).length >= 3);
    assert.ok((html.match(new RegExp(`https:\\/\\/wa\\.me\\/${waNumber}`, 'g')) || []).length >= 2);
    assert.doesNotMatch(html, /gratis survei|respons?\s+\d+|diskon|sertifikasi|ratusan proyek|testimoni/i);
    for (const src of [...html.matchAll(/(?:src|srcset)="([^"]+)"/g)].flatMap(m => m[1].split(',').map(x => x.trim().split(/\s+/)[0])).filter(x => x.startsWith('/images/'))) {
      assert.equal(existsSync(resolve(root, `public${src}`)), true, `${route}: missing ${src}`);
    }
  });
}

test('price page preserves approved prices and adds service CTAs', () => {
  const html = readFileSync(resolve(root, 'harga/index.html'), 'utf8');
  for (const value of ['Rp900.000/m²','Rp700.000/m²','Rp1.560.000/m²','Rp1.500.000–Rp5.000.000+/set','Rp500.000/m²','Rp800.000/m²','mulai Rp2.958.000']) assert.match(html, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(html, /Quotation final bergantung pada survei, desain dan spesifikasi/);
  assert.equal((html.match(/class="[^"]*price-service-cta/g) || []).length, 3);
  assert.match(html, /class="[^"]*hero-whatsapp/);
});
