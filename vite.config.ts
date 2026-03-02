import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  // Enable Lovable component tagging only when explicitly requested.
  // This avoids injecting metadata props (data-lov-*) into 3rd-party components
  // like FullCalendar, which can emit noisy "Unknown option" warnings.
  define: {
    __ENABLE_COMPONENT_TAGGER__: JSON.stringify(
      mode === 'development' && process.env.VITE_ENABLE_COMPONENT_TAGGER === 'true'
    ),
  },
  plugins: [
    react(),
    mode === 'development' &&
      process.env.VITE_ENABLE_COMPONENT_TAGGER === 'true' &&
      componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
