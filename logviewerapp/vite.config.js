import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
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
});
