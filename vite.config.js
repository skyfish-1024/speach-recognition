import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        rollupOptions: {
            output: {
                // 确保worker文件被正确打包
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name.endsWith(".worker.js")) {
                        return assetInfo.name;
                    }
                    return `${assetInfo.name}.${assetInfo.ext}`;
                },
            },
        },
    },

    base: "/",
    server: {
        host: "0.0.0.0",
        headers: {
            // 如果需要用到ffmpeg合并视频，需要将COEP和COOP打开，来确保ShareArrayBuffer能够正常使用
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
        },
    },

    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
