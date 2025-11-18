import { defineConfig } from 'astro/config';
import node from '@astrojs/node'; // Asegúrate de importar el adaptador de Node
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  adapter: node({
    mode: 'standalone', // Define el modo como standalone para un VPS.
  }),
  integrations: [tailwind(), react()],
  vite: {
    resolve: {
      alias: [
        {
          find: '@config',
          replacement: '/src/config'
        },
        {
          find: '@components',
          replacement: '/src/components'
        }
      ]
    },
    build: {
      minify: false,
    },
  },
});
