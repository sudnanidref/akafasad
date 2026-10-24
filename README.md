# PT AKA Fasad Konstruksi website

Static multi-page Vite website. Source pages live in `option-2/`; production output is generated in `dist/`.

## Shared layout components

The build expands these server-rendered HTML partials:

- `option-2/components/google-tag.html`
- `option-2/components/header.html`
- `option-2/components/footer.html`
- `option-2/components/whatsapp-float.html`

Pages reference them with markers such as `<!-- component:header -->`. The renderer is `build/components.mjs` and is registered in `vite.config.js`. Navigation active state is derived from the current route at build time.

Edit partials—not generated `dist/` files—to update shared markup across all pages. A new page must include the four component markers, unique metadata and main content, a Vite input entry, and a sitemap entry.

## Commands

```bash
npm test
npm run build
```

`npm test` covers component rendering and privacy-safe WhatsApp conversion tracking. Always deploy only the generated `dist/` contents.
