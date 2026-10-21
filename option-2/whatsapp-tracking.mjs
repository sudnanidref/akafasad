export const ADS_TAG_ID = 'AW-18527358827';
export const ADS_DESTINATION = 'AW-18527358827/TnsbCPO51KMdEOuexIJF';

const BOOTSTRAP_FLAG = Symbol.for('aka.googleAds.bootstrap');
const HANDLER_FLAG = Symbol.for('aka.whatsappTracking.handler');

export function isWhatsAppHref(href) {
  try {
    const url = new URL(href, 'https://akafasadkonstruksi.com/');
    return (url.protocol === 'https:' || url.protocol === 'http:') &&
      (url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com');
  } catch {
    return false;
  }
}

export function cleanCanonical(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    url.search = '';
    url.hash = '';
    return url.href;
  } catch {
    return '';
  }
}

export function createWhatsAppTracker(gtag, canonical) {
  const handledEvents = new WeakSet();
  const pageLocation = cleanCanonical(canonical);

  return (href, event) => {
    if (!isWhatsAppHref(href) || !pageLocation) return false;
    if (event && typeof event === 'object') {
      if (handledEvents.has(event)) return false;
      handledEvents.add(event);
    }
    try {
      gtag('event', 'conversion', {
        send_to: ADS_DESTINATION,
        page_location: pageLocation
      });
      return true;
    } catch {
      return false;
    }
  };
}

function authoredCanonical(documentObject) {
  return documentObject.querySelector('link[rel="canonical"]')?.href || '';
}

export function bootstrapGoogleTag(windowObject = window, documentObject = document) {
  if (windowObject[BOOTSTRAP_FLAG]) return windowObject.gtag;
  windowObject[BOOTSTRAP_FLAG] = true;
  windowObject.dataLayer = windowObject.dataLayer || [];
  windowObject.gtag = windowObject.gtag || function gtag() {
    windowObject.dataLayer.push(arguments);
  };
  windowObject.gtag('js', new Date());
  windowObject.gtag('config', ADS_TAG_ID, {
    send_page_view: false,
    page_location: cleanCanonical(authoredCanonical(documentObject))
  });
  return windowObject.gtag;
}

export function initWhatsAppTracking(windowObject = window, documentObject = document) {
  const gtag = bootstrapGoogleTag(windowObject, documentObject);
  if (documentObject[HANDLER_FLAG]) return documentObject[HANDLER_FLAG];

  const track = createWhatsAppTracker(gtag, authoredCanonical(documentObject));
  const handle = event => {
    if (event.defaultPrevented) return;
    if (event.type === 'click' && event.button !== 0) return;
    if (event.type === 'auxclick' && event.button !== 1) return;
    const anchor = event.target?.closest?.('a[href]');
    if (anchor) track(anchor.href, event);
  };

  documentObject.addEventListener('click', handle);
  documentObject.addEventListener('auxclick', handle);
  documentObject[HANDLER_FLAG] = { track, handle };
  return documentObject[HANDLER_FLAG];
}
