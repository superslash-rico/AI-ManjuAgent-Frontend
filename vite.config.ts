import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver, ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { lazyImport, VxeResolver } from "vite-plugin-lazy-import";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => {
  // API 端点可通过 VITE_AI_API_BASE_URL 切换，默认 api.yiwuxueshe.cn（原 ricoxueai 为 api.ricoxueai.cn）
  const env = loadEnv(mode, process.cwd(), "");
  const aiApiBaseUrl = env.VITE_AI_API_BASE_URL || "https://api.yiwuxueshe.cn";

  return {
  base: "./",
  plugins: [
    vue(),
    AutoImport({
      dts: "src/types/auto-imports.d.ts",
      imports: ["vue", "pinia", "vue-router"],
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      dts: "src/types/components.d.ts",
      resolvers: [
        AntDesignVueResolver({
          importStyle: false,
        }),
        ElementPlusResolver(),
      ],
    }),
    lazyImport({
      resolvers: [
        VxeResolver({
          libraryName: "vxe-table",
        }),
      ],
    }),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  server: {
    proxy: {
      "/ricoxueai-api": {
        target: aiApiBaseUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ricoxueai-api/, ""),
      },
    },
  },
};
});
