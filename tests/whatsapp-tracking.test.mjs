import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADS_DESTINATION,
  cleanCanonical,
  isWhatsAppHref,
  createWhatsAppTracker,
  initWhatsAppTracking
} from '../option-2/whatsapp-tracking.mjs';

test('destination is the approved AKA conversion only', () => {
  assert.equal(ADS_DESTINATION, 'AW-18527358827/TnsbCPO51KMdEOuexIJF');
});

test('accepts only exact WhatsApp HTTPS/HTTP hosts', () => {
  for (const href of ['https://wa.me/6285?text=secret', 'https://api.whatsapp.com/send?phone=6285', 'http://wa.me/6285']) {
    assert.equal(isWhatsAppHref(href), true, href);
  }
  for (const href of ['https://evil.example/?next=https://wa.me/1', 'https://wa.me.evil.example/1', 'javascript:alert(1)', '/kontak/']) {
    assert.equal(isWhatsAppHref(href), false, href);
  }
});

test('canonical page location drops query and hash', () => {
  assert.equal(cleanCanonical('https://akafasadkonstruksi.com/harga/?private=1#secret'), 'https://akafasadkonstruksi.com/harga/');
  assert.equal(cleanCanonical('not a url'), '');
});

test('conversion payload is allowlisted and contains no WhatsApp data', () => {
  const calls = [];
  const track = createWhatsAppTracker((...args) => calls.push(args), 'https://akafasadkonstruksi.com/kontak/?lead=private#x');
  assert.equal(track('https://wa.me/6285781048556?text=PRIVATE_MESSAGE'), true);
  assert.deepEqual(calls, [['event', 'conversion', {
    send_to: 'AW-18527358827/TnsbCPO51KMdEOuexIJF',
    page_location: 'https://akafasadkonstruksi.com/kontak/'
  }]]);
  const serialized = JSON.stringify(calls);
  for (const forbidden of ['PRIVATE_MESSAGE', '6285781048556', 'user_data', 'value', 'currency', 'event_callback']) assert.equal(serialized.includes(forbidden), false, forbidden);
});

test('same event is deduplicated while separate clicks still count', () => {
  const calls = [];
  const track = createWhatsAppTracker((...args) => calls.push(args), 'https://akafasadkonstruksi.com/');
  const first = {};
  assert.equal(track('https://wa.me/1', first), true);
  assert.equal(track('https://wa.me/1', first), false);
  assert.equal(track('https://wa.me/1', {}), true);
  assert.equal(calls.length, 2);
});

test('bootstrap and delegated listeners initialize once with zero page-load conversion', () => {
  const listeners = [];
  const documentObject = {
    querySelector(selector) {
      return selector === 'link[rel="canonical"]' ? { href: 'https://akafasadkonstruksi.com/harga/?private=1#x' } : null;
    },
    addEventListener(type, handler) { listeners.push([type, handler]); }
  };
  const windowObject = {};
  const first = initWhatsAppTracking(windowObject, documentObject);
  const second = initWhatsAppTracking(windowObject, documentObject);
  assert.equal(first, second);
  assert.deepEqual(listeners.map(([type]) => type), ['click', 'auxclick']);
  const commands = windowObject.dataLayer.map(args => Array.from(args));
  assert.equal(commands.filter(x => x[0] === 'config').length, 1);
  assert.equal(commands.filter(x => x[0] === 'event' && x[1] === 'conversion').length, 0);
  assert.deepEqual(commands.find(x => x[0] === 'config').slice(0, 2), ['config', 'AW-18527358827']);
  assert.deepEqual(commands.find(x => x[0] === 'config')[2], {
    send_page_view: false,
    page_location: 'https://akafasadkonstruksi.com/harga/'
  });
});

test('gtag failure is isolated and navigation can remain native', () => {
  const track = createWhatsAppTracker(() => { throw new Error('blocked'); }, 'https://akafasadkonstruksi.com/');
  const event = { defaultPrevented: false, preventDefault() { throw new Error('must not be called'); } };
  assert.equal(track('https://wa.me/1', event), false);
  assert.equal(event.defaultPrevented, false);
});
