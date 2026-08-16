const nav = document.querySelector('#nav');
if (nav) addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 30), { passive: true });

const menu = document.querySelector('.menu');
const mobileNav = document.querySelector('.mobile-nav');
if (menu && mobileNav) {
  menu.addEventListener('click', () => {
    const open = menu.classList.toggle('open'); mobileNav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open'); mobileNav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
  }));
}

const animateNumber = el => {
  const target = +el.dataset.count; const begin = performance.now();
  const frame = now => { const p = Math.min((now-begin)/1200,1); el.textContent = Math.round(target*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
};
const revealTargets = [...document.querySelectorAll('.reveal,.reveal-img,[data-count]')];
const animatedNumbers = new WeakSet();
let observer;
const revealTarget = el => {
  el.classList.add('visible');
  if (el.dataset.count && !animatedNumbers.has(el)) {
    animatedNumbers.add(el);
    animateNumber(el);
  }
  observer?.unobserve(el);
};
const revealPassedTargets = () => {
  const viewportThreshold = innerHeight - 40;
  revealTargets.forEach(el => {
    if (!el.classList.contains('visible') && el.getBoundingClientRect().top <= viewportThreshold) revealTarget(el);
  });
};
if ('IntersectionObserver' in window) {
  observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) revealTarget(entry.target);
  }), { threshold: .14, rootMargin: '0px 0px -40px' });
  revealTargets.forEach(el => observer.observe(el));
}
let revealFrame;
const queuePassedTargetReveal = () => {
  if (revealFrame) return;
  revealFrame = requestAnimationFrame(() => { revealFrame = 0; revealPassedTargets(); });
};
revealPassedTargets();
addEventListener('load', revealPassedTargets, { once: true });
addEventListener('scroll', queuePassedTargetReveal, { passive: true });

const cursor = document.querySelector('.view-cursor');
if(cursor && matchMedia('(pointer:fine)').matches){
  addEventListener('mousemove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'});
  document.querySelectorAll('.cursor-zone').forEach(el=>{el.addEventListener('mouseenter',()=>cursor.classList.add('on'));el.addEventListener('mouseleave',()=>cursor.classList.remove('on'))});
}
const moment = document.querySelector('.moment img');
if(moment) addEventListener('scroll',()=>{const r=moment.parentElement.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)moment.style.transform=`translateY(${r.top*-.035}px)`},{passive:true});

