import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
// import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svelte from "@astrojs/svelte";
// import vercel from "@astrojs/vercel/serverless";
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: cloudflare(),
    // adapter: vercel({
    //     excludeFiles: ["site/**/*"],
    //     webAnalytics: {
    //         enabled: true,
    //     }
    // }),
    // vite: {
    //     plugins: [
    //         nodePolyfills({
    //             include: ['buffer']
    //         })
    //     ]
    // },
    integrations: [tailwind(), svelte()]
});