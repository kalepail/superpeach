import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: cloudflare(),
    vite: {
        define: {
            "process.env": process.env
        },
    },
    integrations: [tailwind(), svelte()]
});