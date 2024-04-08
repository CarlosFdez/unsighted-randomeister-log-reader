import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    main: {
        build: {
            sourcemap: true,
        },
        plugins: [externalizeDepsPlugin()],
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
    },
    renderer: {
        build: {
            sourcemap: true,
        },
        resolve: {
            alias: {
                "@renderer": resolve("src/renderer"),
            },
        },
        plugins: [react()],
    },
});
