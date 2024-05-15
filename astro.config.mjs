import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      nodePolyfills({
        include: ['buffer'],
      })],
  },
  integrations: [tailwind(), svelte()],
});