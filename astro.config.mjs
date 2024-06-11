import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
// import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: vercel({
        excludeFiles: ["site/**/*"],
    }),
    // vite: {
    //     plugins: [
    //         nodePolyfills({
    //             include: ['buffer']
    //         })
    //     ]
    // },
    integrations: [tailwind(), svelte()]
});