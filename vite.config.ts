import { defineConfig } from 'vite'
import { sitePages } from './build/pages'

export default defineConfig({
  plugins: [sitePages()],
  build: {
    target: 'es2020',
    // fonts and pictures stay real files: the content security policy allows no data: addresses
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: {
        main: 'index.html',
        machines: 'machines/index.html',
        legal: 'legal/index.html',
        notfound: '404.html',
      },
      output: {
        // the one stylesheet every page shares
        assetFileNames: (a) => (a.names.some((n) => n.endsWith('.css')) ? 'assets/site-[hash][extname]' : 'assets/[name]-[hash][extname]'),
      },
    },
  },
})
