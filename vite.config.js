import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          maps: ['leaflet', 'react-leaflet'],
          pdf: ['jspdf', 'jspdf-autotable'],
          excel: ['xlsx', 'xlsx-js-style'],
          utils: ['axios', 'date-fns', 'dayjs', 'file-saver'],
          ui: [
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            'lucide-react',
          ],
          calendar: [
            '@fullcalendar/daygrid',
            '@fullcalendar/interaction',
            '@fullcalendar/react',
            '@fullcalendar/timegrid',
          ],
        },
      },
    },
  },
});