const galleryGrid = document.querySelector('.gallery-grid');
if (galleryGrid) {
  const items = [...galleryGrid.querySelectorAll('.gallery-item')];
  const loadButton = document.querySelector('.gallery-load-more');
  const loadStatus = document.querySelector('.gallery-load-status');
  const batchSize = 12;
  let shown = items.filter(item => !item.hidden).length;
  const hydrate = item => {
    const image = item.querySelector('img');
    if (image.dataset.srcset) { image.srcset = image.dataset.srcset; delete image.dataset.srcset; }
    if (image.dataset.src) { image.src = image.dataset.src; delete image.dataset.src; }
    item.hidden = false;
    requestAnimationFrame(() => item.classList.add('visible'));
  };
  const updateLoadState = () => {
    const count = loadButton?.querySelector('small');
    if (count) count.textContent = `${shown} / ${items.length}`;
    if (loadStatus) loadStatus.textContent = `${shown} dari ${items.length} foto ditampilkan`;
    if (loadButton) loadButton.hidden = shown >= items.length;
  };
  loadButton?.addEventListener('click', () => {
    items.slice(shown, shown + batchSize).forEach(hydrate);
    shown = Math.min(shown + batchSize, items.length);
    updateLoadState();
  });
  updateLoadState();

  const lightbox = document.createElement('div');
  lightbox.className = 'gallery-lightbox';
  lightbox.hidden = true;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Pratinjau foto gallery');
  lightbox.innerHTML = `<div class="gallery-lightbox-toolbar"><button class="gallery-lightbox-control" type="button" data-gallery-zoom-out aria-label="Perkecil foto">−</button><span class="gallery-lightbox-zoom" aria-live="polite">100%</span><button class="gallery-lightbox-control" type="button" data-gallery-zoom-in aria-label="Perbesar foto">+</button><button class="gallery-lightbox-control" type="button" data-gallery-reset aria-label="Reset ukuran foto">↺</button><span class="gallery-lightbox-count"></span></div><button class="gallery-lightbox-control gallery-lightbox-close" type="button" data-gallery-close aria-label="Tutup pratinjau">×</button><div class="gallery-lightbox-stage"><img class="gallery-lightbox-image" alt="Pratinjau foto pekerjaan fasad PT AKA"></div>`;
  document.body.append(lightbox);
  const preview = lightbox.querySelector('.gallery-lightbox-image');
  const stage = lightbox.querySelector('.gallery-lightbox-stage');
  const zoomLabel = lightbox.querySelector('.gallery-lightbox-zoom');
  const countLabel = lightbox.querySelector('.gallery-lightbox-count');
  const zoomIn = lightbox.querySelector('[data-gallery-zoom-in]');
  const zoomOut = lightbox.querySelector('[data-gallery-zoom-out]');
  const closeButton = lightbox.querySelector('[data-gallery-close]');
  let zoom = 1;
  let lastFocus;
  const setZoom = value => {
    zoom = Math.max(1, Math.min(4, Math.round(value * 2) / 2));
    preview.style.setProperty('--gallery-zoom', zoom);
    preview.classList.toggle('is-zoomed', zoom > 1);
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
    zoomOut.disabled = zoom === 1;
    zoomIn.disabled = zoom === 4;
    if (zoom === 1) { stage.scrollLeft = 0; stage.scrollTop = 0; }
  };
  const closeLightbox = () => {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove('gallery-lightbox-open');
    preview.removeAttribute('src');
    lastFocus?.focus();
  };
  const openLightbox = button => {
    const item = button.closest('.gallery-item');
    const image = button.querySelector('img');
    lastFocus = button;
    preview.src = image.dataset.full || image.currentSrc || image.src;
    preview.alt = image.alt;
    countLabel.textContent = `${Number(item.dataset.galleryIndex) + 1} / ${items.length}`;
    setZoom(1);
    lightbox.hidden = false;
    document.body.classList.add('gallery-lightbox-open');
    requestAnimationFrame(() => closeButton.focus());
  };
  galleryGrid.addEventListener('click', event => {
    const button = event.target.closest('.gallery-open');
    if (button) openLightbox(button);
  });
  zoomIn.addEventListener('click', () => setZoom(zoom + .5));
  zoomOut.addEventListener('click', () => setZoom(zoom - .5));
  lightbox.querySelector('[data-gallery-reset]').addEventListener('click', () => setZoom(1));
  closeButton.addEventListener('click', closeLightbox);
  stage.addEventListener('click', event => { if (event.target === stage) closeLightbox(); });
  preview.addEventListener('dblclick', () => setZoom(zoom === 1 ? 2 : 1));
  document.addEventListener('keydown', event => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    else if (event.key === '+' || event.key === '=') setZoom(zoom + .5);
    else if (event.key === '-') setZoom(zoom - .5);
    else if (event.key === '0') setZoom(1);
    else if (event.key === 'Tab') {
      const focusable = [...lightbox.querySelectorAll('button:not([disabled])')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
}

/* TEMP DEV BASE-COLOR SWITCHER — remove this JS block and the matching CSS block to remove the tool. */
(() => {
  const storageKey = 'aka-dev-color-theme-v1';
  const presets = {
    cokelat: { name: 'Cokelat', swatch: '#3a2a20', colors: ['#1d1612','#3a2a20','#29211c','#8a5a36','#a87349','#c9a47b','#d8be9b','#eee2d0','#a99a8c','#dcbe9b'] },
    navy: { name: 'Navy', swatch: '#24364d', colors: ['#101722','#24364d','#1a2533','#42678f','#5b82aa','#91abc4','#b9cad9','#eef3f6','#9daab5'] },
    hijau: { name: 'Hijau', swatch: '#294438', colors: ['#111b17','#294438','#1c3028','#47775f','#639478','#9fbaa7','#c4d2c7','#eef3ed','#9eaaa1'] },
    maroon: { name: 'Maroon', swatch: '#542b35', colors: ['#211116','#542b35','#351d24','#874758','#a96271','#c99aa3','#ddbec4','#f4e9e8','#b3a0a2'] },
    charcoal: { name: 'Charcoal', swatch: '#363b3f', colors: ['#151719','#363b3f','#25292c','#646d73','#818b91','#afb6b9','#ced2d3','#f0f1ef','#a7abad'] }
  };
  const variableNames = ['--espresso','--bronze','--surface','--accent','--copper','--sand','--stone','--ivory','--muted'];
  const root = document.documentElement;
  const hexPattern = /^#[0-9a-f]{6}$/i;
  const setColors = colors => {
    variableNames.forEach((name, index) => root.style.setProperty(name, colors[index]));
    root.style.setProperty('--line', `color-mix(in srgb, ${colors[9] || colors[6]} 18%, transparent)`);
  };
  const hexToHsl = hex => {
    const values = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
    const max = Math.max(...values), min = Math.min(...values), light = (max + min) / 2;
    let hue = 0, saturation = 0;
    if (max !== min) {
      const delta = max - min;
      saturation = delta / (1 - Math.abs(2 * light - 1));
      if (max === values[0]) hue = 60 * (((values[1] - values[2]) / delta) % 6);
      else if (max === values[1]) hue = 60 * ((values[2] - values[0]) / delta + 2);
      else hue = 60 * ((values[0] - values[1]) / delta + 4);
    }
    return [Math.round((hue + 360) % 360), Math.min(72, Math.max(18, Math.round(saturation * 100)))];
  };
  const customColors = hex => {
    const [h, s] = hexToHsl(hex);
    const hsl = (sat, light) => `hsl(${h} ${sat}% ${light}%)`;
    return [hsl(Math.min(s, 38), 9), hsl(Math.min(s, 44), 21), hsl(Math.min(s, 36), 15), hsl(Math.min(s + 8, 58), 38), hsl(Math.min(s + 4, 55), 50), hsl(Math.min(s, 43), 67), hsl(Math.min(s, 36), 78), '#f2eee7', hsl(Math.min(s, 18), 68)];
  };

  const tool = document.createElement('div');
  tool.className = 'dev-color-tool';
  tool.innerHTML = `<button class="dev-color-trigger" type="button" aria-label="Buka pemilih warna dasar" aria-expanded="false" aria-controls="dev-color-panel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2c-3.3 3.7-6.2 7-6.2 10.5a6.2 6.2 0 0 0 12.4 0c0-3.5-2.9-6.8-6.2-10.5Z"/><circle cx="10" cy="13" r="1.35"/><circle cx="14.3" cy="11.6" r="1.35"/><circle cx="13.6" cy="15.7" r="1.35"/></svg></button><section class="dev-color-panel" id="dev-color-panel" aria-labelledby="dev-color-title" hidden><span class="dev-color-kicker">Development tool</span><h2 id="dev-color-title">Pilih base color</h2><div class="dev-color-presets">${Object.entries(presets).map(([id, preset]) => `<button type="button" data-theme="${id}" aria-pressed="false"><i style="--swatch:${preset.swatch}"></i><span>${preset.name}</span></button>`).join('')}</div><label class="dev-color-custom"><span>Warna custom</span><input type="color" value="#334f68" aria-label="Pilih warna custom"></label><button class="dev-color-reset" type="button">Reset ke Cokelat</button><p class="dev-color-status" role="status" aria-live="polite"></p></section>`;
  document.body.append(tool);
  const trigger = tool.querySelector('.dev-color-trigger');
  const panel = tool.querySelector('.dev-color-panel');
  const status = tool.querySelector('.dev-color-status');
  const customInput = tool.querySelector('input[type="color"]');
  const presetButtons = [...tool.querySelectorAll('[data-theme]')];

  const markActive = id => presetButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === id)));
  const announce = message => { status.textContent = ''; requestAnimationFrame(() => { status.textContent = message; }); };
  const applyPreset = (id, persist = true) => {
    const preset = presets[id] || presets.cokelat;
    root.dataset.colorTheme = id in presets ? id : 'cokelat';
    setColors(preset.colors); markActive(id in presets ? id : 'cokelat');
    if (persist) { try { localStorage.setItem(storageKey, JSON.stringify({ type: 'preset', value: id })); } catch (_) {} }
    announce(`Tema ${preset.name} aktif`);
  };
  const applyCustom = (hex, persist = true) => {
    if (!hexPattern.test(hex)) return applyPreset('cokelat', persist);
    root.dataset.colorTheme = 'custom'; setColors(customColors(hex)); markActive(''); customInput.value = hex;
    if (persist) { try { localStorage.setItem(storageKey, JSON.stringify({ type: 'custom', value: hex.toLowerCase() })); } catch (_) {} }
    announce('Tema warna custom aktif');
  };
  const closePanel = returnFocus => {
    panel.hidden = true; trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  };
  trigger.addEventListener('click', () => {
    const opening = panel.hidden; panel.hidden = !opening; trigger.setAttribute('aria-expanded', String(opening));
  });
  presetButtons.forEach(button => button.addEventListener('click', () => applyPreset(button.dataset.theme)));
  customInput.addEventListener('input', () => applyCustom(customInput.value));
  tool.querySelector('.dev-color-reset').addEventListener('click', () => applyPreset('cokelat'));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) closePanel(true); });
  document.addEventListener('pointerdown', event => { if (!panel.hidden && !tool.contains(event.target)) closePanel(false); });
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.type === 'preset' && Object.hasOwn(presets, saved.value)) applyPreset(saved.value, false);
    else if (saved?.type === 'custom' && hexPattern.test(saved.value)) applyCustom(saved.value, false);
    else applyPreset('cokelat', false);
  } catch (_) { applyPreset('cokelat', false); }
})();
/* END TEMP DEV BASE-COLOR SWITCHER */
