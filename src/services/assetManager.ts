import router from "../router";
import {
  PRELOAD_IMAGE_ASSET_PATHS,
  RUNTIME_ASSET_CACHE_NAME,
  RUNTIME_ASSET_PATHS,
  RUNTIME_ASSET_VERSION_STORAGE_KEY,
  TOTAL_RUNTIME_ASSET_COUNT,
} from "../constants/assets";
import { ASSET_BASE_URL, ASSET_VERSION } from "../constants/assetConfig";

const MIN_RUNTIME_ASSET_FETCH_CONCURRENCY = 8;
const MAX_RUNTIME_ASSET_FETCH_CONCURRENCY = 16;

const normalizeAssetPath = (path: string) => path.replace(/^\/+/, "");

const buildVersionedAssetUrl = (path: string) =>
  `${ASSET_BASE_URL}/${normalizeAssetPath(path)}?v=${encodeURIComponent(
    ASSET_VERSION
  )}`;

const isHtmlDocument = (content: string) =>
  /^\s*<!doctype html/i.test(content) || /^\s*<html/i.test(content);

const readStoredBuildId = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(RUNTIME_ASSET_VERSION_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to read runtime asset version.", error);
    return null;
  }
};

const writeStoredBuildId = (value: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(RUNTIME_ASSET_VERSION_STORAGE_KEY, value);
  } catch (error) {
    console.error("Failed to write runtime asset version.", error);
  }
};

const openAssetCache = () => {
  if (typeof window === "undefined" || typeof caches === "undefined") {
    throw new Error("CacheStorage is not available in this environment.");
  }

  return caches.open(RUNTIME_ASSET_CACHE_NAME);
};

const getRuntimeAssetFetchConcurrency = () => {
  if (typeof navigator === "undefined") {
    return MIN_RUNTIME_ASSET_FETCH_CONCURRENCY;
  }

  const hardwareConcurrency = navigator.hardwareConcurrency ?? MIN_RUNTIME_ASSET_FETCH_CONCURRENCY;
  return Math.max(
    MIN_RUNTIME_ASSET_FETCH_CONCURRENCY,
    Math.min(MAX_RUNTIME_ASSET_FETCH_CONCURRENCY, hardwareConcurrency * 2)
  );
};

class AssetManager {
  private buildPreparationPromise: Promise<void> | null = null;
  private loadedAssets = 0;
  private imageUrls: string[] = [];

  private async runWithConcurrency(
    paths: readonly string[],
    worker: (path: string, index: number) => Promise<void>
  ) {
    let nextIndex = 0;
    const workerCount = Math.min(getRuntimeAssetFetchConcurrency(), paths.length);

    await Promise.all(
      Array.from({ length: workerCount }, async () => {
        while (true) {
          const currentIndex = nextIndex++;
          if (currentIndex >= paths.length) {
            return;
          }

          await worker(paths[currentIndex], currentIndex);
        }
      })
    );
  }

  private async ensureBuildCache() {
    if (!this.buildPreparationPromise) {
      this.buildPreparationPromise = this.prepareBuildCache();
    }

    return this.buildPreparationPromise;
  }

  private async prepareBuildCache() {
    const storedBuildId = readStoredBuildId();
    if (storedBuildId === ASSET_VERSION) {
      return;
    }

    if (typeof caches !== "undefined") {
      await caches.delete(RUNTIME_ASSET_CACHE_NAME);
    }

    writeStoredBuildId(ASSET_VERSION);
  }

  resolveAssetUrl(path: string) {
    return buildVersionedAssetUrl(path);
  }

  private async fetchAndCache(path: string) {
    const normalizedPath = normalizeAssetPath(path);
    const request = new Request(this.resolveAssetUrl(normalizedPath), {
      cache: "reload",
    });
    const response = await fetch(request);

    if (!response.ok) {
      throw new Error(`Failed to load ${normalizedPath}`);
    }

    if (normalizedPath.startsWith("story/")) {
      const storyText = await response.clone().text();
      if (isHtmlDocument(storyText)) {
        throw new Error(`Story asset resolved to HTML: ${normalizedPath}`);
      }
    }

    const cache = await openAssetCache();
    await cache.put(request, response.clone());
    return response;
  }

  private async ensureCachedResponse(path: string) {
    await this.ensureBuildCache();
    const normalizedPath = normalizeAssetPath(path);
    const request = new Request(this.resolveAssetUrl(normalizedPath));
    const cache = await openAssetCache();
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return this.fetchAndCache(normalizedPath);
  }

  async hasAssets(): Promise<boolean> {
    await this.ensureBuildCache();
    const cache = await openAssetCache();

    for (const path of RUNTIME_ASSET_PATHS) {
      const cachedResponse = await cache.match(this.resolveAssetUrl(path));
      if (!cachedResponse) {
        return false;
      }
    }

    return true;
  }

  async loadAllAssets(onProgress?: (current: number, total: number) => void) {
    await this.ensureBuildCache();
    this.loadedAssets = 0;

    await this.runWithConcurrency(RUNTIME_ASSET_PATHS, async (path) => {
      try {
        await this.ensureCachedResponse(path);
        this.loadedAssets++;
        onProgress?.(this.loadedAssets, TOTAL_RUNTIME_ASSET_COUNT);
      } catch (error) {
        console.error(`Error loading asset ${path}:`, error);
        throw error;
      }
    });
  }

  async readTextAsset(path: string): Promise<string> {
    const normalizedPath = normalizeAssetPath(path);
    const response = await this.ensureCachedResponse(normalizedPath);
    const text = await response.text();

    if (isHtmlDocument(text)) {
      await router.push("/");
      throw new Error(`Asset resolved to HTML instead of text: ${normalizedPath}`);
    }

    return text;
  }

  async preloadAllImages(
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    await this.ensureBuildCache();
    const resolvedImageUrls = new Array<string>(PRELOAD_IMAGE_ASSET_PATHS.length);
    let loadedCount = 0;

    await this.runWithConcurrency(PRELOAD_IMAGE_ASSET_PATHS, async (path, index) => {
      await this.ensureCachedResponse(path);
      resolvedImageUrls[index] = this.resolveAssetUrl(path);
      loadedCount++;
      onProgress?.(loadedCount, PRELOAD_IMAGE_ASSET_PATHS.length);
    });

    this.imageUrls = resolvedImageUrls;
  }

  getPreloadImageUrls(): string[] {
    return [...this.imageUrls];
  }
}

export const assetManager = new AssetManager();
