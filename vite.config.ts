import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      strategies: "generateSW",
      injectRegister: null,
      registerType: "prompt",
      includeAssets: [
        "assets/sprite/title.png",
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
        display: "standalone",
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
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              url.pathname.startsWith("/assets/"),
            handler: "CacheFirst",
            options: {
              cacheName: "snow-road-runtime-assets",
              cacheableResponse: {
                statuses: [200],
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
  define: {
    __APP_BUILD_ID__: JSON.stringify(
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ??
        process.env.npm_package_version ??
        "dev"
    ),
  },
});
