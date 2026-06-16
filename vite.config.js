const { defineConfig } = require("vite");
const vue = require("@vitejs/plugin-vue");

module.exports = defineConfig({
    root: "src",
    publicDir: "../public",
    plugins: [vue()],
    build: {
        outDir: "../public",
        emptyOutDir: true
    },
    server: {
        port: 5173,
        proxy: {
            "/api": "http://localhost:3000"
        }
    }
});
