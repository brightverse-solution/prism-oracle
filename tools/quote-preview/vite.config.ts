import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  base: process.env.GITHUB_ACTIONS ? '/prism-oracle/' : '/',
  server: {
    port: 5173,
    strictPort: true,
  },
});
