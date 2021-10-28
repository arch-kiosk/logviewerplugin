// noinspection JSUnusedGlobalSymbols

import { defineConfig, searchForWorkspaceRoot, loadEnv } from "vite";
import { injectHtml } from "vite-plugin-html";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, "env");
    return {
        plugins: [injectHtml()],
        build: {
            outDir: "../static/app",
            lib: {
                entry: "src/app.js",
                formats: ["es"],
            },
            // rollupOptions: {
            //     external: /^lit/,
            // },
        },
        server: {
            fs: {
                strict: true,
                allow: [searchForWorkspaceRoot(process.cwd()), "../../static/scripts/kioskapplib"],
            },
        },
        html: {
            injectData: {
                ...env,
            },
        },
    };
});
