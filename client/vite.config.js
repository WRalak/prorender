import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor libraries
          if (id.includes('react') && id.includes('dom')) {
            return 'vendor';
          }
          if (id.includes('react-router-dom')) {
            return 'vendor';
          }
          // Split React Query
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          // Split UI libraries
          if (id.includes('@heroicons/react') || id.includes('react-hook-form') || id.includes('react-hot-toast')) {
            return 'ui';
          }
          // Split chart libraries
          if (id.includes('recharts') || id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts';
          }
          // Split other large dependencies
          if (id.includes('axios') || id.includes('socket.io-client') || id.includes('date-fns')) {
            return 'utils';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@heroicons/react',
      'react-hook-form',
      'react-hot-toast',
      'axios',
      'socket.io-client',
    ],
  },
})