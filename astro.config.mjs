import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import cloudflare from '@astrojs/cloudflare';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: cloudflare(),
    vite: {
        define: {
            "process.env": process.env
        },
        plugins: [
            nodePolyfills({
                include: ['buffer']
            })
        ]
    },
    integrations: [tailwind(), svelte()]
});