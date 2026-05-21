import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/motion/') || id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('@radix-ui/')) return 'vendor-radix';
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
          if (id.includes('react-hook-form') || id.includes('@hookform/') || id.includes('zod/')) return 'vendor-forms';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler/')) return 'vendor-react';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
