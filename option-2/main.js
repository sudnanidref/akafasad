const nav = document.querySelector('#nav');
if (nav) addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 30), { passive: true });

const menu = document.querySelector('.menu');
const primaryNav = document.querySelector('.nav-links');
if (menu && primaryNav) {
  menu.addEventListener('click', () => {
    const open = menu.classList.toggle('open'); primaryNav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : '';
  });
  primaryNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open'); primaryNav.classList.remove('open');
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
