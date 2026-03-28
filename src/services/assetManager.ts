import router from "../router";
import { PRELOAD_IMAGE_ASSET_PATHS, RUNTIME_ASSET_BUILD_STORAGE_KEY, RUNTIME_ASSET_CACHE_NAME, RUNTIME_ASSET_PATHS, TOTAL_RUNTIME_ASSET_COUNT } from "../constants/assets";
import { APP_BUILD_ID } from "../constants/build";

const ASSET_BASE_URL = "/assets";

const normalizeAssetPath = (path: string) => path.replace(/^\/+/, "");

const buildVersionedAssetUrl = (path: string) =>
  `${ASSET_BASE_URL}/${normalizeAssetPath(path)}?v=${encodeURIComponent(
    APP_BUILD_ID
  )}`;

const isHtmlDocument = (content: string) =>
  /^\s*<!doctype html/i.test(content) || /^\s*<html/i.test(content);

const readStoredBuildId = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(RUNTIME_ASSET_BUILD_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to read runtime asset build id.", error);
    return null;
  }
};

const writeStoredBuildId = (value: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(RUNTIME_ASSET_BUILD_STORAGE_KEY, value);
  } catch (error) {
    console.error("Failed to write runtime asset build id.", error);
  }
};

const openAssetCache = () => {
  if (typeof window === "undefined" || typeof caches === "undefined") {
    throw new Error("CacheStorage is not available in this environment.");
  }

  return caches.open(RUNTIME_ASSET_CACHE_NAME);
};

class AssetManager {
  private buildPreparationPromise: Promise<void> | null = null;
  private loadedAssets = 0;
  private imageUrls: string[] = [];

  private async ensureBuildCache() {
    if (!this.buildPreparationPromise) {
      this.buildPreparationPromise = this.prepareBuildCache();
    }

    return this.buildPreparationPromise;
  }

  private async prepareBuildCache() {
    const storedBuildId = readStoredBuildId();
    if (storedBuildId === APP_BUILD_ID) {
      return;
    }

    if (typeof caches !== "undefined") {
      await caches.delete(RUNTIME_ASSET_CACHE_NAME);
    }

    writeStoredBuildId(APP_BUILD_ID);
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

    for (const path of RUNTIME_ASSET_PATHS) {
      try {
        await this.ensureCachedResponse(path);
        this.loadedAssets++;
        onProgress?.(this.loadedAssets, TOTAL_RUNTIME_ASSET_COUNT);
      } catch (error) {
        console.error(`Error loading asset ${path}:`, error);
        throw error;
      }
    }
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
    this.imageUrls = [];
    let loadedCount = 0;

    for (const path of PRELOAD_IMAGE_ASSET_PATHS) {
      await this.ensureCachedResponse(path);
      this.imageUrls.push(this.resolveAssetUrl(path));
      loadedCount++;
      onProgress?.(loadedCount, PRELOAD_IMAGE_ASSET_PATHS.length);
    }
  }

  getPreloadImageUrls(): string[] {
    return [...this.imageUrls];
  }
}

export const assetManager = new AssetManager();
