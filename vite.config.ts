import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

const assetConfig = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./src/config/asset-config.json", import.meta.url)),
    "utf8"
  )
);
const assetBaseUrl = new URL(assetConfig.baseUrl);
const assetPathPrefix =
  assetBaseUrl.pathname === "/" ? "/" : `${assetBaseUrl.pathname.replace(/\/+$/, "")}/`;
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const runtimeAssetUrlPattern = new RegExp(
  `^${escapeRegex(`${assetBaseUrl.origin}${assetPathPrefix}`)}`
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      strategies: "generateSW",
      injectRegister: null,
      registerType: "prompt",
      includeAssets: [
        "title.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "pwa-maskable-512x512.png",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "雪道",
        short_name: "雪道",
        lang: "ja",
        start_url: "/",
        scope: "/",
        display: "fullscreen",
        theme_color: "#000000",
        background_color: "#000000",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: false,
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: runtimeAssetUrlPattern,
            handler: "CacheFirst",
            options: {
              cacheName: "snow-road-runtime-assets",
              cacheableResponse: {
                statuses: [0, 200],
              },
              rangeRequests: true,
            },
          },
        ],
      },
    }),
  ],
  assetsInclude: ["**/*.bmp"],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  publicDir: "public",
});
