import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { sharedComponents } from './build/components.mjs';

export default defineConfig({
  root: 'option-2',
  base: '/',
  plugins: [sharedComponents(resolve(import.meta.dirname, 'option-2/components'))],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'option-2/index.html'),
        tentang: resolve(import.meta.dirname, 'option-2/tentang/index.html'),
        layanan: resolve(import.meta.dirname, 'option-2/layanan/index.html'),
        layananAcpCladding: resolve(import.meta.dirname, 'option-2/layanan/acp-cladding/index.html'),
        layananCurtainWall: resolve(import.meta.dirname, 'option-2/layanan/curtain-wall-fasad-kaca/index.html'),
        layananPintuJendela: resolve(import.meta.dirname, 'option-2/layanan/pintu-jendela-aluminium/index.html'),
        portofolio: resolve(import.meta.dirname, 'option-2/portofolio/index.html'),
        gallery: resolve(import.meta.dirname, 'option-2/gallery/index.html'),
        harga: resolve(import.meta.dirname, 'option-2/harga/index.html'),
        article: resolve(import.meta.dirname, 'option-2/article/index.html'),
        articleCurtainWall: resolve(import.meta.dirname, 'option-2/article/perbedaan-curtain-wall-stick-dan-unitized/index.html'),
        articleSistemCurtainWall: resolve(import.meta.dirname, 'option-2/article/sistem-curtain-wall-stick-alexindo/index.html'),
        kontak: resolve(import.meta.dirname, 'option-2/kontak/index.html')
      }
    }
  }
});
